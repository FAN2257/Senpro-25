@echo off
setlocal
cd /d "%~dp0\..\backend"
if not exist ".venv\Scripts\python.exe" (
  echo Backend virtualenv not found. Creating .venv...
  python -m venv .venv
  if errorlevel 1 exit /b 1
)
call ".venv\Scripts\activate.bat"
python -m pip install -r requirements.txt
if errorlevel 1 exit /b 1
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload