$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot 'backend'
$VenvActivate = Join-Path $BackendDir '.venv\Scripts\Activate.ps1'

if (-not (Test-Path $VenvActivate)) {
    throw "Backend virtualenv not found at $VenvActivate. Create it first with: cd backend; python -m venv .venv"
}

Set-Location $BackendDir
. $VenvActivate

python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload