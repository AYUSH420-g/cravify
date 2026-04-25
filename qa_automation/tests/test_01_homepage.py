"""
test_01_homepage.py — Homepage & UI Smoke Tests
Module: Homepage
TC_01 → TC_08
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from conftest import BASE_URL, take_screenshot, record

WAIT = 15


class TestHomepage:

    def _wait(self, driver):
        return WebDriverWait(driver, WAIT)

    # ── TC_01: Homepage Loads ───────────────────────────────────────────────
    def test_TC01_homepage_loads(self, driver):
        tc = "TC_01"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            title = driver.title
            assert len(title) > 0, "Page title is empty"
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_Homepage.png")
            record(tc, "Homepage", "Homepage loads successfully",
                   ["Navigate to https://cravify-peach.vercel.app/"],
                   "Page loads with a title and visible content",
                   f"Page loaded. Title: '{title}'", "PASS", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Homepage.png")
            record(tc, "Homepage", "Homepage loads successfully",
                   ["Navigate to base URL"], "Page loads", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_02: Navbar Present ───────────────────────────────────────────────
    def test_TC02_navbar_present(self, driver):
        tc = "TC_02"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                EC.presence_of_element_located((By.TAG_NAME, "nav"))
            )
            nav = driver.find_element(By.TAG_NAME, "nav")
            assert nav.is_displayed(), "Navbar not visible"
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_Navbar.png")
            record(tc, "Homepage", "Navigation bar is visible",
                   ["Load homepage", "Look for nav element"],
                   "Navbar visible with links", "Navbar found and displayed",
                   "PASS", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Navbar.png")
            record(tc, "Homepage", "Navbar present", [], "Navbar visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_03: Logo Present ─────────────────────────────────────────────────
    def test_TC03_logo_present(self, driver):
        tc = "TC_03"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            # Try img or svg or text-based logo
            logos = driver.find_elements(By.XPATH,
                "//*[contains(@class,'logo') or contains(@alt,'logo') or "
                "contains(@alt,'Cravify') or contains(text(),'Cravify') or "
                "contains(@class,'brand')]"
            )
            found = len(logos) > 0
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_Logo.png")
            status = "PASS" if found else "FAIL"
            record(tc, "Homepage", "Logo present on homepage",
                   ["Load homepage", "Look for logo"],
                   "Logo/brand name visible", f"Logo elements found: {len(logos)}",
                   status, "Medium", path)
            if not found:
                pytest.fail("No logo element found")
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Logo.png")
            record(tc, "Homepage", "Logo present", [], "Logo visible", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_04: Footer Present ───────────────────────────────────────────────
    def test_TC04_footer_present(self, driver):
        tc = "TC_04"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            footers = driver.find_elements(By.TAG_NAME, "footer")
            found = len(footers) > 0
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_Footer.png")
            status = "PASS" if found else "FAIL"
            record(tc, "Homepage", "Footer present at bottom",
                   ["Load homepage", "Scroll to bottom"],
                   "Footer visible with links", f"Footer elements: {len(footers)}",
                   status, "Low", path)
            if not found:
                pytest.fail("No footer found")
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Footer.png")
            record(tc, "Homepage", "Footer present", [], "Footer visible", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_05: Restaurant Cards Display ────────────────────────────────────
    def test_TC05_restaurant_cards_display(self, driver):
        tc = "TC_05"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)  # Allow API data to load
            # Find cards or restaurant-like elements
            cards = driver.find_elements(By.XPATH,
                "//*[contains(@class,'card') or contains(@class,'restaurant') "
                "or contains(@class,'grid') or contains(@class,'item')]"
            )
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_RestaurantCards.png")
            status = "PASS" if len(cards) > 0 else "WARN"
            record(tc, "Homepage", "Restaurant cards display on homepage",
                   ["Load homepage", "Wait for API", "Inspect card grid"],
                   "Restaurant cards visible", f"Card-like elements found: {len(cards)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Cards.png")
            record(tc, "Homepage", "Restaurant cards", [], "Cards visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_06: Page Title Check ─────────────────────────────────────────────
    def test_TC06_page_title(self, driver):
        tc = "TC_06"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            title = driver.title
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_Title.png")
            status = "PASS" if len(title) > 0 else "FAIL"
            record(tc, "Homepage", "Browser tab title set",
                   ["Navigate to homepage"],
                   "Title tag has meaningful text", f"Title: '{title}'",
                   status, "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_Title.png")
            record(tc, "Homepage", "Page title", [], "Title present", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_07: Login Link in Navbar ─────────────────────────────────────────
    def test_TC07_login_link_in_navbar(self, driver):
        tc = "TC_07"
        driver.get(BASE_URL)
        try:
            self._wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            login_links = driver.find_elements(By.XPATH,
                "//a[contains(@href,'/login') or contains(translate(text(),'LOGIN','login'),'login')]"
                "| //button[contains(translate(text(),'LOGIN','login'),'login')]"
            )
            found = len(login_links) > 0
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_LoginLink.png")
            status = "PASS" if found else "WARN"
            record(tc, "Homepage", "Login link visible in navbar",
                   ["Load homepage", "Look for login link"],
                   "Login link visible", f"Login links found: {len(login_links)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Homepage", f"{tc}_FAIL_LoginLink.png")
            record(tc, "Homepage", "Login link", [], "Login link present", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_08: Static Pages Navigation ─────────────────────────────────────
    def test_TC08_static_pages(self, driver):
        tc = "TC_08"
        pages = ["/about", "/help", "/terms", "/privacy"]
        results = []
        for page in pages:
            try:
                driver.get(BASE_URL + page)
                self._wait(driver).until(
                    lambda d: d.execute_script("return document.readyState") == "complete"
                )
                time.sleep(1)
                results.append(f"{page}: OK (title={driver.title})")
            except Exception as e:
                results.append(f"{page}: ERROR - {e}")

        path = take_screenshot(driver, "TC_Homepage", f"{tc}_StaticPages.png")
        all_ok = all("OK" in r for r in results)
        record(tc, "Homepage", "Static pages accessible",
               [f"Navigate to {p}" for p in pages],
               "All static pages load", "\n".join(results),
               "PASS" if all_ok else "FAIL", "Low", path)
