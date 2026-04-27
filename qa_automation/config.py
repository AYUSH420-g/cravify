"""
config.py - Cravify QA Framework Configuration
All environment settings, credentials, and thresholds live here.
Tests import this — never hardcode values inside test files.
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Application ──────────────────────────────────────────────
BASE_URL    = os.getenv("CRAVIFY_URL",        "https://cravify-peach.vercel.app/")
API_BASE    = os.getenv("CRAVIFY_API",        "https://cravify-api.onrender.com/api")

# ── Credentials (override via env vars in CI/CD) ─────────────
ADMIN_EMAIL = os.getenv("CRAVIFY_ADMIN_EMAIL", "admin@cravify.com")
ADMIN_PASS  = os.getenv("CRAVIFY_ADMIN_PASS",  "admin123")

# ── WebDriver ────────────────────────────────────────────────
BROWSER         = os.getenv("CRAVIFY_BROWSER", "chrome")       # chrome | firefox | edge
CHROMEDRIVER    = os.path.join(BASE_DIR, "Chromedriver", "chromedriver.exe")
HEADLESS        = os.getenv("HEADLESS", "false").lower() == "true"

# ── Wait Timeouts (seconds) ──────────────────────────────────
W_SHORT   = 8
W_DEFAULT = 25
W_LONG    = 40

# ── Performance Thresholds ───────────────────────────────────
PERF_PAGE_LOAD  = 6.0   # seconds
PERF_LOGIN      = 8.0
PERF_SEARCH     = 4.0

# ── Artifacts ────────────────────────────────────────────────
SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")
LOG_FILE       = os.path.join(BASE_DIR, "logs.txt")
REPORT_FILE    = os.path.join(BASE_DIR, "test_report.html")
DUMMY_PNG      = os.path.join(BASE_DIR, "dummy.png")
DUMMY_PDF      = os.path.join(BASE_DIR, "dummy.pdf")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)
