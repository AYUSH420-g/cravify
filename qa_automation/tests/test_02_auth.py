"""
test_02_auth.py — Authentication Module Tests
Module: Authentication
TC_09 → TC_22
"""

import pytest
import time
import random
import string
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from conftest import BASE_URL, take_screenshot, record

WAIT = 15


def _wait(driver):
    return WebDriverWait(driver, WAIT)


def random_email():
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"testuser_{suffix}@cravifyqa.com"


class TestAuthentication:

    # ── TC_09: Login Page Loads ─────────────────────────────────────────────
    def test_TC09_login_page_loads(self, driver):
        tc = "TC_09"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            # Look for email or username input
            inputs = driver.find_elements(By.XPATH,
                "//input[@type='email' or @type='text' or @name='email' or @placeholder]"
            )
            path = take_screenshot(driver, "TC_Auth", f"{tc}_LoginPage.png")
            status = "PASS" if len(inputs) > 0 else "FAIL"
            record(tc, "Authentication", "Login page loads with form",
                   ["Navigate to /login"],
                   "Login form visible with email/password fields",
                   f"Input fields found: {len(inputs)}", status, "Critical", path)
            if not status == "PASS":
                pytest.fail("Login form inputs not found")
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_Login.png")
            record(tc, "Authentication", "Login page loads", [], "Form visible", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_10: Invalid Login — Wrong Credentials ────────────────────────────
    def test_TC10_invalid_login(self, driver):
        tc = "TC_10"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            # Fill email
            email_field = _wait(driver).until(
                EC.presence_of_element_located((By.XPATH,
                    "//input[@type='email' or @name='email' or @placeholder[contains(translate(.,'EMAIL','email'),'email')]]"
                ))
            )
            email_field.clear()
            email_field.send_keys("wronguser@nowhere.com")

            # Fill password
            pwd_field = driver.find_element(By.XPATH,
                "//input[@type='password' or @name='password']"
            )
            pwd_field.clear()
            pwd_field.send_keys("WrongPass999!")

            # Submit
            submit = driver.find_element(By.XPATH,
                "//button[@type='submit' or contains(translate(text(),'LOGIN','login'),'login') "
                "or contains(translate(text(),'SIGNIN','signin'),'sign')]"
            )
            submit.click()
            time.sleep(3)

            # Look for error message
            errors = driver.find_elements(By.XPATH,
                "//*[contains(translate(text(),'INVALID ERROR INCORRECT','invalid error incorrect'),'invalid') "
                "or contains(translate(text(),'INVALID ERROR INCORRECT','invalid error incorrect'),'error') "
                "or contains(translate(text(),'INVALID ERROR INCORRECT','invalid error incorrect'),'incorrect') "
                "or contains(@class,'error') or contains(@class,'alert') or contains(@class,'toast')]"
            )
            path = take_screenshot(driver, "TC_Auth", f"{tc}_InvalidLogin.png")
            # Even staying on /login is a valid indicator of rejection
            current_url = driver.current_url
            on_login_page = "/login" in current_url or "/dashboard" not in current_url
            status = "PASS" if (len(errors) > 0 or on_login_page) else "FAIL"
            record(tc, "Authentication", "Invalid login shows error",
                   ["Go to /login", "Enter wrong credentials", "Submit"],
                   "Error message shown, user not logged in",
                   f"Error elements: {len(errors)}, URL: {current_url}",
                   status, "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_InvalidLogin.png")
            record(tc, "Authentication", "Invalid login", [], "Error shown", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_11: Empty Form Validation ────────────────────────────────────────
    def test_TC11_empty_form_validation(self, driver):
        tc = "TC_11"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            # Click submit without filling anything
            submit_btns = driver.find_elements(By.XPATH,
                "//button[@type='submit']"
            )
            if submit_btns:
                submit_btns[0].click()
                time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Auth", f"{tc}_EmptyForm.png")
            # Should stay on login page
            still_on_login = "/login" in current_url or "/dashboard" not in current_url
            status = "PASS" if still_on_login else "FAIL"
            record(tc, "Authentication", "Empty form does not submit",
                   ["Go to /login", "Click submit without filling form"],
                   "Form validation prevents submission",
                   f"URL after click: {current_url}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_EmptyForm.png")
            record(tc, "Authentication", "Empty form validation", [], "Form stays", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_12: Signup Page Loads ────────────────────────────────────────────
    def test_TC12_signup_page_loads(self, driver):
        tc = "TC_12"
        driver.get(BASE_URL + "/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_SignupPage.png")
            status = "PASS" if len(inputs) >= 2 else "FAIL"
            record(tc, "Authentication", "Signup page loads with form fields",
                   ["Navigate to /signup"],
                   "Signup form with multiple fields visible",
                   f"Input fields found: {len(inputs)}",
                   status, "Critical", path)
            if not status == "PASS":
                pytest.fail("Signup form incomplete")
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_Signup.png")
            record(tc, "Authentication", "Signup page loads", [], "Form visible", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_13: Register New User ────────────────────────────────────────────
    def test_TC13_register_new_user(self, driver):
        tc = "TC_13"
        driver.get(BASE_URL + "/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            new_email = random_email()
            inputs = driver.find_elements(By.TAG_NAME, "input")

            # Fill all visible inputs heuristically
            filled = 0
            for inp in inputs:
                itype = inp.get_attribute("type") or ""
                iname = (inp.get_attribute("name") or "").lower()
                iplace = (inp.get_attribute("placeholder") or "").lower()
                if itype == "hidden":
                    continue
                if "email" in itype or "email" in iname or "email" in iplace:
                    inp.clear(); inp.send_keys(new_email); filled += 1
                elif "password" in itype or "password" in iname or "pass" in iplace:
                    inp.clear(); inp.send_keys("TestPass@1234"); filled += 1
                elif "name" in iname or "name" in iplace or "full" in iplace:
                    inp.clear(); inp.send_keys("QA Test User"); filled += 1
                elif "phone" in iname or "phone" in iplace or "mobile" in iplace:
                    inp.clear(); inp.send_keys("9876543210"); filled += 1

            time.sleep(0.5)
            submit = driver.find_element(By.XPATH,
                "//button[@type='submit' or contains(translate(text(),'SIGNUP REGISTER CREATE','signup register create'),'sign') "
                "or contains(translate(text(),'SIGNUP REGISTER CREATE','signup register create'),'register') "
                "or contains(translate(text(),'SIGNUP REGISTER CREATE','signup register create'),'create')]"
            )
            submit.click()
            time.sleep(4)

            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Auth", f"{tc}_Register.png")
            # Success = redirected away from /signup, or success toast
            success = "/signup" not in current_url or "/login" in current_url or "/" == current_url.rstrip("/").split("/")[-1]
            record(tc, "Authentication", f"Register new user ({new_email})",
                   ["Go to /signup", "Fill all fields", "Click submit"],
                   "User registered, redirected or success message shown",
                   f"After submit URL: {current_url}, filled: {filled} fields",
                   "PASS" if success else "FAIL", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_Register.png")
            record(tc, "Authentication", "Register new user", [], "User created", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_14: Forgot Password Page ─────────────────────────────────────────
    def test_TC14_forgot_password_page(self, driver):
        tc = "TC_14"
        driver.get(BASE_URL + "/forgot-password")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_ForgotPassword.png")
            status = "PASS" if len(inputs) >= 1 else "FAIL"
            record(tc, "Authentication", "Forgot password page loads",
                   ["Navigate to /forgot-password"],
                   "Form with email input visible",
                   f"Inputs found: {len(inputs)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_ForgotPwd.png")
            record(tc, "Authentication", "Forgot password", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_15: Vendor Login Page Loads ──────────────────────────────────────
    def test_TC15_vendor_login_page(self, driver):
        tc = "TC_15"
        driver.get(BASE_URL + "/vendor/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_VendorLogin.png")
            status = "PASS" if len(inputs) >= 2 else "FAIL"
            record(tc, "Authentication", "Vendor login page loads",
                   ["Navigate to /vendor/login"],
                   "Login form with credentials fields",
                   f"Inputs: {len(inputs)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_VendorLogin.png")
            record(tc, "Authentication", "Vendor login page", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_16: Rider Login Page Loads ───────────────────────────────────────
    def test_TC16_rider_login_page(self, driver):
        tc = "TC_16"
        driver.get(BASE_URL + "/delivery/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_RiderLogin.png")
            status = "PASS" if len(inputs) >= 2 else "FAIL"
            record(tc, "Authentication", "Rider/Delivery login page loads",
                   ["Navigate to /delivery/login"],
                   "Login form visible",
                   f"Inputs: {len(inputs)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_RiderLogin.png")
            record(tc, "Authentication", "Rider login page", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_17: Admin Route Protection (Unauthenticated) ─────────────────────
    def test_TC17_admin_route_protection(self, driver):
        tc = "TC_17"
        # Clear any existing session
        driver.get(BASE_URL)
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        time.sleep(1)

        driver.get(BASE_URL + "/admin/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Auth", f"{tc}_AdminProtection.png")
            # Should redirect away from /admin/dashboard
            redirected = "/admin/dashboard" not in current_url
            status = "PASS" if redirected else "FAIL"
            record(tc, "Authentication", "Admin route protection — unauthenticated redirect",
                   ["Clear cookies/session", "Navigate to /admin/dashboard"],
                   "Redirected to /login or /",
                   f"Current URL: {current_url}",
                   status, "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_AdminProtection.png")
            record(tc, "Authentication", "Admin route protection", [], "Redirect to login", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_18: Vendor Route Protection ─────────────────────────────────────
    def test_TC18_vendor_route_protection(self, driver):
        tc = "TC_18"
        driver.get(BASE_URL)
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        time.sleep(1)

        driver.get(BASE_URL + "/vendor/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Auth", f"{tc}_VendorProtection.png")
            redirected = "/vendor/dashboard" not in current_url
            status = "PASS" if redirected else "FAIL"
            record(tc, "Authentication", "Vendor dashboard protection",
                   ["Clear session", "Navigate to /vendor/dashboard"],
                   "Redirected to /vendor/login",
                   f"Current URL: {current_url}",
                   status, "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_VendorProtection.png")
            record(tc, "Authentication", "Vendor route protection", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_19: Delivery Route Protection ────────────────────────────────────
    def test_TC19_delivery_route_protection(self, driver):
        tc = "TC_19"
        driver.get(BASE_URL)
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        time.sleep(1)

        driver.get(BASE_URL + "/delivery/dashboard")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Auth", f"{tc}_DeliveryProtection.png")
            redirected = "/delivery/dashboard" not in current_url
            status = "PASS" if redirected else "FAIL"
            record(tc, "Authentication", "Delivery dashboard protection",
                   ["Clear session", "Navigate to /delivery/dashboard"],
                   "Redirected to /delivery/login",
                   f"Current URL: {current_url}",
                   status, "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_DeliveryProtection.png")
            record(tc, "Authentication", "Delivery route protection", [], "Redirect", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_20: Vendor Signup Page ────────────────────────────────────────────
    def test_TC20_vendor_signup_page(self, driver):
        tc = "TC_20"
        driver.get(BASE_URL + "/vendor/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_VendorSignup.png")
            status = "PASS" if len(inputs) >= 2 else "FAIL"
            record(tc, "Authentication", "Vendor signup page loads",
                   ["Navigate to /vendor/signup"],
                   "Multi-field vendor registration form",
                   f"Inputs found: {len(inputs)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_VendorSignup.png")
            record(tc, "Authentication", "Vendor signup", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_21: Rider Signup Page ─────────────────────────────────────────────
    def test_TC21_rider_signup_page(self, driver):
        tc = "TC_21"
        driver.get(BASE_URL + "/delivery/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            inputs = driver.find_elements(By.TAG_NAME, "input")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_RiderSignup.png")
            status = "PASS" if len(inputs) >= 2 else "FAIL"
            record(tc, "Authentication", "Rider signup page loads",
                   ["Navigate to /delivery/signup"],
                   "Rider registration form visible",
                   f"Inputs found: {len(inputs)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_RiderSignup.png")
            record(tc, "Authentication", "Rider signup", [], "Form visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_22: Password Field Masking ────────────────────────────────────────
    def test_TC22_password_masking(self, driver):
        tc = "TC_22"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            pwd_fields = driver.find_elements(By.XPATH, "//input[@type='password']")
            path = take_screenshot(driver, "TC_Auth", f"{tc}_PasswordMasking.png")
            status = "PASS" if len(pwd_fields) > 0 else "FAIL"
            record(tc, "Authentication", "Password field is masked (type=password)",
                   ["Go to /login", "Inspect password input type"],
                   "Password input has type='password'",
                   f"Password fields found: {len(pwd_fields)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Auth", f"{tc}_FAIL_Masking.png")
            record(tc, "Authentication", "Password masking", [], "Masked input", str(e), "FAIL", "High", path)
            pytest.fail(str(e))
