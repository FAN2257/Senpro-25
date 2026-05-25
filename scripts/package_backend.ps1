# Package backend for App Service
# Usage: run from repository root in PowerShell

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Push-Location $repoRoot

Write-Host "Building frontend..."
Set-Location (Join-Path $repoRoot 'frontend')

# Reuse an existing production build if one is already present.
$frontendDist = Join-Path $repoRoot 'frontend\dist\index.html'
if (-not (Test-Path $frontendDist)) {
	# Install dependencies only if the frontend build output is missing.
	Write-Host "Running npm ci"
	npm ci
	if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

	Write-Host "Running npm run build"
	npm run build
	if ($LASTEXITCODE -ne 0) { throw "npm run build failed with exit code $LASTEXITCODE" }
} else {
	Write-Host "Frontend dist already exists; skipping npm ci and build"
}

# Copy build into backend static
Write-Host "Copying frontend/dist -> backend/static"
Set-Location $repoRoot
if (-Not (Test-Path backend\static)) { New-Item -ItemType Directory -Path backend\static | Out-Null }
robocopy frontend\dist backend\static /MIR | Out-Null

# Create zip package
$zipPath = Join-Path $repoRoot "backend.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Write-Host "Creating $zipPath"
Compress-Archive -Path backend\* -DestinationPath $zipPath -Force

Write-Host "Packaged: $zipPath"

Pop-Location
