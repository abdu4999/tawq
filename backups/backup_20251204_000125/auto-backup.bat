@echo off
chcp 65001 >nul
title Auto Backup
color 0E

echo.
echo ====================================================
echo          AUTOMATIC BACKUP SYSTEM
echo ====================================================
echo.

set "INTERVAL=21600"
REM 21600 seconds = 6 hours

echo Interval: Every 6 hours
echo Starting automatic backup service...
echo Press Ctrl+C to stop
echo.

:LOOP
echo ====================================================
echo Starting automatic backup
echo Time: %date% %time%
echo ====================================================
echo.

call "%~dp0backup.bat"

echo.
echo Next backup in 6 hours...
echo.

timeout /t %INTERVAL% /nobreak

goto LOOP
