@echo off
title Cravify QA Suite
cd /d "%~dp0"
echo ================================================
echo   CRAVIFY QA AUTOMATION
echo ================================================
python --version >nul 2>&1 || (echo [ERROR] Python not found. & pause & exit /b 1)
pip install selenium requests --quiet
echo.
echo [1/2] Running E2E Tests...
python main_test_suite.py
echo.
echo [2/2] Running API Tests...
python api_tests.py
echo.
echo ================================================
echo   Done. Open test_report.html for full report.
echo ================================================
pause
