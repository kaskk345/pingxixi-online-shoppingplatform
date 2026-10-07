$ws = New-Object -ComObject WScript.Shell
$d = [Environment]::GetFolderPath("Desktop")
$proj = "C:\Users\yuanx\CodeBuddy\20260922075003"

$s = $ws.CreateShortcut("$d\pingxixi 商城.lnk")
$s.TargetPath = "http://localhost:5173"
$s.Description = "pingxixi online shop"
$s.IconLocation = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe,0"
$s.Save()

$s2 = $ws.CreateShortcut("$d\启动 pingxixi.lnk")
$s2.TargetPath = "$proj\启动pingxixi.bat"
$s2.WorkingDirectory = $proj
$s2.Description = "Start backend and frontend servers"
$s2.IconLocation = "C:\Windows\System32\imageres.dll,168"
$s2.Save()

Get-ChildItem $d -Filter "*.lnk" | Where-Object { $_.Name -match "pingxixi" } | Select-Object Name, Length
