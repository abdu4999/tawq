@echo off
chcp 65001 >nul
cls
echo ====================================================================
echo                    TAWQ App - Quick Start
echo ====================================================================
echo.

cd /d "%~dp0workspace\shadcn-ui"

REM Check if pnpm is installed
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [!] pnpm غير مثبت. جاري التثبيت...
    echo.
    call npm install -g pnpm
    if errorlevel 1 (
        echo [X] فشل تثبيت pnpm. جرب يدوياً: npm install -g pnpm
        pause
        exit /b 1
    )
    echo [+] تم تثبيت pnpm بنجاح!
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/2] تثبيت التبعيات باستخدام pnpm...
    echo.
    call pnpm install
    if errorlevel 1 (
        echo.
        echo [!] فشل التثبيت. جرب npm بدلاً من pnpm...
        call npm install
    )
    echo.
)

echo [2/2] تشغيل التطبيق...
echo.
echo ====================================================================
echo   التطبيق متاح على: http://localhost:5173
echo ====================================================================
echo.

call pnpm run dev

pause
