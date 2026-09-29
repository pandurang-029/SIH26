@echo off
echo Launching NTRO Local LLM, Backend, and Frontend Servers...
start "NTRO Local LLM" "%~dp0run_llm.bat"
start "NTRO Backend" "%~dp0run_backend.bat"
start "NTRO Frontend" "%~dp0run_frontend.bat"
echo.
echo ===================================================
echo Local LLM:  http://127.0.0.1:8080 (Qwen 2.5 3B)
echo Backend:    http://localhost:8000
echo Frontend:   http://localhost:3000
echo ===================================================
pause


