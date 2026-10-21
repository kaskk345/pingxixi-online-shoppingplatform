# One-click launcher for pingxixi online shopping platform
# Usage: double-click start.bat, or run: powershell -ExecutionPolicy Bypass -File start.ps1

$root     = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend  = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

function Test-Port([int]$port) {
    $c = New-Object System.Net.Sockets.TcpClient
    try {
        $c.Connect('127.0.0.1', $port)
        return $true
    } catch {
        return $false
    } finally {
        $c.Dispose()
    }
}

function Wait-Port([int]$port, [int]$timeoutSec) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
        if (Test-Port $port) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

Write-Host '=== Pingxixi Online Shopping Platform ===' -ForegroundColor Cyan

# 0. Install frontend dependencies on first run
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    Write-Host '[0/3] Installing frontend dependencies (first run only)...' -ForegroundColor Yellow
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm install' -WorkingDirectory $frontend -Wait -NoNewWindow
}

# 1. Backend :8080
if (Test-Port 8080) {
    Write-Host '[1/3] Backend already running on :8080, skip.' -ForegroundColor Green
} else {
    Write-Host '[1/3] Starting backend on :8080 (first build may take 1-3 min)...' -ForegroundColor Yellow
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', 'mvn spring-boot:run' -WorkingDirectory $backend
    if (Wait-Port 8080 300) {
        Write-Host '      Backend ready.' -ForegroundColor Green
    } else {
        Write-Host '      Backend start timeout, check the backend window for errors.' -ForegroundColor Red
    }
}

# 2. Frontend :5173
if (Test-Port 5173) {
    Write-Host '[2/3] Frontend already running on :5173, skip.' -ForegroundColor Green
} else {
    Write-Host '[2/3] Starting frontend on :5173 ...' -ForegroundColor Yellow
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', 'npm run dev -- --host 0.0.0.0' -WorkingDirectory $frontend
    if (Wait-Port 5173 120) {
        Write-Host '      Frontend ready.' -ForegroundColor Green
    } else {
        Write-Host '      Frontend start timeout, check the frontend window for errors.' -ForegroundColor Red
    }
}

# 3. Open browser
Write-Host '[3/3] Opening http://localhost:5173 ...' -ForegroundColor Cyan
Start-Process 'http://localhost:5173'

Write-Host ''
Write-Host 'Seller admin: http://localhost:5173/login  (admin / admin123)' -ForegroundColor Cyan
Write-Host 'Keep the two console windows open. Close them to stop the system.' -ForegroundColor DarkGray
Start-Sleep -Seconds 3
