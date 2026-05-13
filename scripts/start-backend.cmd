@echo off
setlocal
cd /d %~dp0\..\backend
if not exist .venv (
  echo Backend virtualenv not found. Create it with: python -m venv .venv
  exit /b 1
)
call .venv\Scripts\activate.bat
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload