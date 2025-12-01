@echo off
chcp 65001 >nul
echo ======================================
echo    Tawq Auto Sync
echo ======================================
echo.

cd /d "%~dp0"

echo [1/4] Checking for local changes...
git status --short

echo.
echo [2/4] Adding all changes...
git add -A

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
        echo [!] Conflicts detected! Please resolve manually.
        pause
        exit /b 1
    )
    git push origin main
)

echo.
echo ======================================
echo [+] Sync completed successfully!
echo ======================================
echo.
pause
