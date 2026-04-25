@echo off
setlocal

cd /d "%~dp0"

if "%CRAVIFY_BROWSERS%"=="" set CRAVIFY_BROWSERS=chrome,firefox,edge
if "%CRAVIFY_HEADLESS%"=="" set CRAVIFY_HEADLESS=true

if not exist reports mkdir reports
if not exist screenshots mkdir screenshots
if not exist logs mkdir logs

echo ==================================================
echo        CRAVIFY PRODUCTION E2E AUTOMATION
echo ==================================================
echo Target: %CRAVIFY_BASE_URL%
echo Browsers: %CRAVIFY_BROWSERS%
echo.

python -m pytest test_master_flow.py test_cross_browser.py -v -s --tb=short --continue-on-collection-errors --html=reports\cravify_e2e_report.html --self-contained-html

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Complete E2E suite passed.
) else (
    echo.
    echo [FAILED] Check reports\cravify_e2e_report.html and screenshots\ for evidence.
)

endlocal
