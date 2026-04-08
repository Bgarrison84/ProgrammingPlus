@echo off
title Programming Plus - Desktop Edition
echo Starting Programming Plus...
npm start
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start the application.
    echo Ensure Node.js and dependencies are installed (run 'npm install').
    pause
)
