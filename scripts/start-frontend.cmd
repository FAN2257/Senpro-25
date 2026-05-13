@echo off
setlocal
cd /d %~dp0\..\frontend
if not exist package.json (
  echo Frontend package.json not found.
  exit /b 1
)
npm run dev