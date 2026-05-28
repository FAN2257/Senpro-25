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

# Stage only the deployable backend files to keep the zip small and clean.
$stagingDir = Join-Path $repoRoot '_backend_package'
if (Test-Path $stagingDir) { Remove-Item $stagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $stagingDir | Out-Null

$deployFiles = @(
	'.deployment',
	'.gitignore',
	'api.py',
	'APP_SERVICE_SETUP.md',
	'best.pt',
	'db.py',
	'nutrition_mapping.json',
	'README.md',
	'requirements.txt',
	'startup.sh'
)

foreach ($file in $deployFiles) {
	$sourcePath = Join-Path $repoRoot ("backend\" + $file)
	if (Test-Path $sourcePath) {
		Copy-Item $sourcePath $stagingDir -Force
	}
}

Copy-Item backend\static (Join-Path $stagingDir 'static') -Recurse -Force

# Create zip package
$zipPath = Join-Path $repoRoot "backend.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Write-Host "Creating $zipPath"
Compress-Archive -Path (Join-Path $stagingDir '*') -DestinationPath $zipPath -Force

if (Test-Path $stagingDir) { Remove-Item $stagingDir -Recurse -Force }

Write-Host "Packaged: $zipPath"

Pop-Location
