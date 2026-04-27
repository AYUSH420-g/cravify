#!/bin/bash
cd "$(dirname "$0")"
echo "================================================"
echo "  CRAVIFY QA AUTOMATION"
echo "================================================"
pip install selenium requests -q
echo "[1/2] Running E2E Tests..."
python3 main_test_suite.py
echo "[2/2] Running API Tests..."
python3 api_tests.py
echo "Done. Open test_report.html for full report."
