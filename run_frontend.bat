@echo off
echo Starting NTRO Frontend Dev Server...

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

npm run dev

pause