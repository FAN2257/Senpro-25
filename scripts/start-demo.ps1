$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot 'backend'
$FrontendDir = Join-Path $RepoRoot 'frontend'
$BackendActivate = Join-Path $BackendDir '.venv\Scripts\Activate.ps1'

if (-not (Test-Path $BackendActivate)) {
    throw "Backend virtualenv not found at $BackendActivate. Create it first with: cd backend; python -m venv .venv"
}

if (-not (Test-Path (Join-Path $FrontendDir 'package.json'))) {
    throw "Frontend package.json not found in $FrontendDir."
}

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', "Set-Location '$BackendDir'; . '$BackendActivate'; python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', "Set-Location '$FrontendDir'; npm run dev"
)

Write-Host 'Backend and frontend launch windows have been opened.'