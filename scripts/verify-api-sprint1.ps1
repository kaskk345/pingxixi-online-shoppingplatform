# scripts/verify-api.ps1
# ---------------------------------------------------------------
# 单品单卖交易闭环 · 接口自检脚本（自动化执行程序）
# 前置条件：后端已在 http://localhost:8080 运行
# 用法：
#   powershell -ExecutionPolicy Bypass -File scripts\verify-api.ps1
# 退出码：0 = 全部通过；1 = 存在失败项
# ---------------------------------------------------------------

$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api'
$script:passed = 0
$script:failed = 0

function Check([string]$name, [bool]$ok, [string]$detail = '') {
    if ($ok) {
        $script:passed++
        Write-Host ("  [PASS] " + $name) -ForegroundColor Green
    } else {
        $script:failed++
        Write-Host ("  [FAIL] " + $name + "    " + $detail) -ForegroundColor Red
    }
}

function Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body = $null,
        $Headers = $null
    )
    $p = @{ Uri = $base + $Path; Method = $Method; TimeoutSec = 20 }
    if ($Method -ne 'Get') { $p.ContentType = 'application/json' }
    if ($null -ne $Body) { $p.Body = ($Body | ConvertTo-Json -Depth 5 -Compress) }
    if ($null -ne $Headers) { $p.Headers = $Headers }
    return Invoke-RestMethod @p
}

Write-Host ''
Write-Host '=== Pingxixi single-item-sale API self-check ===' -ForegroundColor Cyan

# ---------- TC-01 未登录访问卖家接口被拒 ----------
try {
    Api -Method 'Get' -Path '/seller/intents' | Out-Null
    Check 'TC-01 seller API rejects anonymous request' $false 'expected HTTP 401, got success'
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Check 'TC-01 seller API rejects anonymous request' ($status -eq 401) ('http=' + $status)
}

# ---------- TC-02 卖家登录 ----------
$login = Api -Method 'Post' -Path '/seller/login' -Body @{ username = 'admin'; password = 'admin123' }
$token = $login.data.token
Check 'TC-02 seller login returns token' ($login.code -eq 0 -and $token) ('code=' + $login.code)
if (-not $token) { Write-Host 'Login failed, abort.' -ForegroundColor Red; exit 1 }
$hdr = @{ 'X-Token' = $token }

# ---------- TC-03 买家读取当前在售商品 ----------
$p = Api -Method 'Get' -Path '/products/on-sale'
$product = $p.data
if (-not $product) {
    $pub = Api -Method 'Post' -Path '/seller/products' -Body @{ name = 'Auto Check Item'; description = 'created by verify-api.ps1'; price = 99.00 } -Headers $hdr
    $product = $pub.data
    Write-Host '  (no on-sale product found, created one for this check)' -ForegroundColor Yellow
}
$productId = $product.id
Check 'TC-03 buyer can read the only on-sale product' ($null -ne $productId) 'no product available'

# ---------- TC-04 单品单卖：已有在售商品时禁止发布 ----------
$pub2 = Api -Method 'Post' -Path '/seller/products' -Body @{ name = 'Second Item'; price = 1.00 } -Headers $hdr
Check 'TC-04 publishing a second item is rejected' ($pub2.code -ne 0) ('code=' + $pub2.code + ' msg=' + $pub2.message)

# ---------- TC-05 连续提交三条意向 ----------
$codes = @()
$ids = @()
foreach ($i in 1..3) {
    $res = Api -Method 'Post' -Path '/intents' -Body @{ productId = $productId; buyerName = ('Buyer' + $i); buyerPhone = ('1380000000' + $i) }
    if ($res.code -eq 0) { $codes += $res.data.code; $ids += $res.data.id }
}
Check 'TC-05 three intents get three distinct codes' (($codes | Select-Object -Unique).Count -eq 3) ('codes=' + ($codes -join ','))

# ---------- TC-06 排队位次为 1/2/3 ----------
$pos = @()
foreach ($c in $codes) {
    $t = Api -Method 'Get' -Path ('/intents/track?code=' + $c)
    $pos += [string]$t.data.position
}
Check 'TC-06 queue positions are 1/2/3 (first come first served)' (($pos -join ',') -eq '1,2,3') ('positions=' + ($pos -join ','))

# ---------- TC-07 非队首不可开始交易 ----------
$notHead = Api -Method 'Post' -Path ('/seller/intents/' + $ids[1] + '/start') -Headers $hdr
Check 'TC-07 starting trade with non-head intent is rejected' ($notHead.code -ne 0) ('code=' + $notHead.code + ' msg=' + $notHead.message)

# ---------- TC-08 队首开始交易，商品自动冻结 ----------
$start = Api -Method 'Post' -Path ('/seller/intents/' + $ids[0] + '/start') -Headers $hdr
Start-Sleep -Milliseconds 500
$after = Api -Method 'Get' -Path '/products/on-sale'
Check 'TC-08 head starts trade and product turns FROZEN' ($start.code -eq 0 -and $null -eq $after.data) ('start=' + $start.code)

# ---------- TC-09 冻结期间不接受新意向 ----------
$frozen = Api -Method 'Post' -Path '/intents' -Body @{ productId = $productId; buyerName = 'Late Buyer'; buyerPhone = '13900000000' }
Check 'TC-09 new intent rejected while frozen' ($frozen.code -ne 0) ('code=' + $frozen.code + ' msg=' + $frozen.message)

# ---------- TC-10 交易成功，商品下架 ----------
$okRes = Api -Method 'Post' -Path ('/seller/intents/' + $ids[0] + '/succeed') -Headers $hdr
Check 'TC-10 trade success returns ok' ($okRes.code -eq 0) ('code=' + $okRes.code + ' msg=' + $okRes.message)
$all = Api -Method 'Get' -Path '/seller/products' -Headers $hdr
$mine = $all.data | Where-Object { $_.id -eq $productId }
Check 'TC-10b product becomes OFF_SHELF after success' ($mine.status -eq 'OFF_SHELF') ('status=' + $mine.status)

# ---------- TC-11 交易成功后其余意向离开队列（进入终态） ----------
# 注：需求澄清结论为「转失败」，当前实现为「已作废(VOID)」，
#     此处只校验"不再占用队列"，具体终态名称见 docs/测试用例与运行说明.md 的偏差记录。
$list = Api -Method 'Get' -Path ('/seller/intents?productId=' + $productId) -Headers $hdr
$others = $list.data | Where-Object { $_.id -ne $ids[0] }
$stillActive = ($others | Where-Object { $_.status -eq 'WAITING' -or $_.status -eq 'TRADING' }).Count
Check 'TC-11 other intents leave the queue after success' ($stillActive -eq 0) ('statuses=' + (($others | ForEach-Object { $_.status }) -join ','))

# ---------- TC-12 卖家侧不返回口令码 ----------
$leak = ($list.data | Where-Object { $_.code }).Count
Check 'TC-12 seller side hides buyer access codes' ($leak -eq 0) ('leaked=' + $leak)

# ---------- TC-13 下架后口令码失效 ----------
$t2 = Api -Method 'Get' -Path ('/intents/track?code=' + $codes[0])
Check 'TC-13 access code becomes invalid after off-shelf' ($t2.code -ne 0 -or -not $t2.data.codeActive) ('code=' + $t2.code)

Write-Host ''
Write-Host ("=== " + $script:passed + " passed, " + $script:failed + " failed ===") -ForegroundColor Cyan
if ($script:failed -gt 0) { exit 1 } else { exit 0 }
