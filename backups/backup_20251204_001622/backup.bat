@echo off
chcp 65001 >nul
title Backup System
color 0A

echo.
echo ====================================================
echo              BACKUP SYSTEM - Full Backup
echo ====================================================
echo.

set "SOURCE=%~dp0workspace\shadcn-ui"
set "DEST=%~dp0backups"
set "BACKUP_NAME=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP_NAME=%BACKUP_NAME: =0%"
set "BACKUP_PATH=%DEST%\%BACKUP_NAME%"

echo Source: %SOURCE%
echo Destination: %BACKUP_PATH%
echo.

REM Create backups directory
if not exist "%DEST%" (
    mkdir "%DEST%"
    echo Created backups directory
)

REM Create current backup directory
mkdir "%BACKUP_PATH%"
echo Created backup folder: %BACKUP_NAME%
echo.

echo Copying files...
echo.

REM نسخ المجلدات والملفات المهمة
xcopy "%SOURCE%\src" "%BACKUP_PATH%\src\" /E /I /Y /Q
xcopy "%SOURCE%\public" "%BACKUP_PATH%\public\" /E /I /Y /Q
xcopy "%SOURCE%\docs" "%BACKUP_PATH%\docs\" /E /I /Y /Q

REM نسخ الملفات الهامة في الجذر
copy "%SOURCE%\package.json" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\tsconfig.json" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\vite.config.ts" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\tailwind.config.ts" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\postcss.config.js" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\components.json" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\index.html" "%BACKUP_PATH%\" >nul
copy "%SOURCE%\README.md" "%BACKUP_PATH%\" >nul 2>nul

REM نسخ ملفات الجذر الأساسية
copy "%~dp0*.bat" "%BACKUP_PATH%\" >nul 2>nul
copy "%~dp0*.ps1" "%BACKUP_PATH%\" >nul 2>nul

echo.
echo All files copied successfully!
echo.

REM Create backup info file
(
echo {
echo   "backupName": "%BACKUP_NAME%",
echo   "timestamp": "%date% %time%",
echo   "source": "%SOURCE%",
echo   "destination": "%BACKUP_PATH%"
echo }
) > "%BACKUP_PATH%\backup-info.json"

echo Backup info file created
echo.

REM Calculate backup size
echo Calculating backup size...
dir "%BACKUP_PATH%" /s /-c 2>nul | find "File(s)"
echo.

REM Compress backup (optional)
echo.
set /p COMPRESS="Compress backup? (Y/N): "
if /i "%COMPRESS%"=="Y" (
    echo.
    echo Compressing backup...
    powershell -command "Compress-Archive -Path '%BACKUP_PATH%' -DestinationPath '%BACKUP_PATH%.zip' -Force"
    if exist "%BACKUP_PATH%.zip" (
        echo Backup compressed successfully!
        echo Compressed file: %BACKUP_NAME%.zip
        
        REM Delete uncompressed folder
        rmdir /s /q "%BACKUP_PATH%"
        echo Deleted uncompressed folder
    )
)

echo.
echo ====================================================
echo          BACKUP COMPLETED SUCCESSFULLY!
echo ====================================================
echo.
echo Backup location: %DEST%
echo Time: %date% %time%
echo.

REM Show all available backups
echo Available backups:
echo.
dir "%DEST%\backup_*" /b 2>nul
echo.

set /p OPEN="Open backups folder? (Y/N): "
if /i "%OPEN%"=="Y" (
    start "" "%DEST%"
)

echo.
pause
