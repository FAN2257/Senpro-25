$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RepoRoot 'frontend'

if (-not (Test-Path (Join-Path $FrontendDir 'package.json'))) {
    throw "Frontend package.json not found in $FrontendDir."
}

Set-Location $FrontendDir
npm run dev