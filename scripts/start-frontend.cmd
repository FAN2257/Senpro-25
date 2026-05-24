@echo off
setlocal
cd /d "%~dp0\..\frontend"
if not exist package.json (
  echo Frontend package.json not found.
  exit /b 1
)
if not exist node_modules (
  echo Frontend dependencies not found. Installing...
  npm install
  if errorlevel 1 exit /b 1
)
echo Starting Vite dev server...
npm run dev -- --host 0.0.0.0