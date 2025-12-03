@echo off
chcp 65001 >nul
cls
echo ======================================
echo    Tawq Auto Sync Watcher
echo ======================================
echo.
echo [*] Starting auto sync every 60 seconds...
echo [*] Press Ctrl+C to stop
echo.

cd /d "%~dp0"

:loop
echo.
echo ======================================
echo [%date% %time%] Starting sync cycle...
echo ======================================
echo.

echo [1/4] Checking for local changes...
git status --short

echo.
echo [2/4] Adding all changes...
echo [i] Respecting .gitignore exclusions
git add -u
git add .

echo.
echo [3/4] Committing changes...
git diff --staged --quiet
if errorlevel 1 (
    git commit -m "Auto sync: %date% %time%"
    echo [+] Changes committed
) else (
    echo [i] No changes to commit
)

echo.
echo [4/4] Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo [!] Push failed! Trying to pull first...
    git pull origin main --rebase
    if errorlevel 1 (
        echo [!] Conflicts detected! Resolving...
        git rebase --abort
        git pull origin main
    )
    git push origin main
)

echo.
echo ======================================
echo [+] Sync completed! Waiting 60 seconds...
echo ======================================

timeout /t 60 >nul
goto loop
