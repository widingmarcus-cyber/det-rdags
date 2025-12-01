@echo off
echo Stopping Bobot services...

:: Kill Node (admin panel)
taskkill /f /im node.exe >nul 2>&1

:: Kill Python (backend)
taskkill /f /im python.exe >nul 2>&1

echo Done! All services stopped.
pause
