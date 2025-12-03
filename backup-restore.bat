@echo off
chcp 65001 >nul
echo ====================================================
echo 🔄 استعادة نسخة احتياطية - Restore Backup
echo ====================================================
echo.

powershell -ExecutionPolicy Bypass -File "D:\joker\backup-restore.ps1"

echo.
pause
