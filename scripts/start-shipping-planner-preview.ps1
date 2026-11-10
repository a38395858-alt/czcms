param([int]$Port = 8180, [switch]$Restart)
$ErrorActionPreference = 'Stop'
$plannerRoot = Split-Path -Parent $PSScriptRoot
$plannerDirectory = Join-Path $plannerRoot '.tmp\shipping-planner'
New-Item -ItemType Directory -Force -Path $plannerDirectory | Out-Null
$plannerListener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($plannerListener) {
    $plannerRunning = Get-Process -Id $plannerListener[0].OwningProcess
    $plannerExpected = [System.IO.Path]::GetFullPath((Join-Path $plannerDirectory 'czcms-shipping-planner.exe'))
    if (-not $Restart -or $plannerRunning.Path -ne $plannerExpected) {
        throw "Port $Port is already in use. Use -Restart for this preview or choose another port."
    }
    Stop-Process -Id $plannerRunning.Id
    $plannerRunning.WaitForExit()
}
Push-Location $plannerRoot
try {
    & go build -o (Join-Path $plannerDirectory 'czcms-shipping-planner.exe') ./cmd/czcms
    if ($LASTEXITCODE -ne 0) { throw 'Preview build failed.' }
    $env:CZCMS_ENV = 'development'
    $env:CZCMS_HTTP_ADDR = "127.0.0.1:$Port"
    $env:CZCMS_DB_PATH = Join-Path $plannerDirectory 'preview.db'
    $env:CZCMS_SECRETS_DIR = Join-Path $plannerDirectory 'secrets'
    $env:CZCMS_UPLOAD_DIR = Join-Path $plannerDirectory 'uploads'
    $env:CZCMS_THEME_DIR = Join-Path $plannerDirectory 'themes'
    $env:CZCMS_BACKUP_DIR = Join-Path $plannerDirectory 'backups'
    $env:CZCMS_LOCAL_PREVIEW_LISTENERS = 'false'
    $env:CZCMS_COOKIE_SECURE = 'false'
    $env:CZCMS_PUBLIC_HTTPS = 'false'
    # Go reads proxy environment variables, rather than Windows desktop settings.
    # Use the existing desktop proxy for geocoding in this local preview only.
    if (-not $env:CZCMS_GEOCODER_PROXY_URL -and -not $env:HTTPS_PROXY -and -not $env:https_proxy) {
        $plannerProxy = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
        if ($plannerProxy.ProxyEnable -eq 1 -and $plannerProxy.ProxyServer) {
            $plannerProxyAddress = [string]$plannerProxy.ProxyServer
            if ($plannerProxyAddress -match '=') {
                $plannerProxyEntry = @($plannerProxyAddress -split ';' | Where-Object { $_ -match '^https=' })
                if ($plannerProxyEntry.Count -eq 0) { $plannerProxyEntry = @($plannerProxyAddress -split ';' | Where-Object { $_ -match '^http=' }) }
                if ($plannerProxyEntry.Count -gt 0) { $plannerProxyAddress = ($plannerProxyEntry[0] -split '=', 2)[1] } else { $plannerProxyAddress = '' }
            }
            if ($plannerProxyAddress) {
                if ($plannerProxyAddress -notmatch '^https?://') { $plannerProxyAddress = 'http://' + $plannerProxyAddress }
                $env:CZCMS_GEOCODER_PROXY_URL = $plannerProxyAddress
            }
        }
    }
    $plannerProcess = Start-Process -FilePath (Join-Path $plannerDirectory 'czcms-shipping-planner.exe') -WorkingDirectory $plannerRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $plannerDirectory 'server.stdout.log') -RedirectStandardError (Join-Path $plannerDirectory 'server.stderr.log')
    $plannerProcess.Id | Set-Content (Join-Path $plannerDirectory 'server.pid')
    Write-Output "Preview PID: $($plannerProcess.Id)"
    Write-Output "http://127.0.0.1:$Port/preview/global/tools/shipping-calculator"
} finally { Pop-Location }
