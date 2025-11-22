@echo off
chcp 65001 >nul
echo ======================================
echo   Tawq Backend API Server
echo ======================================
echo.

cd /d "%~dp0"

REM التحقق من تثبيت Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [!] Python غير مثبت!
    echo يرجى تثبيت Python 3.8+ من: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM التحقق من virtual environment
if not exist "venv" (
    echo [1/4] إنشاء البيئة الافتراضية...
    python -m venv venv
    if errorlevel 1 (
        echo [!] فشل إنشاء البيئة الافتراضية
        pause
        exit /b 1
    )
    echo [+] تم إنشاء البيئة الافتراضية
)

REM تفعيل البيئة الافتراضية
echo.
echo [2/4] تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت المكتبات
echo.
echo [3/4] تثبيت المكتبات المطلوبة...
pip install -r requirements.txt
if errorlevel 1 (
    echo [!] فشل تثبيت المكتبات
    pause
    exit /b 1
)

REM إنشاء قاعدة البيانات
echo.
echo [4/4] إنشاء قاعدة البيانات...
python database.py

REM تشغيل الخادم
echo.
echo ======================================
echo [+] بدء تشغيل API Server...
echo ======================================
echo.
echo 📖 Documentation: http://localhost:8000/api/docs
echo 🔗 API Base URL: http://localhost:8000/api
echo.
echo للإيقاف: اضغط Ctrl+C
echo.
python api.py

pause
