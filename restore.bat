@echo off
chcp 65001 >nul
title Restore Backup
color 0B

echo.
echo ====================================================
echo              RESTORE BACKUP SYSTEM
echo ====================================================
echo.

set "BACKUP_DIR=backups"
set "RESTORE_PATH=workspace\shadcn-ui"

REM Check if backups directory exists
if not exist "%BACKUP_DIR%" (
    echo No backups directory found!
    echo.
    pause
    exit /b
)

echo Available backups:
echo.

REM Display available backups
setlocal enabledelayedexpansion
set count=0
for /d %%D in ("%BACKUP_DIR%\backup_*") do (
    set /a count+=1
    echo [!count!] %%~nxD
)

REM Display compressed files
for %%F in ("%BACKUP_DIR%\backup_*.zip") do (
    set /a count+=1
    echo [!count!] %%~nxF (compressed)
)

if %count%==0 (
    echo No backups available!
    echo.
    pause
    exit /b
)

echo.
echo ====================================================
echo.

set /p CHOICE="Select backup number to restore (or 0 to cancel): "

if "%CHOICE%"=="0" (
    echo Cancelled
    pause
    exit /b
)

echo.
echo WARNING: This will replace current files!
echo Path: %RESTORE_PATH%
echo.

set /p CONFIRM="Are you sure? Type YES to confirm: "

if not "%CONFIRM%"=="YES" (
    echo Cancelled
    pause
    exit /b
)

echo.
echo Restoring...
echo.

REM Get backup name based on selection
set current=0
set SELECTED_BACKUP=

REM Search in folders
for /d %%D in ("%BACKUP_DIR%\backup_*") do (
    set /a current+=1
    if !current!==%CHOICE% set SELECTED_BACKUP=%%D
)

REM Search in compressed files
for %%F in ("%BACKUP_DIR%\backup_*.zip") do (
    set /a current+=1
    if !current!==%CHOICE% (
        set SELECTED_BACKUP=%%F
        set IS_ZIP=1
    )
)

if "%SELECTED_BACKUP%"=="" (
    echo Invalid selection!
    pause
    exit /b
)

echo Selected backup: %SELECTED_BACKUP%
echo.

REM Extract if compressed
if defined IS_ZIP (
    echo Extracting...
    set "TEMP_EXTRACT=%BACKUP_DIR%\temp_restore"
    
    REM Delete temp folder if exists
    if exist "!TEMP_EXTRACT!" rmdir /s /q "!TEMP_EXTRACT!"
    
    REM Extract
    powershell -command "Expand-Archive -Path '%SELECTED_BACKUP%' -DestinationPath '!TEMP_EXTRACT!' -Force"
    
    REM Find extracted folder
    for /d %%X in ("!TEMP_EXTRACT!\backup_*") do set SELECTED_BACKUP=%%X
    
    echo Extracted successfully
    echo.
)

echo Copying files...
echo.

REM Copy folders
if exist "%SELECTED_BACKUP%\src" (
    xcopy "%SELECTED_BACKUP%\src" "%RESTORE_PATH%\src\" /E /I /Y /Q
    echo Copied src
)

if exist "%SELECTED_BACKUP%\public" (
    xcopy "%SELECTED_BACKUP%\public" "%RESTORE_PATH%\public\" /E /I /Y /Q
    echo Copied public
)

if exist "%SELECTED_BACKUP%\docs" (
    xcopy "%SELECTED_BACKUP%\docs" "%RESTORE_PATH%\docs\" /E /I /Y /Q
    echo Copied docs
)

REM Copy root files
if exist "%SELECTED_BACKUP%\package.json" copy "%SELECTED_BACKUP%\package.json" "%RESTORE_PATH%\" /Y >nul
if exist "%SELECTED_BACKUP%\tsconfig.json" copy "%SELECTED_BACKUP%\tsconfig.json" "%RESTORE_PATH%\" /Y >nul
if exist "%SELECTED_BACKUP%\vite.config.ts" copy "%SELECTED_BACKUP%\vite.config.ts" "%RESTORE_PATH%\" /Y >nul
if exist "%SELECTED_BACKUP%\tailwind.config.ts" copy "%SELECTED_BACKUP%\tailwind.config.ts" "%RESTORE_PATH%\" /Y >nul

echo Copied configuration files
echo.

REM Delete temp folder
if defined IS_ZIP (
    if exist "%BACKUP_DIR%\temp_restore" rmdir /s /q "%BACKUP_DIR%\temp_restore"
)

echo.
echo ====================================================
echo          RESTORE COMPLETED SUCCESSFULLY!
echo ====================================================
echo.
echo Path: %RESTORE_PATH%
echo TIP: Run "npm install" if needed
echo.
pause
