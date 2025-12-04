@echo off
chcp 65001 >nul
title Automated Testing System

:: Navigate to project directory
cd /d "%~dp0\workspace\shadcn-ui"

:MENU
cls
echo ===================================================
echo    AUTOMATED TESTING SYSTEM - SHADCN UI
echo ===================================================
echo.
echo [1] Run Unit Tests (Vitest)
echo [2] Run E2E Tests (Playwright)
echo [3] Run Test Coverage Report
echo [4] Run All Tests
echo [5] Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Running Unit Tests...
    call npm run test:unit
    pause
    goto MENU
)
if "%choice%"=="2" (
    echo.
    echo Running E2E Tests...
    call npm run test:e2e
    pause
    goto MENU
)
if "%choice%"=="3" (
    echo.
    echo Generating Coverage Report...
    call npm run test:coverage
    pause
    goto MENU
)
if "%choice%"=="4" (
    echo.
    echo Running All Tests...
    echo.
    echo --- UNIT TESTS ---
    call npm run test:unit
    echo.
    echo --- E2E TESTS ---
    call npm run test:e2e
    pause
    goto MENU
)
if "%choice%"=="5" (
    exit
)

echo Invalid choice. Please try again.
pause
goto MENU
