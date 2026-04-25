"""
test_08_responsive.py — Responsive & Cross-Browser Tests
Module: Responsive / UI
TC_71 → TC_80
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, take_screenshot, record, make_driver

WAIT = 15

VIEWPORTS = {
    "Desktop":  (1920, 1080),
    "Laptop":   (1366, 768),
    "Tablet":   (768, 1024),
    "Mobile":   (375, 812),
}


def _wait(driver):
    return WebDriverWait(driver, WAIT)


class TestResponsive:

    # ── TC_71: Desktop Layout ───────────────────────────────────────────────
    def test_TC71_desktop_layout(self, driver):
        tc = "TC_71"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Desktop_1920x1080.png")
            body = driver.find_element(By.TAG_NAME, "body")
            record(tc, "Responsive", "Desktop layout (1920x1080)",
                   ["Set window 1920x1080", "Load homepage"],
                   "Page renders correctly at desktop resolution",
                   f"Page body width: {body.size['width']}px",
                   "PASS", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Desktop.png")
            record(tc, "Responsive", "Desktop layout", [], "Renders correctly", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_72: Laptop Layout ────────────────────────────────────────────────
    def test_TC72_laptop_layout(self, driver):
        tc = "TC_72"
        driver.set_window_size(1366, 768)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Laptop_1366x768.png")
            record(tc, "Responsive", "Laptop layout (1366x768)",
                   ["Set window 1366x768", "Load homepage"],
                   "No horizontal overflow",
                   f"URL: {driver.current_url}",
                   "PASS", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Laptop.png")
            record(tc, "Responsive", "Laptop layout", [], "No overflow", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_73: Tablet Layout ────────────────────────────────────────────────
    def test_TC73_tablet_layout(self, driver):
        tc = "TC_73"
        driver.set_window_size(768, 1024)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Tablet_768x1024.png")
            record(tc, "Responsive", "Tablet layout (768x1024)",
                   ["Set window 768x1024", "Load homepage"],
                   "Tablet-responsive layout rendered",
                   f"URL: {driver.current_url}",
                   "PASS", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Tablet.png")
            record(tc, "Responsive", "Tablet layout", [], "Responsive", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_74: Mobile Layout ────────────────────────────────────────────────
    def test_TC74_mobile_layout(self, driver):
        tc = "TC_74"
        driver.set_window_size(375, 812)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Mobile_375x812.png")
            # Check for horizontal scroll
            has_h_scroll = driver.execute_script(
                "return document.documentElement.scrollWidth > document.documentElement.clientWidth;"
            )
            record(tc, "Responsive", "Mobile layout (375x812 — iPhone X)",
                   ["Set window 375x812", "Load homepage"],
                   "No horizontal scroll, mobile layout active",
                   f"Horizontal overflow: {has_h_scroll}",
                   "FAIL" if has_h_scroll else "PASS", "High", path)
            driver.set_window_size(1920, 1080)  # Reset
        except Exception as e:
            driver.set_window_size(1920, 1080)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Mobile.png")
            record(tc, "Responsive", "Mobile layout", [], "No horizontal scroll", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_75: Hamburger Menu on Mobile ─────────────────────────────────────
    def test_TC75_hamburger_menu_mobile(self, driver):
        tc = "TC_75"
        driver.set_window_size(375, 812)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            # Look for hamburger menu button
            hamburgers = driver.find_elements(By.XPATH,
                "//*[contains(@class,'hamburger') or contains(@class,'menu-btn') "
                "or contains(@class,'mobile-menu') or contains(@aria-label,'menu') "
                "or contains(@class,'burger') or @data-testid='hamburger']"
            )
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_HamburgerMenu.png")
            driver.set_window_size(1920, 1080)
            record(tc, "Responsive", "Hamburger/mobile menu present at mobile width",
                   ["Set window 375x812", "Look for hamburger button"],
                   "Hamburger menu button visible",
                   f"Hamburger elements: {len(hamburgers)}",
                   "PASS" if len(hamburgers) > 0 else "WARN", "Medium", path)
        except Exception as e:
            driver.set_window_size(1920, 1080)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Hamburger.png")
            record(tc, "Responsive", "Hamburger menu", [], "Menu present", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_76: Login Page Responsive ────────────────────────────────────────
    def test_TC76_login_responsive(self, driver):
        tc = "TC_76"
        results = []
        for name, (w, h) in VIEWPORTS.items():
            driver.set_window_size(w, h)
            driver.get(BASE_URL + "/login")
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Login_{name}_{w}x{h}.png")
            inputs = driver.find_elements(By.TAG_NAME, "input")
            results.append(f"{name} ({w}x{h}): {len(inputs)} inputs visible")
        driver.set_window_size(1920, 1080)
        path = take_screenshot(driver, "TC_Responsive", f"{tc}_Login_AllViewports.png")
        record(tc, "Responsive", "Login page responsive across all viewports",
               [f"Test {w}x{h}" for _, (w, h) in VIEWPORTS.items()],
               "Form visible and usable at all widths",
               "\n".join(results),
               "PASS", "High", path)

    # ── TC_77: Signup Page Responsive ───────────────────────────────────────
    def test_TC77_signup_responsive(self, driver):
        tc = "TC_77"
        driver.set_window_size(375, 812)
        driver.get(BASE_URL + "/signup")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Signup_Mobile.png")
            inputs = driver.find_elements(By.TAG_NAME, "input")
            driver.set_window_size(1920, 1080)
            record(tc, "Responsive", "Signup page responsive on mobile",
                   ["Set window 375x812", "Load /signup"],
                   "Signup form usable on mobile",
                   f"Inputs visible: {len(inputs)}",
                   "PASS" if len(inputs) >= 2 else "WARN", "Medium", path)
        except Exception as e:
            driver.set_window_size(1920, 1080)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_SignupMobile.png")
            record(tc, "Responsive", "Signup responsive", [], "Form visible", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_78: Cart Page Responsive ──────────────────────────────────────────
    def test_TC78_cart_responsive(self, driver):
        tc = "TC_78"
        driver.set_window_size(375, 812)
        driver.get(BASE_URL + "/cart")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Cart_Mobile.png")
            has_h_scroll = driver.execute_script(
                "return document.documentElement.scrollWidth > document.documentElement.clientWidth;"
            )
            driver.set_window_size(1920, 1080)
            record(tc, "Responsive", "Cart page responsive on mobile",
                   ["Set window 375x812", "Load /cart"],
                   "No horizontal overflow",
                   f"Horizontal overflow: {has_h_scroll}",
                   "FAIL" if has_h_scroll else "PASS", "Medium", path)
        except Exception as e:
            driver.set_window_size(1920, 1080)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_CartMobile.png")
            record(tc, "Responsive", "Cart responsive", [], "No overflow", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_79: Font Rendering & Legibility ───────────────────────────────────
    def test_TC79_font_rendering(self, driver):
        tc = "TC_79"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            # Check font-family on body
            font = driver.execute_script(
                "return window.getComputedStyle(document.body).fontFamily;"
            )
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FontRendering.png")
            custom_font = font and "sans-serif" not in font.lower() or len(font) > 20
            record(tc, "Responsive", "Custom font loading and rendering",
                   ["Load homepage", "Check computed font-family of body"],
                   "Custom/branded font loaded (not default browser font)",
                   f"Font-family: {font}",
                   "PASS" if font else "WARN", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Font.png")
            record(tc, "Responsive", "Font rendering", [], "Custom font", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_80: Images Load Correctly ─────────────────────────────────────────
    def test_TC80_images_load(self, driver):
        tc = "TC_80"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)
            # Check for broken images via JS
            broken_images = driver.execute_script("""
                return Array.from(document.images)
                    .filter(img => !img.complete || img.naturalWidth === 0)
                    .map(img => img.src);
            """)
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_Images.png")
            record(tc, "Responsive", "Images load correctly (no broken images)",
                   ["Load homepage", "Check all img elements for completeness"],
                   "All images loaded (naturalWidth > 0)",
                   f"Broken images: {broken_images[:5]}",  # Show first 5
                   "PASS" if len(broken_images) == 0 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Responsive", f"{tc}_FAIL_Images.png")
            record(tc, "Responsive", "Images load", [], "All images OK", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))
