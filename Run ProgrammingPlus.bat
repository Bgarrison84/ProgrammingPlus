@echo off
title Programming Plus - Studio Launcher
:menu
cls
echo ==========================================
echo    PROGRAMMING PLUS - PIXEL FORGE STUDIO
echo ==========================================
echo.
echo  1. Launch Studio (Developer Mode)
echo  2. Build Distribution (.exe)
echo  3. Exit
echo.
set /p choice="Select an option (1-3): "

if "%choice%"=="1" goto launch
if "%choice%"=="2" goto build
if "%choice%"=="3" exit
goto menu

:launch
echo Starting Programming Plus...
npm start
pause
goto menu

:build
echo Building distribution package...
npm run dist
echo.
echo Build complete! Check the 'dist' folder.
pause
goto menu
