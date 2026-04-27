"""
api_tests.py - Cravify REST API Tests using requests library.
Tests backend API endpoints directly without a browser.
Run: python api_tests.py
"""
import time, requests
import config
from utils import log, G, R, Y, C, RESET

API   = config.API_BASE
passed, failed = 0, 0

def api_test(tc_id, name, fn):
    global passed, failed
    log(f"\n▶ {tc_id}: {name}", C)
    try:
        fn()
        passed += 1
        log(f"  ✅ [PASS] {tc_id}", G)
    except AssertionError as e:
        failed += 1
        log(f"  ❌ [FAIL] {tc_id}: {e}", R)

# ── API Test Functions ────────────────────────────────────────
def api_01():
    """Backend health check must return 200."""
    r = requests.get(API.replace("/api",""), timeout=10)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"

def api_02():
    """Valid login returns token."""
    r = requests.post(f"{API}/auth/login",
        json={"email": config.ADMIN_EMAIL, "password": config.ADMIN_PASS}, timeout=10)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "token" in r.json(), "Token missing from login response"

def api_03():
    """Invalid credentials return 400."""
    r = requests.post(f"{API}/auth/login",
        json={"email": "nobody@test.com", "password": "wrongpass"}, timeout=10)
    assert r.status_code in (400, 401), f"Expected 400/401, got {r.status_code}"

def api_04():
    """Protected admin route without token returns 401."""
    r = requests.get(f"{API}/admin/users", timeout=10)
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"

def api_05():
    """Protected vendor route without token returns 401."""
    r = requests.get(f"{API}/vendor/menu", timeout=10)
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"

def main():
    log("="*50, Y)
    log("  CRAVIFY API TEST SUITE", Y)
    log("="*50+"\n", Y)
    t0 = time.time()
    api_test("API_01", "Backend Health Check",          api_01)
    api_test("API_02", "Valid Login Returns Token",      api_02)
    api_test("API_03", "Invalid Login Returns 400/401",  api_03)
    api_test("API_04", "Admin Route Unauthorized",       api_04)
    api_test("API_05", "Vendor Route Unauthorized",      api_05)
    elapsed = int(time.time()-t0)
    total = 5
    log(f"\n{'='*50}")
    log(f"  API Tests — Passed: {passed}/{total} in {elapsed}s")
    log(f"{'='*50}\n")

if __name__ == "__main__":
    main()
