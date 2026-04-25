"""
test_06_delivery.py — Delivery Partner Module Tests
Module: Delivery
TC_53 → TC_60
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


class TestDeliveryModule:

    # ── TC_53: Delivery Login Page ───────────────────────────────────────────
    def test_TC53_delivery_login_page(self, driver):
        tc = "TC_53"
        driver.get(BASE_URL + "/delivery/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryLogin.png")
            record(tc, "Delivery", "Delivery login page loads with form",
                   ["Navigate to /delivery/login"],
                   "Login form visible",
                   f"Inputs: {len(inputs)}",
                   "PASS" if len(inputs) >= 2 else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvLogin.png")
            record(tc, "Delivery", "Delivery login page", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_54: Delivery Dashboard Requires Auth ─────────────────────────────
    def test_TC54_delivery_dashboard_auth(self, driver):
        tc = "TC_54"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/delivery/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryDashboard.png")
            redirected = "/delivery/dashboard" not in current_url
            record(tc, "Delivery", "Delivery dashboard requires authentication",
                   ["Clear session", "Navigate to /delivery/dashboard"],
                   "Redirected to /delivery/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvDash.png")
            record(tc, "Delivery", "Delivery dashboard auth", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_55: Delivery History Requires Auth ───────────────────────────────
    def test_TC55_delivery_history_auth(self, driver):
        tc = "TC_55"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/delivery/history")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryHistory.png")
            redirected = "/delivery/history" not in current_url
            record(tc, "Delivery", "Delivery history requires authentication",
                   ["Clear session", "Navigate to /delivery/history"],
                   "Redirected to /delivery/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvHistory.png")
            record(tc, "Delivery", "Delivery history auth", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_56: Delivery Earnings Requires Auth ──────────────────────────────
    def test_TC56_delivery_earnings_auth(self, driver):
        tc = "TC_56"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/delivery/earnings")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryEarnings.png")
            redirected = "/delivery/earnings" not in current_url
            record(tc, "Delivery", "Delivery earnings requires authentication",
                   ["Clear session", "Navigate to /delivery/earnings"],
                   "Redirected to /delivery/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvEarnings.png")
            record(tc, "Delivery", "Delivery earnings auth", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_57: Delivery Profile Requires Auth ───────────────────────────────
    def test_TC57_delivery_profile_auth(self, driver):
        tc = "TC_57"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/delivery/profile")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryProfile.png")
            redirected = "/delivery/profile" not in current_url
            record(tc, "Delivery", "Delivery profile requires authentication",
                   ["Clear session", "Navigate to /delivery/profile"],
                   "Redirected to /delivery/login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvProfile.png")
            record(tc, "Delivery", "Delivery profile auth", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_58: Delivery Signup Page ─────────────────────────────────────────
    def test_TC58_delivery_signup_page(self, driver):
        tc = "TC_58"
        driver.get(BASE_URL + "/delivery/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliverySignup.png")
            record(tc, "Delivery", "Delivery signup page loads",
                   ["Navigate to /delivery/signup"],
                   "Rider registration form visible",
                   f"Inputs: {len(inputs)}",
                   "PASS" if len(inputs) >= 2 else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvSignup.png")
            record(tc, "Delivery", "Delivery signup page", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_59: Delivery Invalid Login ───────────────────────────────────────
    def test_TC59_delivery_invalid_login(self, driver):
        tc = "TC_59"
        driver.get(BASE_URL + "/delivery/login")
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
            email_inp.clear()
            email_inp.send_keys("badrider@fake.com")
            pwd_inp = driver.find_element(By.XPATH, "//input[@type='password']")
            pwd_inp.clear()
            pwd_inp.send_keys("BadRider999!")

            submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit.click()
            time.sleep(3)

            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryInvalidLogin.png")
            blocked = "/delivery/login" in current_url or "/delivery/dashboard" not in current_url
            record(tc, "Delivery", "Delivery invalid login rejected",
                   ["Go to /delivery/login", "Enter bad credentials", "Submit"],
                   "Error shown or stays on login",
                   f"URL: {current_url}",
                   "PASS" if blocked else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvInvalidLogin.png")
            record(tc, "Delivery", "Delivery invalid login", [], "Error shown", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_60: Delivery Login has Password Field ─────────────────────────────
    def test_TC60_delivery_password_field(self, driver):
        tc = "TC_60"
        driver.get(BASE_URL + "/delivery/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            pwd_fields = driver.find_elements(By.XPATH, "//input[@type='password']")
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_DeliveryPwdField.png")
            record(tc, "Delivery", "Delivery login has masked password field",
                   ["Go to /delivery/login", "Check password field type"],
                   "Password field with type='password' (masked)",
                   f"Password fields: {len(pwd_fields)}",
                   "PASS" if len(pwd_fields) > 0 else "FAIL", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Delivery", f"{tc}_FAIL_DelvPwd.png")
            record(tc, "Delivery", "Delivery password field", [], "Masked", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))
