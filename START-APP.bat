@echo off
chcp 65001 >nul
echo ====================================================================
echo                    تشغيل نظام Tawq - shadcn-ui
echo ====================================================================
echo.

cd /d "%~dp0workspace\shadcn-ui"

if not exist "node_modules" (
    echo [1/2] تثبيت التبعيات...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [!] فشل تثبيت التبعيات!
        pause
        exit /b 1
    )
)

echo.
echo [2/2] تشغيل خادم التطوير...
echo.
echo سيتم فتح التطبيق على: http://localhost:5173
echo.

call npm run dev

pause
