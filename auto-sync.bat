@echo off
chcp 65001 >nul
echo ======================================
echo    Tawq Auto Sync Watcher
echo ======================================
echo.
echo [*] Starting auto sync watcher...
echo [*] Changes will be synced automatically
echo [*] Press Ctrl+C to stop
echo.
PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
