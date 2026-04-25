"""
test_05_vendor.py — Vendor Module Tests
Module: Vendor
TC_45 → TC_52
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


class TestVendorModule:

    # ── TC_45: Vendor Login Form ─────────────────────────────────────────────
    def test_TC45_vendor_login_form(self, driver):
        tc = "TC_45"
        driver.get(BASE_URL + "/vendor/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorLoginForm.png")
            record(tc, "Vendor", "Vendor login form present",
                   ["Navigate to /vendor/login"],
                   "Login form with email and password fields",
                   f"Inputs found: {len(inputs)}",
                   "PASS" if len(inputs) >= 2 else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorLogin.png")
            record(tc, "Vendor", "Vendor login form", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_46: Vendor Invalid Login ──────────────────────────────────────────
    def test_TC46_vendor_invalid_login(self, driver):
        tc = "TC_46"
        driver.get(BASE_URL + "/vendor/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            email_inp = driver.find_element(By.XPATH,
                "//input[@type='email' or @name='email' or contains(@placeholder,'email')]"
            )
            email_inp.clear()
            email_inp.send_keys("badvendor@fake.com")

            pwd_inp = driver.find_element(By.XPATH, "//input[@type='password']")
            pwd_inp.clear()
            pwd_inp.send_keys("WrongPass999!")

            submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit.click()
            time.sleep(3)

            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorInvalidLogin.png")
            still_blocked = "/vendor/login" in current_url or "/vendor/dashboard" not in current_url
            record(tc, "Vendor", "Vendor invalid login shows error or stays on login",
                   ["Go to /vendor/login", "Enter bad credentials", "Submit"],
                   "Error shown, not redirected to dashboard",
                   f"URL: {current_url}",
                   "PASS" if still_blocked else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorInvalidLogin.png")
            record(tc, "Vendor", "Vendor invalid login", [], "Error shown", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_47: Vendor Dashboard Requires Auth ───────────────────────────────
    def test_TC47_vendor_dashboard_auth(self, driver):
        tc = "TC_47"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/vendor/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorDashboard.png")
            redirected = "/vendor/dashboard" not in current_url
            record(tc, "Vendor", "Vendor dashboard requires authentication",
                   ["Clear session", "Navigate to /vendor/dashboard"],
                   "Redirected to /vendor/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorDash.png")
            record(tc, "Vendor", "Vendor dashboard auth", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_48: Vendor Menu Requires Auth ────────────────────────────────────
    def test_TC48_vendor_menu_auth(self, driver):
        tc = "TC_48"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/vendor/menu")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorMenu.png")
            redirected = "/vendor/menu" not in current_url
            record(tc, "Vendor", "Vendor menu requires authentication",
                   ["Clear session", "Navigate to /vendor/menu"],
                   "Redirected to /vendor/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorMenu.png")
            record(tc, "Vendor", "Vendor menu auth", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_49: Vendor Orders Requires Auth ─────────────────────────────────
    def test_TC49_vendor_orders_auth(self, driver):
        tc = "TC_49"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/vendor/orders")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorOrders.png")
            redirected = "/vendor/orders" not in current_url
            record(tc, "Vendor", "Vendor orders requires authentication",
                   ["Clear session", "Navigate to /vendor/orders"],
                   "Redirected to /vendor/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorOrders.png")
            record(tc, "Vendor", "Vendor orders auth", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_50: Vendor History Requires Auth ─────────────────────────────────
    def test_TC50_vendor_history_auth(self, driver):
        tc = "TC_50"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/vendor/history")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorHistory.png")
            redirected = "/vendor/history" not in current_url
            record(tc, "Vendor", "Vendor history requires authentication",
                   ["Clear session", "Navigate to /vendor/history"],
                   "Redirected to /vendor/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorHistory.png")
            record(tc, "Vendor", "Vendor history auth", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_51: Vendor Signup Form Fields ────────────────────────────────────
    def test_TC51_vendor_signup_fields(self, driver):
        tc = "TC_51"
        driver.get(BASE_URL + "/vendor/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            selects = driver.find_elements(By.TAG_NAME, "select")
            textareas = driver.find_elements(By.TAG_NAME, "textarea")
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorSignupFields.png")
            total = len(inputs) + len(selects) + len(textareas)
            record(tc, "Vendor", "Vendor signup form has comprehensive fields",
                   ["Navigate to /vendor/signup", "Count form fields"],
                   "Multi-step registration with 5+ fields",
                   f"Inputs: {len(inputs)}, Selects: {len(selects)}, Textareas: {len(textareas)}",
                   "PASS" if total >= 3 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorSignup.png")
            record(tc, "Vendor", "Vendor signup fields", [], "Fields visible", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_52: Vendor Signup Link to Login ──────────────────────────────────
    def test_TC52_vendor_signup_login_link(self, driver):
        tc = "TC_52"
        driver.get(BASE_URL + "/vendor/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            login_links = driver.find_elements(By.XPATH,
                "//a[contains(@href,'/vendor/login') or contains(translate(text(),'LOGIN','login'),'login')]"
            )
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_VendorSignupLoginLink.png")
            record(tc, "Vendor", "Vendor signup has link to login",
                   ["Navigate to /vendor/signup", "Look for login link"],
                   "Login link visible on signup page",
                   f"Login links found: {len(login_links)}",
                   "PASS" if len(login_links) > 0 else "WARN", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Vendor", f"{tc}_FAIL_VendorSignupLink.png")
            record(tc, "Vendor", "Vendor signup login link", [], "Link visible", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))
