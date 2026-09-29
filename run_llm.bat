@echo off
title NTRO Local LLM Server (llama.cpp - Qwen 2.5 3B)
echo ================================================================
echo Starting NTRO Local LLM Engine
echo Model: Qwen 2.5 3B Instruct (via llama.cpp)
echo Endpoint: http://127.0.0.1:8080/v1
echo No Gemini API Key required - 100%% Offline and Air-Gapped!
echo ================================================================

set "WINGET_LLAMA=%LOCALAPPDATA%\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe"

if exist "%WINGET_LLAMA%" (
    "%WINGET_LLAMA%" -hf Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M --port 8080 --host 127.0.0.1 -c 8192
) else (
    llama-server -hf Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M --port 8080 --host 127.0.0.1 -c 8192
)

pause
