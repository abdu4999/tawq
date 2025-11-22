@echo off
chcp 65001 >nul
echo ======================================
echo    Tawq Auto Sync Watcher
echo    المزامنة التلقائية
echo ======================================
echo.
echo [*] بدء المراقبة التلقائية...
echo [*] سيتم حفظ ورفع التغييرات تلقائياً
echo [*] اضغط Ctrl+C للإيقاف
echo.
PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
