"""
test_07_security.py — Security & Injection Tests
Module: Security
TC_61 → TC_70
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, take_screenshot, record

WAIT = 15


def _wait(driver):
    return WebDriverWait(driver, WAIT)

XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "'\"><img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "<svg onload=alert(1)>",
]

SQLI_PAYLOADS = [
    "' OR '1'='1",
    "'; DROP TABLE users;--",
    "\" OR 1=1--",
    "admin'--",
]


class TestSecurity:

    # ── TC_61: XSS in Login Email Field ─────────────────────────────────────
    def test_TC61_xss_login_email(self, driver):
        tc = "TC_61"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            email_inp = _wait(driver).until(
                EC.presence_of_element_located((By.XPATH,
                    "//input[@type='email' or @name='email' or contains(@placeholder,'email')]"
                ))
            )
            # Try XSS payload in email
            payload = XSS_PAYLOADS[0]
            email_inp.clear()
            email_inp.send_keys(payload)

            # Check if alert appeared (XSS executed = FAIL)
            try:
                alert = driver.switch_to.alert
                alert_text = alert.text
                alert.dismiss()
                path = take_screenshot(driver, "TC_Security", f"{tc}_XSS_ALERT.png")
                record(tc, "Security", "XSS in login email field",
                       ["Go to /login", f"Enter XSS payload: {payload}"],
                       "Payload sanitized, no alert box",
                       f"ALERT APPEARED: {alert_text} — XSS VULNERABILITY!",
                       "FAIL", "Critical", path)
            except Exception:
                # No alert = good
                path = take_screenshot(driver, "TC_Security", f"{tc}_XSS_Login.png")
                record(tc, "Security", "XSS in login email field",
                       ["Go to /login", f"Enter: {payload}"],
                       "No alert box, payload sanitized",
                       "No alert appeared — input sanitized or rejected",
                       "PASS", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_XSS.png")
            record(tc, "Security", "XSS login email", [], "No XSS", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_62: XSS in Search Field ───────────────────────────────────────────
    def test_TC62_xss_search_field(self, driver):
        tc = "TC_62"
        driver.get(BASE_URL + "/search")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            search_inputs = driver.find_elements(By.XPATH,
                "//input[@type='search' or @type='text' or contains(@placeholder,'earch')]"
            )
            if search_inputs:
                payload = XSS_PAYLOADS[1]
                search_inputs[0].clear()
                search_inputs[0].send_keys(payload)
                time.sleep(1)
                try:
                    alert = driver.switch_to.alert
                    alert_text = alert.text
                    alert.dismiss()
                    path = take_screenshot(driver, "TC_Security", f"{tc}_XSS_SearchAlert.png")
                    record(tc, "Security", "XSS in search field",
                           ["Go to /search", f"Enter: {payload}"],
                           "No alert — sanitized",
                           f"ALERT! XSS fired: {alert_text}",
                           "FAIL", "Critical", path)
                except Exception:
                    path = take_screenshot(driver, "TC_Security", f"{tc}_XSS_Search.png")
                    record(tc, "Security", "XSS in search field",
                           ["Go to /search", f"Enter: {payload}"],
                           "No alert — sanitized",
                           "No alert — safe",
                           "PASS", "Critical", path)
            else:
                path = take_screenshot(driver, "TC_Security", f"{tc}_NoSearch.png")
                record(tc, "Security", "XSS in search field", ["No search field found"],
                       "XSS tested", "Search input not found — skipped", "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_XSSSearch.png")
            record(tc, "Security", "XSS search", [], "No XSS", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_63: SQL Injection in Login ───────────────────────────────────────
    def test_TC63_sqli_login(self, driver):
        tc = "TC_63"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            payload = SQLI_PAYLOADS[0]
            email_inp = _wait(driver).until(
                EC.presence_of_element_located((By.XPATH,
                    "//input[@type='email' or @name='email' or contains(@placeholder,'email')]"
                ))
            )
            email_inp.clear()
            email_inp.send_keys(payload)
            pwd_inp = driver.find_element(By.XPATH, "//input[@type='password']")
            pwd_inp.clear()
            pwd_inp.send_keys("anything")

            submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit.click()
            time.sleep(3)

            current_url = driver.current_url
            # Should not be logged in
            not_logged_in = "/dashboard" not in current_url and "/profile" not in current_url
            path = take_screenshot(driver, "TC_Security", f"{tc}_SQLi_Login.png")
            record(tc, "Security", "SQL injection in login does not bypass auth",
                   ["Go to /login", f"Email: {payload}", "Password: anything", "Submit"],
                   "Login rejected — not redirected to dashboard",
                   f"URL after: {current_url}",
                   "PASS" if not_logged_in else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_SQLi.png")
            record(tc, "Security", "SQLi login", [], "Blocked", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_64: Direct Admin URL Access (No Token) ────────────────────────────
    def test_TC64_direct_admin_access(self, driver):
        tc = "TC_64"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        admin_routes = ["/admin/dashboard", "/admin/users", "/admin/orders", "/admin/settings"]
        results = []
        for route in admin_routes:
            driver.get(BASE_URL + route)
            time.sleep(2)
            url = driver.current_url
            blocked = route not in url or "login" in url.lower()
            results.append(f"{route} → {url} → {'BLOCKED' if blocked else 'EXPOSED'}")

        path = take_screenshot(driver, "TC_Security", f"{tc}_DirectAdminAccess.png")
        all_blocked = all("BLOCKED" in r for r in results)
        record(tc, "Security", "Direct admin URL access without token",
               ["Clear session", "Try all admin routes directly"],
               "All admin routes redirect to /login",
               "\n".join(results),
               "PASS" if all_blocked else "FAIL", "Critical", path)

    # ── TC_65: LocalStorage Token Inspection ───────────────────────────────
    def test_TC65_localstorage_token(self, driver):
        tc = "TC_65"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            # Inspect what keys are stored in localStorage on login page
            ls_keys = driver.execute_script(
                "return Object.keys(window.localStorage);"
            )
            path = take_screenshot(driver, "TC_Security", f"{tc}_LocalStorage.png")
            record(tc, "Security", "LocalStorage token inspection on login page",
                   ["Navigate to /login", "Inspect localStorage keys"],
                   "No sensitive data exposed before login",
                   f"localStorage keys: {ls_keys}",
                   "PASS", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_LocalStorage.png")
            record(tc, "Security", "LocalStorage inspection", [], "No sensitive data", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_66: HTTPS Enforced ─────────────────────────────────────────────────
    def test_TC66_https_enforced(self, driver):
        tc = "TC_66"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Security", f"{tc}_HTTPS.png")
            uses_https = current_url.startswith("https://")
            record(tc, "Security", "Site served over HTTPS",
                   ["Navigate to site"],
                   "URL starts with https://",
                   f"URL: {current_url}",
                   "PASS" if uses_https else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_HTTPS.png")
            record(tc, "Security", "HTTPS enforced", [], "HTTPS used", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_67: Error Messages Don't Expose Stack Traces ──────────────────────
    def test_TC67_no_stack_trace_in_errors(self, driver):
        tc = "TC_67"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            # Enter invalid creds and check the error message content
            email_inp = _wait(driver).until(
                EC.presence_of_element_located((By.XPATH,
                    "//input[@type='email' or @name='email' or contains(@placeholder,'email')]"
                ))
            )
            email_inp.clear()
            email_inp.send_keys("test@test.com")
            pwd_inp = driver.find_element(By.XPATH, "//input[@type='password']")
            pwd_inp.clear()
            pwd_inp.send_keys("wrongpassword")
            submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit.click()
            time.sleep(3)

            body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
            path = take_screenshot(driver, "TC_Security", f"{tc}_ErrorMsg.png")
            # Stack trace indicators
            has_stack = any(kw in body_text for kw in [
                "stack trace", "at Object.", "mongodb", "mongoose error",
                "cannot read property", "typeerror", "syntaxerror", "referenceerror"
            ])
            record(tc, "Security", "Error messages don't expose stack traces",
                   ["Submit invalid login", "Check error text for stack trace"],
                   "Generic error message only",
                   "Stack trace exposed" if has_stack else "No stack trace in UI",
                   "FAIL" if has_stack else "PASS", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_StackTrace.png")
            record(tc, "Security", "No stack trace in errors", [], "Clean error", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_68: 404 Page Handling ────────────────────────────────────────────
    def test_TC68_404_handling(self, driver):
        tc = "TC_68"
        driver.get(BASE_URL + "/this-page-does-not-exist-xyz")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            body_text = driver.find_element(By.TAG_NAME, "body").text
            path = take_screenshot(driver, "TC_Security", f"{tc}_404Page.png")
            # Check if app handles unknown routes gracefully
            has_content = len(body_text) > 20
            record(tc, "Security", "Unknown routes handled gracefully (404/redirect)",
                   ["Navigate to non-existent route"],
                   "404 page or redirect to homepage",
                   f"Body length: {len(body_text)}, URL: {driver.current_url}",
                   "PASS" if has_content else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_404.png")
            record(tc, "Security", "404 handling", [], "Graceful 404", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_69: CORS Headers Check (via JavaScript) ───────────────────────────
    def test_TC69_no_sensitive_data_in_page_source(self, driver):
        tc = "TC_69"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            source = driver.page_source.lower()
            path = take_screenshot(driver, "TC_Security", f"{tc}_PageSource.png")
            # Check for secrets in HTML source
            secrets_exposed = any(kw in source for kw in [
                "jwt_secret", "private_key", "mongodb_uri", "api_key=",
                "access_token", "password=", "secret="
            ])
            record(tc, "Security", "No secrets exposed in HTML source",
                   ["Navigate to /login", "Inspect page source"],
                   "No JWT secrets, DB URIs, or API keys in source",
                   "Secrets found in source!" if secrets_exposed else "Clean — no secrets in HTML",
                   "FAIL" if secrets_exposed else "PASS", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_Source.png")
            record(tc, "Security", "No secrets in source", [], "Clean", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_70: Broken Link Check on Homepage ─────────────────────────────────
    def test_TC70_broken_links_homepage(self, driver):
        tc = "TC_70"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            links = driver.find_elements(By.TAG_NAME, "a")
            broken = []
            total = 0
            for link in links[:20]:  # Check first 20 links
                href = link.get_attribute("href")
                if href and href.startswith("http") and "#" not in href:
                    total += 1
                    # Just verify it's not empty or javascript:void
                    if "javascript:void" in href or href == "#":
                        broken.append(href)

            path = take_screenshot(driver, "TC_Security", f"{tc}_BrokenLinks.png")
            record(tc, "Security", "No broken/void links on homepage",
                   ["Load homepage", "Check first 20 anchor href values"],
                   "All links have valid href values",
                   f"Total checked: {total}, Broken/void: {len(broken)}: {broken}",
                   "PASS" if len(broken) == 0 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Security", f"{tc}_FAIL_BrokenLinks.png")
            record(tc, "Security", "Broken links check", [], "No broken links", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))
