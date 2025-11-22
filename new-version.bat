@echo off
chcp 65001 >nul
echo ======================================
echo    Create New Version
echo ======================================
echo.

cd /d "%~dp0\build"

REM Find the latest version number
set "maxVersion=0"
for /d %%d in (v*) do (
    set "folder=%%d"
    set "folder=!folder:v=!"
    set "folder=!folder:.=!"
    if !folder! gtr !maxVersion! set "maxVersion=!folder!"
)

REM Calculate next version
set /a "nextVersion=maxVersion+1"

echo [*] Current latest version: v%maxVersion%
echo [*] Creating new version: v%nextVersion%
echo.

REM Ask which version to copy from
set /p "sourceVersion=Which version to copy from? (default: v10): "
if "%sourceVersion%"=="" set "sourceVersion=v10"

if not exist "%sourceVersion%" (
    echo [!] Error: %sourceVersion% does not exist!
    pause
    exit /b 1
)

REM Create new version
echo [+] Copying %sourceVersion% to v%nextVersion%...
xcopy /E /I /Y "%sourceVersion%" "v%nextVersion%" >nul

echo.
echo ======================================
echo [+] New version v%nextVersion% created!
echo ======================================
echo.
echo Now you can edit files in: build\v%nextVersion%
echo.

cd ..
git add build/v%nextVersion%
git commit -m "Create version v%nextVersion%"
git push

if errorlevel 1 (
    echo [!] Failed to push to GitHub
) else (
    echo [+] Pushed to GitHub successfully!
)

echo.
pause
