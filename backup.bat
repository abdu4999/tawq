@echo off
chcp 65001 >nul
title 🔒 نظام النسخ الاحتياطي - Backup System
color 0A

echo.
echo ====================================================
echo          🔒 نظام النسخ الاحتياطي الشامل
echo ====================================================
echo.

set "SOURCE=D:\joker\workspace\shadcn-ui"
set "DEST=D:\joker\backups"
set "BACKUP_NAME=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP_NAME=%BACKUP_NAME: =0%"
set "BACKUP_PATH=%DEST%\%BACKUP_NAME%"

echo 📁 المصدر: %SOURCE%
echo 📁 الوجهة: %BACKUP_PATH%
echo.

REM إنشاء مجلد النسخ الاحتياطية
if not exist "%DEST%" (
    mkdir "%DEST%"
    echo ✅ تم إنشاء مجلد النسخ الاحتياطية
)

REM إنشاء مجلد النسخة الحالية
mkdir "%BACKUP_PATH%"
echo ✅ تم إنشاء مجلد النسخة: %BACKUP_NAME%
echo.

echo 📦 جاري نسخ الملفات...
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
copy "D:\joker\*.bat" "%BACKUP_PATH%\" >nul 2>nul
copy "D:\joker\*.ps1" "%BACKUP_PATH%\" >nul 2>nul

echo.
echo ✅ تم نسخ جميع الملفات بنجاح!
echo.

REM إنشاء ملف معلومات النسخة
(
echo {
echo   "backupName": "%BACKUP_NAME%",
echo   "timestamp": "%date% %time%",
echo   "source": "%SOURCE%",
echo   "destination": "%BACKUP_PATH%"
echo }
) > "%BACKUP_PATH%\backup-info.json"

echo 📋 تم إنشاء ملف معلومات النسخة
echo.

REM حساب حجم النسخة
echo 📊 جاري حساب حجم النسخة...
dir "%BACKUP_PATH%" /s /-c 2>nul | find "File(s)"
echo.

REM ضغط النسخة (اختياري)
echo.
set /p COMPRESS="هل تريد ضغط النسخة؟ (Y/N): "
if /i "%COMPRESS%"=="Y" (
    echo.
    echo 🗜️  جاري ضغط النسخة...
    powershell -command "Compress-Archive -Path '%BACKUP_PATH%' -DestinationPath '%BACKUP_PATH%.zip' -Force"
    if exist "%BACKUP_PATH%.zip" (
        echo ✅ تم ضغط النسخة بنجاح!
        echo 📦 الملف المضغوط: %BACKUP_NAME%.zip
        
        REM حذف المجلد غير المضغوط
        rmdir /s /q "%BACKUP_PATH%"
        echo 🗑️  تم حذف المجلد غير المضغوط
    )
)

echo.
echo ====================================================
echo          ✅ اكتملت عملية النسخ الاحتياطي!
echo ====================================================
echo.
echo 📁 موقع النسخة: %DEST%
echo ⏰ الوقت: %date% %time%
echo.

REM عرض جميع النسخ المتوفرة
echo 📊 النسخ الاحتياطية المتوفرة:
echo.
dir "%DEST%\backup_*" /b 2>nul
echo.

set /p OPEN="هل تريد فتح مجلد النسخ الاحتياطية؟ (Y/N): "
if /i "%OPEN%"=="Y" (
    start "" "%DEST%"
)

echo.
pause
