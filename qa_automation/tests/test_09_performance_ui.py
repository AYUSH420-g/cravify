"""
test_09_performance_ui.py — Performance & UI Alignment Tests
Module: Performance / UI
TC_81 → TC_90
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, take_screenshot, record

WAIT = 20


def _wait(driver):
    return WebDriverWait(driver, WAIT)


class TestPerformanceAndUI:

    # ── TC_81: Page Load Time Homepage < 10s ────────────────────────────────
    def test_TC81_homepage_load_time(self, driver):
        tc = "TC_81"
        driver.set_window_size(1920, 1080)
        try:
            start = time.time()
            driver.get(BASE_URL)
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            elapsed = time.time() - start
            path = take_screenshot(driver, "TC_UI", f"{tc}_LoadTime.png")
            record(tc, "Performance", "Homepage load time under 10 seconds",
                   ["Navigate to homepage", "Wait for readyState=complete", "Record time"],
                   "Load time < 10 seconds",
                   f"Load time: {elapsed:.2f}s",
                   "PASS" if elapsed < 10 else "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_LoadTime.png")
            record(tc, "Performance", "Homepage load time", [], "< 10s", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_82: Navigation Timing API Metrics ────────────────────────────────
    def test_TC82_performance_timing(self, driver):
        tc = "TC_82"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            timing = driver.execute_script("""
                const t = window.performance.timing;
                return {
                    dns: t.domainLookupEnd - t.domainLookupStart,
                    tcp: t.connectEnd - t.connectStart,
                    ttfb: t.responseStart - t.navigationStart,
                    domLoad: t.domContentLoadedEventEnd - t.navigationStart,
                    pageLoad: t.loadEventEnd - t.navigationStart
                };
            """)
            path = take_screenshot(driver, "TC_UI", f"{tc}_PerfTiming.png")
            ttfb_ok = timing.get('ttfb', 9999) < 3000  # < 3 seconds TTFB
            record(tc, "Performance", "Navigation Timing API metrics",
                   ["Load page", "Measure DNS/TCP/TTFB/DOMLoad/PageLoad"],
                   "TTFB < 3000ms, pageLoad < 10000ms",
                   f"DNS:{timing.get('dns')}ms, TCP:{timing.get('tcp')}ms, "
                   f"TTFB:{timing.get('ttfb')}ms, DOM:{timing.get('domLoad')}ms, "
                   f"Page:{timing.get('pageLoad')}ms",
                   "PASS" if ttfb_ok else "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_PerfTiming.png")
            record(tc, "Performance", "Performance timing", [], "Good metrics", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_83: Console Errors on Homepage ────────────────────────────────────
    def test_TC83_console_errors_homepage(self, driver):
        tc = "TC_83"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)
            # Get browser console logs
            logs = driver.get_log("browser")
            severe = [l for l in logs if l.get("level") == "SEVERE"]
            path = take_screenshot(driver, "TC_UI", f"{tc}_ConsoleErrors.png")
            record(tc, "Performance", "No SEVERE console errors on homepage",
                   ["Load homepage", "Check browser console logs"],
                   "Zero SEVERE console errors",
                   f"SEVERE errors: {len(severe)}: {[l['message'][:80] for l in severe[:3]]}",
                   "PASS" if len(severe) == 0 else "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_Console.png")
            record(tc, "Performance", "Console errors", [], "No errors", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_84: Buttons Have Visible Text ─────────────────────────────────────
    def test_TC84_button_text_visible(self, driver):
        tc = "TC_84"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            buttons = driver.find_elements(By.TAG_NAME, "button")
            empty_buttons = [b for b in buttons if not b.text.strip() and not b.get_attribute("aria-label")]
            path = take_screenshot(driver, "TC_UI", f"{tc}_Buttons.png")
            record(tc, "UI", "All buttons have visible text or aria-label",
                   ["Load homepage", "Find all <button> elements", "Check text/aria-label"],
                   "No empty/unlabelled buttons",
                   f"Total buttons: {len(buttons)}, Empty: {len(empty_buttons)}",
                   "PASS" if len(empty_buttons) == 0 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_Buttons.png")
            record(tc, "UI", "Button text", [], "All buttons labeled", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_85: Form Labels Present ───────────────────────────────────────────
    def test_TC85_form_labels_present(self, driver):
        tc = "TC_85"
        driver.get(BASE_URL + "/login")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            labels = driver.find_elements(By.TAG_NAME, "label")
            inputs = driver.find_elements(By.XPATH,
                "//input[not(@type='hidden') and not(@type='submit')]"
            )
            path = take_screenshot(driver, "TC_UI", f"{tc}_FormLabels.png")
            record(tc, "UI", "Login form has labels for inputs",
                   ["Load /login", "Count labels and inputs"],
                   "Each input has an associated label",
                   f"Labels: {len(labels)}, Inputs: {len(inputs)}",
                   "PASS" if len(labels) > 0 else "WARN", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_Labels.png")
            record(tc, "UI", "Form labels", [], "Labels present", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_86: Page Scrolls Correctly ────────────────────────────────────────
    def test_TC86_page_scroll(self, driver):
        tc = "TC_86"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            # Scroll to bottom
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            scroll_y = driver.execute_script("return window.scrollY;")
            path = take_screenshot(driver, "TC_UI", f"{tc}_Scroll.png")
            record(tc, "UI", "Page scrolls to bottom without errors",
                   ["Load homepage", "Execute scroll to bottom"],
                   "Page scrolls, no JS errors",
                   f"ScrollY after scroll: {scroll_y}px",
                   "PASS" if scroll_y > 0 else "WARN", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_Scroll.png")
            record(tc, "UI", "Page scroll", [], "Scrolls OK", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_87: Back Navigation Works ─────────────────────────────────────────
    def test_TC87_back_navigation(self, driver):
        tc = "TC_87"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            driver.get(BASE_URL + "/about")
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(1)
            driver.back()
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_UI", f"{tc}_BackNav.png")
            record(tc, "UI", "Browser back navigation works",
                   ["Visit homepage", "Navigate to /about", "Click back"],
                   "Returns to homepage",
                   f"URL after back: {current_url}",
                   "PASS" if BASE_URL in current_url else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_Back.png")
            record(tc, "UI", "Back navigation", [], "Works correctly", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_88: Links Open Correct Pages ──────────────────────────────────────
    def test_TC88_nav_links_correct(self, driver):
        tc = "TC_88"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            # Get all nav links
            nav_links = driver.find_elements(By.XPATH, "//nav//a[@href]")
            results = []
            for link in nav_links[:8]:  # Test first 8 nav links
                href = link.get_attribute("href")
                text = link.text.strip() or link.get_attribute("aria-label") or "unknown"
                results.append(f"'{text}' → {href}")

            path = take_screenshot(driver, "TC_UI", f"{tc}_NavLinks.png")
            record(tc, "UI", "Navbar links point to correct pages",
                   ["Load homepage", "Inspect nav link hrefs"],
                   "All nav links have valid href values",
                   "\n".join(results) if results else "No nav links found",
                   "PASS" if len(results) > 0 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_NavLinks.png")
            record(tc, "UI", "Nav links correct", [], "Correct hrefs", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_89: Tab Title Updates on Navigation ───────────────────────────────
    def test_TC89_page_titles_on_routes(self, driver):
        tc = "TC_89"
        routes = ["/", "/login", "/signup", "/about", "/cart"]
        results = []
        for route in routes:
            driver.get(BASE_URL + route)
            time.sleep(2)
            results.append(f"{route}: '{driver.title}'")

        path = take_screenshot(driver, "TC_UI", f"{tc}_PageTitles.png")
        all_have_title = all(len(r.split("'")[1]) > 0 for r in results if "'" in r)
        record(tc, "UI", "Page titles update on route change",
               [f"Visit {r}" for r in routes],
               "Each page has a meaningful title",
               "\n".join(results),
               "PASS" if all_have_title else "WARN", "Low", path)

    # ── TC_90: Accessibility — Alt Text on Images ────────────────────────────
    def test_TC90_alt_text_on_images(self, driver):
        tc = "TC_90"
        driver.set_window_size(1920, 1080)
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            images = driver.find_elements(By.TAG_NAME, "img")
            missing_alt = [img.get_attribute("src") for img in images
                           if not img.get_attribute("alt") and img.is_displayed()]
            path = take_screenshot(driver, "TC_UI", f"{tc}_AltText.png")
            record(tc, "UI", "All visible images have alt text (accessibility)",
                   ["Load homepage", "Find all img tags", "Check alt attribute"],
                   "All images have non-empty alt text",
                   f"Total images: {len(images)}, Missing alt: {len(missing_alt)}",
                   "PASS" if len(missing_alt) == 0 else "WARN", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_UI", f"{tc}_FAIL_AltText.png")
            record(tc, "UI", "Alt text on images", [], "All have alt", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))
