#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

export CRAVIFY_BROWSERS="${CRAVIFY_BROWSERS:-chrome,firefox,edge}"
export CRAVIFY_HEADLESS="${CRAVIFY_HEADLESS:-true}"

mkdir -p reports screenshots logs

echo "=================================================="
echo "       CRAVIFY PRODUCTION E2E AUTOMATION"
echo "=================================================="
echo "Target: ${CRAVIFY_BASE_URL:-https://cravify-peach.vercel.app}"
echo "Browsers: ${CRAVIFY_BROWSERS}"
echo

python3 -m pytest test_master_flow.py test_cross_browser.py -v -s --tb=short --continue-on-collection-errors --html=reports/cravify_e2e_report.html --self-contained-html
status=$?

if [ "$status" -eq 0 ]; then
  echo
  echo "[SUCCESS] Complete E2E suite passed."
else
  echo
  echo "[FAILED] Check reports/cravify_e2e_report.html and screenshots/ for evidence."
fi

exit "$status"
