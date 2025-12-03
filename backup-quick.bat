@echo off
chcp 65001 >nul
echo ====================================================
echo 🔒 نسخة احتياطية سريعة - Quick Backup
echo ====================================================
echo.

powershell -ExecutionPolicy Bypass -File "D:\joker\backup-system.ps1" -Compress -AutoClean

echo.
echo ====================================================
echo ✅ انتهت العملية
echo ====================================================
pause
