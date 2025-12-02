@echo off
chcp 65001 >nul
echo ======================================
echo    Tawq Auto Sync Watcher
echo ======================================
echo.
echo [*] Starting auto sync every 60 seconds...
echo [*] Press Ctrl+C to stop
echo.

cd /d "%~dp0"

:loop
echo [%date% %time%] Checking for changes...

git status --short > nul 2>&1
if errorlevel 1 (
    echo [!] Git error - make sure you're in the right folder
    timeout /t 5 >nul
    goto loop
)

git diff --quiet
if errorlevel 1 (
    echo.
    echo [+] Changes detected! Syncing...
    git add -A
    git commit -m "Auto sync: %date% %time%"
    git push origin main
    if errorlevel 1 (
        echo [!] Push failed!
    ) else (
        echo [+] Synced successfully!
    )
) else (
    echo [i] No changes
)

echo.
timeout /t 60 >nul
goto loop
