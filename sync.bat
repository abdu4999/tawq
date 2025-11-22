@echo off
echo ======================================
echo    Tawq Auto Sync
echo ======================================
echo.

cd /d "%~dp0"

echo [*] Syncing with GitHub...
git pull origin copilot/develop-performance-tracking-app --rebase

if errorlevel 1 (
    echo [!] Sync failed! Please check for conflicts.
    pause
    exit /b 1
)

git add -A
git commit -m "Auto sync: %date% %time%"
git push origin copilot/develop-performance-tracking-app

if errorlevel 1 (
    echo [!] Push failed! Please check your GitHub credentials.
    pause
    exit /b 1
)

echo.
echo [+] Sync completed successfully!
echo.
pause
