@echo off
echo ========================================
echo   Starting Bobot Platform
echo ========================================
echo.

:: Check if Ollama is running
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Ollama...
    start "" ollama serve
    timeout /t 3 >nul
)
echo Ollama OK!

:: Start Backend
echo.
echo Starting Backend...
cd /d "%~dp0backend"
start "Bobot Backend" cmd /k "python -m uvicorn main:app --reload --port 8000"
timeout /t 3 >nul

:: Start Admin Panel
echo.
echo Starting Admin Panel...
cd /d "%~dp0admin-panel"
start "Bobot Admin" cmd /k "npm run dev"

:: Start Widget Demo
echo.
echo Starting Widget Demo...
cd /d "%~dp0chat-widget"
start "Bobot Widget" cmd /k "npm run dev"

echo.
echo ========================================
echo   Bobot is starting up!
echo ========================================
echo.
echo   Admin Panel:    http://localhost:3000
echo   Widget Demo:    http://localhost:3001
echo   API Backend:    http://localhost:8000
echo.
echo   Demo login:     demo / demo123
echo   Admin login:    admin / admin123
echo.
echo   Press any key to open Admin Panel...
pause >nul

start http://localhost:3000
