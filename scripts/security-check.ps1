$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GoExecutable = Join-Path $ProjectRoot '.tools\go\bin\go.exe'
if (-not (Test-Path -LiteralPath $GoExecutable)) {
    $GoExecutable = (Get-Command go -ErrorAction Stop).Source
}
$GoBinDirectory = Split-Path -Parent $GoExecutable
$GoPath = (& $GoExecutable env GOPATH).Trim()
$env:PATH = "$GoBinDirectory;$(Join-Path $GoPath 'bin');$env:PATH"

& $GoExecutable test ./cmd/... ./internal/... ./frontend/...
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $GoExecutable vet ./cmd/... ./internal/... ./frontend/...
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$Govulncheck = Get-Command govulncheck -ErrorAction SilentlyContinue
if ($null -eq $Govulncheck) {
    throw 'govulncheck 未安装。请运行: go install golang.org/x/vuln/cmd/govulncheck@latest'
}
& $Govulncheck.Source ./cmd/... ./internal/... ./frontend/...
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node --test frontend/tests/*.test.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$Gcc = Get-Command gcc -ErrorAction SilentlyContinue
if ($null -ne $Gcc) {
    $env:CGO_ENABLED = '1'
    & $GoExecutable test -race -count=1 ./cmd/... ./internal/... ./frontend/...
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Warning '本机缺少 gcc，未执行 Go race detector；CI 会在 Ubuntu 强制执行。'
}
