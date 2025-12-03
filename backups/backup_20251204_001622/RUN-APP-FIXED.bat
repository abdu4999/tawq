@echo off
chcp 65001 >nul
cls
echo ====================================================================
echo                   TAWQ Performance System
echo               نظام إدارة الأداء للتسويق الخيري
echo ====================================================================
echo.

REM Get the script directory and navigate to build\original
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%build\original"

REM Verify we're in the correct directory
if not exist "index.html" (
    echo [X] خطأ: لم يتم العثور على ملفات التطبيق!
    echo.
    echo المسار المتوقع: %SCRIPT_DIR%build\original\
    echo المسار الحالي: %CD%
    echo.
    pause
    exit /b 1
)

echo [+] تم العثور على ملفات التطبيق
echo [*] المسار: %CD%
echo.

REM Check if Python is installed
where python >nul 2>&1
if errorlevel 1 (
    echo [X] Python غير مثبت!
    echo.
    echo الرجاء تثبيت Python من: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [+] Python متوفر - جاهز للتشغيل
echo.
echo [*] جاري تشغيل الخادم المحلي...
echo.
echo ====================================================================
echo.
echo   ✅ التطبيق متاح على: http://localhost:8080
echo.
echo   📋 بيانات الدخول:
echo      البريد الإلكتروني: admin@tawq.com
echo      كلمة المرور: admin123
echo.
echo   💡 نصيحة: استخدم Ctrl+C لإيقاف الخادم
echo.
echo ====================================================================
echo.
echo جاري فتح المتصفح...
echo.

timeout /t 2 /nobreak >nul
start http://localhost:8080

echo الخادم يعمل الآن...
echo.

python -m http.server 8080

echo.
echo تم إيقاف الخادم.
pause
