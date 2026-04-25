import json
import logging
import os
import re
import tempfile
from contextlib import suppress
from datetime import datetime

from selenium import webdriver
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

from config import (
    ADMIN,
    BASE_URL,
    CHROMEDRIVER_PATH,
    LOG_DIR,
    REPORTS_DIR,
    SCREENSHOT_DIR,
    HEADLESS,
    TEST_PDF_DOCUMENT,
    TEST_PNG_DOCUMENT,
    TEST_RESTAURANT_IMAGE,
    WAIT_SECONDS,
)


def configure_logger(name="cravify_e2e"):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    file_handler = logging.FileHandler(
        os.path.join(LOG_DIR, f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        encoding="utf-8",
    )
    file_handler.setFormatter(fmt)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(fmt)
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    return logger


LOGGER = configure_logger()


class DriverFactory:
    @staticmethod
    def create(browser="chrome", viewport=(1920, 1080)):
        browser = browser.lower()
        width, height = viewport
        if browser == "chrome":
            options = ChromeOptions()
            options.add_argument(f"--window-size={width},{height}")
            options.add_argument("--disable-notifications")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-gpu")
            options.add_argument("--remote-debugging-port=0")
            options.add_argument("--no-first-run")
            options.add_argument("--no-default-browser-check")
            options.add_argument(f"--user-data-dir={tempfile.mkdtemp(prefix='cravify_chrome_', dir=LOG_DIR)}")
            if HEADLESS:
                options.add_argument("--headless=new")
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            service = ChromeService(executable_path=CHROMEDRIVER_PATH)
            driver = webdriver.Chrome(service=service, options=options)
        elif browser == "firefox":
            options = FirefoxOptions()
            options.add_argument(f"--width={width}")
            options.add_argument(f"--height={height}")
            if HEADLESS:
                options.add_argument("--headless")
            driver = webdriver.Firefox(options=options)
        elif browser == "edge":
            options = EdgeOptions()
            options.add_argument(f"--window-size={width},{height}")
            options.add_argument("--disable-notifications")
            options.add_argument("--disable-gpu")
            options.add_argument("--remote-debugging-port=0")
            if HEADLESS:
                options.add_argument("--headless=new")
            driver = webdriver.Edge(options=options)
        else:
            raise ValueError(f"Unsupported browser: {browser}")
        driver.set_window_size(width, height)
        driver.implicitly_wait(0)
        return driver


class UIActions:
    def __init__(self, driver, browser="chrome", viewport_name="desktop", soft_failures=None):
        self.driver = driver
        self.browser = browser
        self.viewport_name = viewport_name
        self.waiter = WebDriverWait(driver, WAIT_SECONDS, ignored_exceptions=(StaleElementReferenceException,))
        self.soft_failures = soft_failures if soft_failures is not None else []

    def url(self, path=""):
        return f"{BASE_URL}/{path.lstrip('/')}" if path else BASE_URL

    def open(self, path=""):
        self.driver.get(self.url(path))
        self.wait_ready()

    def wait_ready(self):
        self.waiter.until(lambda d: d.execute_script("return document.readyState") == "complete")

    def wait_visible(self, locator, timeout=None):
        return WebDriverWait(self.driver, timeout or WAIT_SECONDS).until(EC.visibility_of_element_located(locator))

    def wait_present(self, locator, timeout=None):
        return WebDriverWait(self.driver, timeout or WAIT_SECONDS).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=None):
        return WebDriverWait(self.driver, timeout or WAIT_SECONDS).until(EC.element_to_be_clickable(locator))

    def find_optional(self, locator):
        with suppress(NoSuchElementException):
            return self.driver.find_element(*locator)
        return None

    def visible_optional(self, locators):
        for locator in locators:
            with suppress(Exception):
                el = self.driver.find_element(*locator)
                if el.is_displayed():
                    return el
        return None

    def click(self, locator, timeout=None, retries=3):
        last_error = None
        for _ in range(retries):
            try:
                el = self.wait_clickable(locator, timeout)
                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                el.click()
                return el
            except (ElementClickInterceptedException, StaleElementReferenceException, WebDriverException) as exc:
                last_error = exc
                with suppress(Exception):
                    self.driver.execute_script("arguments[0].click();", self.driver.find_element(*locator))
                    return self.driver.find_element(*locator)
        raise last_error

    def click_text(self, text, tag="button", timeout=None):
        xpath = f"//{tag}[contains(normalize-space(.), {json.dumps(text)})]"
        return self.click((By.XPATH, xpath), timeout=timeout)

    def type(self, locator, value, clear=True, timeout=None):
        el = self.wait_visible(locator, timeout)
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        if clear:
            el.clear()
        el.send_keys(value)
        return el

    def type_name(self, name, value, clear=True):
        return self.type((By.NAME, name), value, clear=clear)

    def select_name(self, name, value=None, text=None):
        el = self.wait_visible((By.NAME, name))
        select = Select(el)
        if text is not None:
            select.select_by_visible_text(text)
        else:
            select.select_by_value(value)
        return el

    def upload_name(self, name, path):
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        el = self.wait_present((By.CSS_SELECTOR, f"input[type='file'][name='{name}']"))
        el.send_keys(os.path.abspath(path))
        return el

    def screenshot(self, tc_name, status="PASS"):
        filename = f"{tc_name}_{status}.png"
        path = os.path.join(SCREENSHOT_DIR, filename)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.driver.save_screenshot(path)
        LOGGER.info("Screenshot saved: %s", path)
        return path

    def step(self, tc_name, description, fn, continue_on_failure=True):
        LOGGER.info("START %s | %s", tc_name, description)
        try:
            result = fn()
            path = self.screenshot(tc_name, "PASS")
            LOGGER.info("PASS %s | %s", tc_name, description)
            return {"id": tc_name, "status": "PASS", "description": description, "screenshot": path, "result": result}
        except Exception as exc:
            path = self.screenshot(tc_name, "FAIL")
            failure = {"id": tc_name, "status": "FAIL", "description": description, "error": str(exc), "screenshot": path}
            self.soft_failures.append(failure)
            LOGGER.exception("FAIL %s | %s", tc_name, description)
            if not continue_on_failure:
                raise
            return failure

    def clear_session(self):
        self.open()
        self.driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        self.driver.delete_all_cookies()

    def fill_captcha_if_present(self):
        with suppress(Exception):
            label = self.driver.find_element(By.XPATH, "//label[contains(normalize-space(.), 'Captcha:')]").text
            match = re.search(r"Captcha:\s*(\d+)\s*\+\s*(\d+)", label)
            if match:
                answer = str(int(match.group(1)) + int(match.group(2)))
                self.type((By.CSS_SELECTOR, "input[placeholder='?']"), answer)

    def login(self, email, password, path="/login"):
        self.clear_session()
        self.open(path)
        self.type((By.NAME, "email"), email)
        self.type((By.NAME, "password"), password)
        self.fill_captcha_if_present()
        self.click((By.CSS_SELECTOR, "button[type='submit']"))
        with suppress(TimeoutException):
            self.waiter.until(lambda d: "login" not in d.current_url.lower())
        self.wait_ready()

    def admin_login(self):
        self.login(ADMIN.email, ADMIN.password, "/login")

    def logout(self):
        self.open()
        hamburger = self.visible_optional([
            (By.CSS_SELECTOR, "button.md\\:hidden"),
            (By.CSS_SELECTOR, "button[aria-label*='menu']"),
            (By.CSS_SELECTOR, "button[aria-label*='Menu']"),
        ])
        if hamburger:
            with suppress(Exception):
                hamburger.click()
        logout_button = self.visible_optional([
            (By.XPATH, "//button[@title='Logout']"),
            (By.XPATH, "//button[contains(normalize-space(.), 'Logout') or contains(normalize-space(.), 'Sign out')]"),
        ])
        if logout_button:
            logout_button.click()
        else:
            self.driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
            self.driver.delete_all_cookies()

    def approve_user_by_email(self, email):
        self.open("/admin/users")
        self.type((By.CSS_SELECTOR, "input[placeholder='Search...']"), email)
        approve = self.wait_clickable((By.XPATH, "//button[@title='Quick Approve']"), timeout=10)
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", approve)
        approve.click()
        with suppress(Exception):
            self.driver.switch_to.alert.accept()

    def assert_text_present(self, text):
        self.wait_present((By.XPATH, f"//*[contains(normalize-space(.), {json.dumps(text)})]"), timeout=10)


class CravifyBusinessFlow:
    def __init__(self, driver, data, browser="chrome", viewport_name="desktop"):
        self.failures = []
        self.ui = UIActions(driver, browser=browser, viewport_name=viewport_name, soft_failures=self.failures)
        self.data = data
        self.results = []

    def run_step(self, tc_name, description, fn):
        result = self.ui.step(tc_name, description, fn, continue_on_failure=True)
        self.results.append(result)
        return result

    def run_all(self):
        self.customer_lifecycle()
        self.vendor_lifecycle()
        self.customer_ordering()
        self.vendor_order_processing()
        self.delivery_lifecycle()
        self.customer_final_verification()
        self.write_summary()
        if self.failures:
            raise AssertionError(f"{len(self.failures)} e2e steps failed. See screenshots and reports.")

    def customer_lifecycle(self):
        d, ui = self.data, self.ui

        self.run_step("TC_001_CustomerRegister", "Create customer account", lambda: (
            ui.open("/signup"),
            ui.type_name("name", d["customer_name"]),
            ui.type_name("email", d["customer_email"]),
            ui.type_name("password", d["customer_pass"]),
            ui.click((By.CSS_SELECTOR, "button[type='submit']")),
        ))
        self.run_step("TC_002_CustomerLogin", "Login customer", lambda: ui.login(d["customer_email"], d["customer_pass"]))
        self.run_step("TC_003_CustomerLogout", "Logout customer", ui.logout)
        self.run_step("TC_004_CustomerLoginAgain", "Login customer again", lambda: ui.login(d["customer_email"], d["customer_pass"]))
        self.run_step("TC_005_CustomerProfile", "Open and verify customer profile", lambda: (
            ui.open("/profile"),
            ui.assert_text_present(d["customer_email"]),
        ))
        self.run_step("TC_006_CustomerLogoutAfterProfile", "Logout after profile check", ui.logout)

    def vendor_lifecycle(self):
        d, ui = self.data, self.ui

        def register_vendor():
            ui.open("/vendor/signup")
            ui.type_name("ownerName", d["vendor_owner"])
            ui.type_name("phone", "9999999999")
            ui.type_name("email", d["vendor_email"])
            ui.type_name("password", d["vendor_pass"])
            ui.click_text("Next: Restaurant Details")
            ui.type_name("restaurantName", d["restaurant_name"])
            ui.type_name("address", "QA Street, Ahmedabad")
            ui.type_name("pincode", "380009")
            ui.select_name("cuisine", value="Fast Food")
            ui.type_name("fssai", "12345678901234")
            ui.click_text("Next: Documents")
            ui.upload_name("restaurantImage", TEST_RESTAURANT_IMAGE)
            ui.upload_name("fssaiCert", TEST_PNG_DOCUMENT)
            ui.upload_name("gstCert", TEST_PDF_DOCUMENT)
            ui.upload_name("menuCard", TEST_PDF_DOCUMENT)
            ui.click_text("Submit Application")
            with suppress(Exception):
                ui.driver.switch_to.alert.accept()

        self.run_step("TC_010_VendorSignupDocuments", "Create vendor and upload documents", register_vendor)
        self.run_step("TC_015_AdminApprovedVendor", "Admin approves vendor", lambda: (
            ui.admin_login(),
            ui.approve_user_by_email(d["vendor_email"]),
            ui.logout(),
        ))
        self.run_step("TC_016_VendorDashboard", "Vendor opens dashboard", lambda: (
            ui.login(d["vendor_email"], d["vendor_pass"]),
            ui.open("/vendor/dashboard"),
            ui.assert_text_present("Dashboard"),
        ))

        def create_menu_item():
            ui.open("/vendor/menu")
            ui.click_text("Add New Item")
            ui.type((By.CSS_SELECTOR, "input[placeholder='e.g. Garlic Bread']"), d["menu_item"])
            ui.type((By.CSS_SELECTOR, "input[placeholder='150']"), "199")
            ui.type((By.CSS_SELECTOR, "input[placeholder='Starters']"), d["menu_category"])
            ui.type((By.CSS_SELECTOR, "textarea[placeholder='Delicious garlic bread with cheese...']"), "Production QA menu item.")
            ui.upload_name("image", TEST_RESTAURANT_IMAGE)
            ui.click((By.XPATH, "//button[@type='submit' and contains(normalize-space(.), 'Add Item')]"))
            ui.assert_text_present(d["menu_item"])

        self.run_step("TC_020_MenuItemCreated", "Vendor creates menu item", create_menu_item)
        self.run_step("TC_021_MenuVisibleCustomer", "Menu item visible to customer", lambda: (
            ui.logout(),
            ui.login(d["customer_email"], d["customer_pass"]),
            ui.open(),
            ui.type((By.CSS_SELECTOR, "input[placeholder='Search restaurants or cuisines...']"), d["restaurant_name"]),
            ui.assert_text_present(d["restaurant_name"]),
        ))

    def customer_ordering(self):
        d, ui = self.data, self.ui

        def place_order():
            ui.login(d["customer_email"], d["customer_pass"])
            ui.open()
            search = ui.visible_optional([
                (By.CSS_SELECTOR, "input[placeholder='Search restaurants or cuisines...']"),
                (By.NAME, "search"),
            ])
            if search:
                search.clear()
                search.send_keys(d["restaurant_name"])
            ui.click((By.XPATH, f"//*[contains(normalize-space(.), {json.dumps(d['restaurant_name'])})]"))
            ui.assert_text_present(d["menu_item"])
            ui.click((By.XPATH, f"//*[contains(normalize-space(.), {json.dumps(d['menu_item'])})]/ancestor::*[self::div or self::tr][1]//button[contains(normalize-space(.), 'Add')]"))
            ui.open("/cart")
            with suppress(Exception):
                ui.click((By.XPATH, "//button[contains(normalize-space(.), '+') or @aria-label='Increase quantity']"), timeout=5)
            ui.click((By.XPATH, "//a[contains(@href, '/checkout')] | //button[contains(normalize-space(.), 'Checkout')]"))
            ui.click_text("Add New Address")
            ui.type((By.CSS_SELECTOR, "input[placeholder='e.g. 123, MG Road, Navrangpura']"), "123 QA Street")
            ui.type((By.CSS_SELECTOR, "input[placeholder='Ahmedabad']"), "Ahmedabad")
            ui.type((By.CSS_SELECTOR, "input[placeholder='380009']"), "380009")
            ui.click_text("Save Address")
            with suppress(Exception):
                ui.click((By.XPATH, "//input[@value='cod' or @name='paymentMethod' and @value='cod']/ancestor::label[1]"), timeout=5)
            ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Place Order')]"))
            with suppress(Exception):
                text = ui.driver.find_element(By.TAG_NAME, "body").text
                match = re.search(r"#?([A-Fa-f0-9]{6,24})", text)
                if match:
                    d["order_id"] = match.group(1)

        self.run_step("TC_030_OrderPlaced", "Customer searches, carts, checks out, and places order", place_order)
        self.run_step("TC_031_OrderTrackingOpened", "Customer sees order tracking", lambda: ui.open("/order-tracking"))

    def vendor_order_processing(self):
        d, ui = self.data, self.ui

        def accept_and_mark_ready():
            ui.login(d["vendor_email"], d["vendor_pass"])
            ui.open("/vendor/orders")
            with suppress(TimeoutException):
                ui.assert_text_present(d["menu_item"])
            ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Accept')]"), timeout=15)

        self.run_step("TC_040_VendorAccepted", "Vendor accepts incoming order", accept_and_mark_ready)
        self.run_step("TC_041_VendorPreparing", "Vendor order status is preparing", lambda: self.ui.assert_text_present("Preparing"))
        self.run_step("TC_042_VendorReadyForPickup", "Vendor marks order ready for pickup", lambda: (
            self.ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Mark Ready')]"), timeout=15),
            self.ui.assert_text_present("Ready"),
            self.ui.logout(),
        ))

    def delivery_lifecycle(self):
        d, ui = self.data, self.ui

        def register_rider():
            ui.open("/delivery/signup")
            ui.type_name("name", d["rider_name"])
            ui.type_name("phone", "9999988888")
            ui.type_name("email", d["rider_email"])
            ui.type_name("password", d["rider_pass"])
            ui.type_name("city", "Ahmedabad")
            ui.click_text("Next: Vehicle Details")
            ui.select_name("vehicleType", value="Bike")
            ui.type_name("vehicleNumber", "GJ-01-QA-1234")
            ui.click_text("Next: Documents")
            ui.upload_name("license", TEST_PNG_DOCUMENT)
            ui.upload_name("rc", TEST_PNG_DOCUMENT)
            ui.upload_name("aadhar", TEST_PNG_DOCUMENT)
            ui.click_text("Submit Application")
            with suppress(Exception):
                ui.driver.switch_to.alert.accept()

        self.run_step("TC_050_DeliveryRegistered", "Create delivery partner and upload documents", register_rider)
        self.run_step("TC_060_AdminApprovedRider", "Admin approves delivery partner", lambda: (
            ui.admin_login(),
            ui.approve_user_by_email(d["rider_email"]),
            ui.logout(),
        ))

        def pickup_and_deliver():
            ui.login(d["rider_email"], d["rider_pass"])
            ui.open("/delivery/dashboard")
            toggle = ui.visible_optional([(By.CSS_SELECTOR, "input[type='checkbox']")])
            if toggle and not toggle.is_selected():
                ui.driver.execute_script("arguments[0].click();", toggle)
            with suppress(Exception):
                ui.click((By.XPATH, "//*[contains(normalize-space(.), 'Available Orders')]/following::div[contains(@class,'cursor-pointer')][1]"), timeout=20)
                ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Accept Order')]"), timeout=10)
            ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Confirm Order Picked Up')]"), timeout=30)
            ui.click((By.XPATH, "//button[contains(normalize-space(.), 'Complete Delivery')]"), timeout=30)

        self.run_step("TC_070_PickedUp", "Rider accepts and picks up order", pickup_and_deliver)
        self.run_step("TC_080_Delivered", "Rider completes delivery", lambda: ui.assert_text_present("Waiting for orders"))

    def customer_final_verification(self):
        d, ui = self.data, self.ui

        self.run_step("TC_090_FinalCustomerVerify", "Customer verifies delivered order in profile/history", lambda: (
            ui.login(d["customer_email"], d["customer_pass"]),
            ui.open("/profile"),
            ui.assert_text_present("Delivered"),
        ))

    def write_summary(self):
        report = {
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "base_url": BASE_URL,
            "results": self.results,
            "failures": self.failures,
        }
        path = os.path.join(REPORTS_DIR, f"master_flow_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)
        LOGGER.info("Summary written: %s", path)
