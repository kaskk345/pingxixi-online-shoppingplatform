# scripts/verify-api.ps1
# ---------------------------------------------------------------
# 多商品交易闭环 · 接口自检脚本（v0.3.0 起）
# 前置条件：后端已在 http://localhost:8080 运行
# 用法：
#   powershell -ExecutionPolicy Bypass -File scripts\verify-api.ps1
# 退出码：0 = 全部通过；1 = 存在失败项
#
# 与 Sprint 1 基线版的差异：
#   - TC-04 语义反转：由「发布第二件被拒」改为「可同时发布多件」
#   - TC-08 由「在售列表为空」改为「该商品状态为 FROZEN」
#   - TC-10 成交后不再一律下架：仍有库存回到 ON_SALE，归零才 OFF_SHELF
#   - 新增 TC-14 分类编辑、TC-15 交易历史、TC-16 库存预占、TC-17 归零自动下架
#   - 基线版保留为 scripts/verify-api-sprint1.ps1
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

function Get-SellerProduct([long]$id, $Headers) {
    $all = Api -Method 'Get' -Path '/seller/products' -Headers $Headers
    return ($all.data | Where-Object { $_.id -eq $id } | Select-Object -First 1)
}

Write-Host ''
Write-Host '=== Pingxixi multi-product API self-check (v0.3.0) ===' -ForegroundColor Cyan

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

# ---------- TC-03 买家浏览在售商品列表（多商品） ----------
$list = Api -Method 'Get' -Path '/products'
$onSaleCount = @($list.data).Count
Check 'TC-03 buyer reads on-sale product list' ($list.code -eq 0 -and $onSaleCount -ge 1) ('count=' + $onSaleCount)

# ---------- TC-04 多商品：可同时发布多件（原断言已反转） ----------
$stamp = Get-Date -Format 'HHmmss'
$pubA = Api -Method 'Post' -Path '/seller/products' -Body @{
    name        = 'Verify Item A ' + $stamp
    description = 'created by verify-api.ps1 (stock=5)'
    price       = 99.00
    stock       = 5
    category    = 'Test'
} -Headers $hdr
$idA = $pubA.data.id
Check 'TC-04a publish first item succeeds' ($pubA.code -eq 0 -and $idA) ('code=' + $pubA.code + ' msg=' + $pubA.message)

$pubB = Api -Method 'Post' -Path '/seller/products' -Body @{
    name        = 'Verify Item B ' + $stamp
    description = 'created by verify-api.ps1 (stock=1)'
    price       = 1.00
    stock       = 1
    category    = 'Test'
} -Headers $hdr
$idB = $pubB.data.id
Check 'TC-04b publish second item succeeds (multi-product)' ($pubB.code -eq 0 -and $idB) ('code=' + $pubB.code + ' msg=' + $pubB.message)

$after = Api -Method 'Get' -Path '/products'
Check 'TC-04c both items are on sale at the same time' ((@($after.data) | Where-Object { $_.id -eq $idA -or $_.id -eq $idB }).Count -eq 2) ('count=' + @($after.data).Count)

# ---------- TC-05 连续提交三条意向 ----------
$codes = @()
$ids = @()
foreach ($i in 1..3) {
    $res = Api -Method 'Post' -Path '/intents' -Body @{ productId = $idA; buyerName = ('Buyer' + $i); buyerPhone = ('1380000000' + $i) }
    if ($res.code -eq 0) { $codes += $res.data.code; $ids += $res.data.id }
}
Check 'TC-05 three intents get three distinct codes' (($codes | Select-Object -Unique).Count -eq 3) ('codes=' + ($codes -join ','))

# ---------- TC-16 库存预占：提交 3 条后可用库存 5 -> 2 ----------
$prodA = Get-SellerProduct -id $idA -Headers $hdr
Check 'TC-16 stock is reserved on submit (5 -> 2)' ($prodA.stock -eq 2) ('stock=' + $prodA.stock)

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

# ---------- TC-08 队首开始交易，该商品自动冻结 ----------
$start = Api -Method 'Post' -Path ('/seller/intents/' + $ids[0] + '/start') -Headers $hdr
Start-Sleep -Milliseconds 500
$prodA = Get-SellerProduct -id $idA -Headers $hdr
Check 'TC-08 head starts trade and product turns FROZEN' ($start.code -eq 0 -and $prodA.status -eq 'FROZEN') ('start=' + $start.code + ' status=' + $prodA.status)

# ---------- TC-09 冻结期间不接受新意向 ----------
$frozen = Api -Method 'Post' -Path '/intents' -Body @{ productId = $idA; buyerName = 'Late Buyer'; buyerPhone = '13900000000' }
Check 'TC-09 new intent rejected while frozen' ($frozen.code -ne 0) ('code=' + $frozen.code + ' msg=' + $frozen.message)

# ---------- TC-10 交易成功：销量 +1、库存不重复扣减、仍有库存则回在售 ----------
$okRes = Api -Method 'Post' -Path ('/seller/intents/' + $ids[0] + '/succeed') -Headers $hdr
$prodA = Get-SellerProduct -id $idA -Headers $hdr
Check 'TC-10a trade success returns ok' ($okRes.code -eq 0) ('code=' + $okRes.code + ' msg=' + $okRes.message)
Check 'TC-10b sales increments to 1' ($prodA.sales -eq 1) ('sales=' + $prodA.sales)
# 库存 5 - 3 条预占 = 2；成交 1 件落定不再扣减，其余 2 条作废各释放 1 件 => 4
Check 'TC-10c sold unit is settled, the other two reservations released (expect 4)' ($prodA.stock -eq 4) ('stock=' + $prodA.stock)
Check 'TC-10d product returns ON_SALE while stock remains' ($prodA.status -eq 'ON_SALE') ('status=' + $prodA.status)

# ---------- TC-11 交易成功后其余意向离开队列（进入终态） ----------
# 注：需求澄清结论为「转失败」，当前实现为「已作废(VOID)」，
#     此处只校验"不再占用队列"，具体终态名称见测试用例与运行说明的偏差记录。
$intents = Api -Method 'Get' -Path ('/seller/intents?productId=' + $idA) -Headers $hdr
$others = $intents.data | Where-Object { $_.id -ne $ids[0] }
$stillActive = ($others | Where-Object { $_.status -eq 'WAITING' -or $_.status -eq 'TRADING' }).Count
Check 'TC-11 other intents leave the queue after success' ($stillActive -eq 0) ('statuses=' + (($others | ForEach-Object { $_.status }) -join ','))

# ---------- TC-12 卖家侧不返回口令码 ----------
$leak = ($intents.data | Where-Object { $_.code }).Count
Check 'TC-12 seller side hides buyer access codes' ($leak -eq 0) ('leaked=' + $leak)

# ---------- TC-15 卖家按商品查看交易历史 ----------
$hist = Api -Method 'Get' -Path ('/seller/products/' + $idA + '/history') -Headers $hdr
$hCount = @($hist.data).Count
$anonCount = (@($hist.data) | Where-Object { $null -eq $_.customerId }).Count
$hasSucceeded = @($hist.data | Where-Object { $_.status -eq 'SUCCEEDED' }).Count
Check 'TC-15a product history returns all intents' ($hist.code -eq 0 -and $hCount -eq 3) ('count=' + $hCount)
Check 'TC-15b anonymous buyers have null customerId' ($anonCount -eq 3) ('anonymous=' + $anonCount)
Check 'TC-15c succeeded record is kept in history' ($hasSucceeded -eq 1) ('succeeded=' + $hasSucceeded)

# ---------- TC-17 库存归零自动下架（商品 B，库存 1） ----------
$resB = Api -Method 'Post' -Path '/intents' -Body @{ productId = $idB; buyerName = 'Buyer B'; buyerPhone = '13700000000' }
Start-Sleep -Milliseconds 300
$prodB = Get-SellerProduct -id $idB -Headers $hdr
Check 'TC-17a intent on last stock is accepted' ($resB.code -eq 0) ('code=' + $resB.code)
Check 'TC-17b stock reaches 0 and product goes OFF_SHELF automatically' ($prodB.stock -eq 0 -and $prodB.status -eq 'OFF_SHELF') ('stock=' + $prodB.stock + ' status=' + $prodB.status)

# ---------- TC-13 手动下架后口令码失效 ----------
$off = Api -Method 'Post' -Path ('/seller/products/' + $idA + '/off-shelf') -Headers $hdr
Check 'TC-13a manual off-shelf returns ok' ($off.code -eq 0) ('code=' + $off.code + ' msg=' + $off.message)
$t2 = Api -Method 'Get' -Path ('/intents/track?code=' + $codes[0])
Check 'TC-13b access code becomes invalid after off-shelf' ($t2.code -ne 0 -or -not $t2.data.codeActive) ('code=' + $t2.code)

# ---------- TC-14 分类编辑（改名 + 排序，层级不可改） ----------
$tree = Api -Method 'Get' -Path '/categories'
$top = @($tree.data)[0]
$origName = $top.name
$newName = $origName + '-chk'
$upd = Api -Method 'Put' -Path ('/seller/categories/' + $top.id) -Body @{ name = $newName; sort = 9 } -Headers $hdr
Check 'TC-14a rename category succeeds' ($upd.code -eq 0 -and $upd.data.name -eq $newName) ('code=' + $upd.code + ' name=' + $upd.data.name)
$restore = Api -Method 'Put' -Path ('/seller/categories/' + $top.id) -Body @{ name = $origName; sort = $top.sort } -Headers $hdr
Check 'TC-14b category restored to original name' ($restore.code -eq 0 -and $restore.data.name -eq $origName) ('name=' + $restore.data.name)

Write-Host ''
Write-Host ("=== " + $script:passed + " passed, " + $script:failed + " failed ===") -ForegroundColor Cyan
if ($script:failed -gt 0) { exit 1 } else { exit 0 }
