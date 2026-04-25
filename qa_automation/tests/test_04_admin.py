"""
test_04_admin.py — Admin Module Tests
Module: Admin
TC_37 → TC_44
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


class TestAdminModule:

    # ── TC_37: Admin Dashboard Redirect (no auth) ───────────────────────────
    def test_TC37_admin_dashboard_redirect(self, driver):
        tc = "TC_37"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminDashboard.png")
            redirected = "/admin/dashboard" not in current_url
            record(tc, "Admin", "Admin dashboard redirects unauthenticated users",
                   ["Clear session", "Navigate to /admin/dashboard"],
                   "Redirected to /login",
                   f"Current URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminDash.png")
            record(tc, "Admin", "Admin dashboard redirect", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_38: Admin Users Route Redirect ───────────────────────────────────
    def test_TC38_admin_users_redirect(self, driver):
        tc = "TC_38"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/users")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminUsers.png")
            redirected = "/admin/users" not in current_url
            record(tc, "Admin", "Admin /users redirects unauthenticated users",
                   ["Clear session", "Navigate to /admin/users"],
                   "Redirected to /login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminUsers.png")
            record(tc, "Admin", "Admin users redirect", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_39: Admin Restaurants Route Redirect ──────────────────────────────
    def test_TC39_admin_restaurants_redirect(self, driver):
        tc = "TC_39"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/restaurants")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminRestaurants.png")
            redirected = "/admin/restaurants" not in current_url
            record(tc, "Admin", "Admin /restaurants redirects unauthenticated",
                   ["Clear session", "Navigate to /admin/restaurants"],
                   "Redirected to /login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminRest.png")
            record(tc, "Admin", "Admin restaurants redirect", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_40: Admin Orders Route Redirect ───────────────────────────────────
    def test_TC40_admin_orders_redirect(self, driver):
        tc = "TC_40"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/orders")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminOrders.png")
            redirected = "/admin/orders" not in current_url
            record(tc, "Admin", "Admin /orders redirects unauthenticated",
                   ["Clear session", "Navigate to /admin/orders"],
                   "Redirected to /login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminOrders.png")
            record(tc, "Admin", "Admin orders redirect", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_41: Admin Settings Route Redirect ─────────────────────────────────
    def test_TC41_admin_settings_redirect(self, driver):
        tc = "TC_41"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/settings")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminSettings.png")
            redirected = "/admin/settings" not in current_url
            record(tc, "Admin", "Admin /settings redirects unauthenticated",
                   ["Clear session", "Navigate to /admin/settings"],
                   "Redirected to /login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminSettings.png")
            record(tc, "Admin", "Admin settings redirect", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_42: Admin Delivery Partners Route Redirect ────────────────────────
    def test_TC42_admin_delivery_redirect(self, driver):
        tc = "TC_42"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/admin/delivery-partners")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminDelivery.png")
            redirected = "/admin/delivery-partners" not in current_url
            record(tc, "Admin", "Admin /delivery-partners redirects unauthenticated",
                   ["Clear session", "Navigate to /admin/delivery-partners"],
                   "Redirected to /login",
                   f"URL: {current_url}",
                   "PASS" if redirected else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminDelivery.png")
            record(tc, "Admin", "Admin delivery redirect", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_43: Customer Cannot Access Admin Route ────────────────────────────
    def test_TC43_cross_role_admin_access(self, driver):
        tc = "TC_43"
        # Try to login as customer then access admin
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        # Inject a fake customer token in localStorage to simulate a logged-in customer
        driver.get(BASE_URL)
        driver.execute_script("""
            window.localStorage.setItem('token', 'fake_customer_token_xyz');
            window.localStorage.setItem('user', JSON.stringify({role:'customer', name:'Test', email:'t@t.com'}));
        """)
        driver.get(BASE_URL + "/admin/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Admin", f"{tc}_CrossRoleAdmin.png")
            # With a fake token, the JWT validation should fail or RBAC should redirect
            blocked = "/admin/dashboard" not in current_url or "login" in current_url.lower()
            record(tc, "Admin", "Customer role cannot access admin dashboard",
                   ["Inject customer token", "Navigate to /admin/dashboard"],
                   "Blocked or redirected (invalid JWT is rejected by backend)",
                   f"URL: {current_url}",
                   "PASS" if blocked else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_CrossRole.png")
            record(tc, "Admin", "Cross-role admin access", [], "Blocked", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_44: Admin Login Page Accessible ──────────────────────────────────
    def test_TC44_admin_login_accessible(self, driver):
        tc = "TC_44"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Admin", f"{tc}_AdminLoginAccess.png")
            record(tc, "Admin", "Admin can access login page",
                   ["Navigate to /login"],
                   "Login page with form visible",
                   f"Inputs found: {len(inputs)}, URL: {driver.current_url}",
                   "PASS" if len(inputs) >= 2 else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Admin", f"{tc}_FAIL_AdminLogin.png")
            record(tc, "Admin", "Admin login page", [], "Login page visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))
