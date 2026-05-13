@echo off
setlocal
start "SnapEats Backend" cmd /k "cd /d %~dp0\..\backend && call .venv\Scripts\activate.bat && python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
start "SnapEats Frontend" cmd /k "cd /d %~dp0\..\frontend && npm run dev"
echo Demo windows opened.