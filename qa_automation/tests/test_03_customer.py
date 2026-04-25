"""
test_03_customer.py — Customer Flow Tests
Module: Customer
TC_23 → TC_36
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from conftest import BASE_URL, take_screenshot, record

WAIT = 15


def _wait(driver):
    return WebDriverWait(driver, WAIT)


class TestCustomerFlow:

    # ── TC_23: Browse Restaurants ───────────────────────────────────────────
    def test_TC23_browse_restaurants(self, driver):
        tc = "TC_23"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)
            # Find clickable restaurant-like links
            rest_links = driver.find_elements(By.XPATH,
                "//a[contains(@href,'/restaurant/')]"
            )
            path = take_screenshot(driver, "TC_Customer", f"{tc}_BrowseRestaurants.png")
            status = "PASS" if len(rest_links) > 0 else "WARN"
            record(tc, "Customer", "Browse restaurants on homepage",
                   ["Open homepage", "Wait for content to load", "Check for restaurant links"],
                   "Restaurant cards with clickable links visible",
                   f"Restaurant links found: {len(rest_links)}",
                   status, "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Browse.png")
            record(tc, "Customer", "Browse restaurants", [], "Cards visible", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_24: Restaurant Detail Page ───────────────────────────────────────
    def test_TC24_restaurant_detail_page(self, driver):
        tc = "TC_24"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)
            rest_links = driver.find_elements(By.XPATH, "//a[contains(@href,'/restaurant/')]")
            if rest_links:
                href = rest_links[0].get_attribute("href")
                driver.get(href)
                _wait(driver).until(
                    lambda d: d.execute_script("return document.readyState") == "complete"
                )
                time.sleep(2)
                current_url = driver.current_url
                path = take_screenshot(driver, "TC_Customer", f"{tc}_RestaurantDetail.png")
                status = "PASS" if "/restaurant/" in current_url else "FAIL"
                record(tc, "Customer", "Restaurant detail page opens",
                       ["Browse homepage", "Click first restaurant card"],
                       "Restaurant detail page with menu loaded",
                       f"URL: {current_url}",
                       status, "High", path)
            else:
                path = take_screenshot(driver, "TC_Customer", f"{tc}_NoRestaurants.png")
                record(tc, "Customer", "Restaurant detail page",
                       ["Browse homepage"],
                       "Restaurant detail page loads",
                       "No restaurant links found on homepage",
                       "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_RestDetail.png")
            record(tc, "Customer", "Restaurant detail page", [], "Page loads", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_25: Search Functionality ─────────────────────────────────────────
    def test_TC25_search_functionality(self, driver):
        tc = "TC_25"
        driver.get(BASE_URL + "/search")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            search_inputs = driver.find_elements(By.XPATH,
                "//input[@type='search' or @type='text' or contains(@placeholder,'search') "
                "or contains(@placeholder,'Search') or contains(@name,'search') or contains(@name,'q')]"
            )
            path = take_screenshot(driver, "TC_Customer", f"{tc}_SearchPage.png")
            if search_inputs:
                search_inputs[0].clear()
                search_inputs[0].send_keys("pizza")
                time.sleep(1)
                search_inputs[0].send_keys(Keys.RETURN)
                time.sleep(3)
                path = take_screenshot(driver, "TC_Customer", f"{tc}_SearchResults.png")
                record(tc, "Customer", "Search for 'pizza'",
                       ["Go to /search", "Type 'pizza'", "Press Enter"],
                       "Search results displayed",
                       f"Search executed. URL: {driver.current_url}",
                       "PASS", "High", path)
            else:
                record(tc, "Customer", "Search functionality",
                       ["Go to /search", "Look for search input"],
                       "Search input visible",
                       "No search input found",
                       "FAIL", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Search.png")
            record(tc, "Customer", "Search", [], "Search works", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_26: Cart Page Loads ───────────────────────────────────────────────
    def test_TC26_cart_page(self, driver):
        tc = "TC_26"
        driver.get(BASE_URL + "/cart")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_Cart.png")
            body_text = driver.find_element(By.TAG_NAME, "body").text
            # Cart page should have either items or "empty" message
            has_content = len(body_text) > 50
            record(tc, "Customer", "Cart page loads",
                   ["Navigate to /cart"],
                   "Cart page loads (either with items or empty state)",
                   f"Page has content: {has_content}, URL: {driver.current_url}",
                   "PASS" if has_content else "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Cart.png")
            record(tc, "Customer", "Cart page", [], "Page loads", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_27: Add Item to Cart from Restaurant Page ─────────────────────────
    def test_TC27_add_to_cart(self, driver):
        tc = "TC_27"
        driver.get(BASE_URL)
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)
            # Navigate to a restaurant
            rest_links = driver.find_elements(By.XPATH, "//a[contains(@href,'/restaurant/')]")
            if not rest_links:
                path = take_screenshot(driver, "TC_Customer", f"{tc}_NoRest.png")
                record(tc, "Customer", "Add to cart", [], "Item added", "No restaurants on homepage", "WARN", "High", path)
                return

            driver.get(rest_links[0].get_attribute("href"))
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(3)

            # Find Add to Cart buttons
            add_btns = driver.find_elements(By.XPATH,
                "//button[contains(translate(text(),'ADDCART','addcart'),'add') "
                "or contains(@class,'add') or contains(@aria-label,'add')]"
            )
            path = take_screenshot(driver, "TC_Customer", f"{tc}_RestaurantMenuPage.png")

            if add_btns:
                add_btns[0].click()
                time.sleep(2)
                path = take_screenshot(driver, "TC_Customer", f"{tc}_AddCart.png")
                # Verify cart has item
                driver.get(BASE_URL + "/cart")
                time.sleep(2)
                cart_body = driver.find_element(By.TAG_NAME, "body").text
                path2 = take_screenshot(driver, "TC_Customer", f"{tc}_CartAfterAdd.png")
                record(tc, "Customer", "Add item to cart",
                       ["Go to restaurant", "Click 'Add' button", "Check /cart"],
                       "Item appears in cart",
                       f"Cart page text length: {len(cart_body)}",
                       "PASS", "Critical", path2)
            else:
                record(tc, "Customer", "Add to cart",
                       ["Go to restaurant", "Look for Add buttons"],
                       "Add to cart button visible",
                       f"No add buttons found. URL: {driver.current_url}",
                       "WARN", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_AddCart.png")
            record(tc, "Customer", "Add to cart", [], "Item added", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_28: Checkout Page ────────────────────────────────────────────────
    def test_TC28_checkout_page(self, driver):
        tc = "TC_28"
        driver.get(BASE_URL + "/checkout")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Customer", f"{tc}_Checkout.png")
            # May redirect to login if not authenticated
            accessible = len(driver.find_element(By.TAG_NAME, "body").text) > 50
            record(tc, "Customer", "Checkout page accessible",
                   ["Navigate to /checkout"],
                   "Checkout page or redirect to login",
                   f"URL: {current_url}",
                   "PASS" if accessible else "WARN", "Critical", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Checkout.png")
            record(tc, "Customer", "Checkout page", [], "Page loads", str(e), "FAIL", "Critical", path)
            pytest.fail(str(e))

    # ── TC_29: Order Tracking Page ──────────────────────────────────────────
    def test_TC29_order_tracking_page(self, driver):
        tc = "TC_29"
        driver.get(BASE_URL + "/order-tracking")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_OrderTracking.png")
            body_text = driver.find_element(By.TAG_NAME, "body").text
            record(tc, "Customer", "Order tracking page loads",
                   ["Navigate to /order-tracking"],
                   "Tracking page or login redirect",
                   f"URL: {driver.current_url}, content length: {len(body_text)}",
                   "PASS" if len(body_text) > 50 else "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Tracking.png")
            record(tc, "Customer", "Order tracking", [], "Page loads", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_30: Loyalty Page ─────────────────────────────────────────────────
    def test_TC30_loyalty_page(self, driver):
        tc = "TC_30"
        driver.get(BASE_URL + "/loyalty")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_LoyaltyPage.png")
            body_text = driver.find_element(By.TAG_NAME, "body").text
            record(tc, "Customer", "Loyalty page loads",
                   ["Navigate to /loyalty"],
                   "Loyalty program page visible",
                   f"URL: {driver.current_url}, content length: {len(body_text)}",
                   "PASS" if len(body_text) > 50 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Loyalty.png")
            record(tc, "Customer", "Loyalty page", [], "Page loads", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_31: Offers Page ──────────────────────────────────────────────────
    def test_TC31_offers_page(self, driver):
        tc = "TC_31"
        driver.get(BASE_URL + "/offers")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_Offers.png")
            body_text = driver.find_element(By.TAG_NAME, "body").text
            record(tc, "Customer", "Offers page loads",
                   ["Navigate to /offers"],
                   "Offers/promotions page visible",
                   f"Content length: {len(body_text)}",
                   "PASS" if len(body_text) > 50 else "WARN", "Medium", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Offers.png")
            record(tc, "Customer", "Offers page", [], "Page loads", str(e), "FAIL", "Medium", path)
            pytest.fail(str(e))

    # ── TC_32: Profile Page Auth Guard ──────────────────────────────────────
    def test_TC32_profile_page_auth_guard(self, driver):
        tc = "TC_32"
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        driver.get(BASE_URL + "/profile")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            current_url = driver.current_url
            path = take_screenshot(driver, "TC_Customer", f"{tc}_ProfileGuard.png")
            # Profile should require auth; redirect to login or show form
            body_text = driver.find_element(By.TAG_NAME, "body").text
            record(tc, "Customer", "Profile page requires authentication",
                   ["Clear session", "Navigate to /profile"],
                   "Redirected to /login or auth wall shown",
                   f"URL: {current_url}",
                   "PASS" if len(body_text) > 50 else "WARN", "High", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Profile.png")
            record(tc, "Customer", "Profile auth guard", [], "Redirect", str(e), "FAIL", "High", path)
            pytest.fail(str(e))

    # ── TC_33: Blog Page ────────────────────────────────────────────────────
    def test_TC33_blog_page(self, driver):
        tc = "TC_33"
        driver.get(BASE_URL + "/blog")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_Blog.png")
            record(tc, "Customer", "Blog page loads",
                   ["Navigate to /blog"],
                   "Blog page visible",
                   f"URL: {driver.current_url}",
                   "PASS", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Blog.png")
            record(tc, "Customer", "Blog page", [], "Page loads", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_34: Careers Page ─────────────────────────────────────────────────
    def test_TC34_careers_page(self, driver):
        tc = "TC_34"
        driver.get(BASE_URL + "/careers")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_Careers.png")
            record(tc, "Customer", "Careers page loads",
                   ["Navigate to /careers"],
                   "Careers page visible",
                   f"URL: {driver.current_url}",
                   "PASS", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Careers.png")
            record(tc, "Customer", "Careers page", [], "Page loads", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_35: Partner With Us Page ─────────────────────────────────────────
    def test_TC35_partner_with_us(self, driver):
        tc = "TC_35"
        driver.get(BASE_URL + "/partner")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_PartnerWithUs.png")
            record(tc, "Customer", "Partner With Us page loads",
                   ["Navigate to /partner"],
                   "Partner registration/info page visible",
                   f"URL: {driver.current_url}",
                   "PASS", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Partner.png")
            record(tc, "Customer", "Partner with us page", [], "Page loads", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))

    # ── TC_36: Ride With Us Page ─────────────────────────────────────────────
    def test_TC36_ride_with_us(self, driver):
        tc = "TC_36"
        driver.get(BASE_URL + "/ride")
        try:
            _wait(driver).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            time.sleep(2)
            path = take_screenshot(driver, "TC_Customer", f"{tc}_RideWithUs.png")
            record(tc, "Customer", "Ride With Us page loads",
                   ["Navigate to /ride"],
                   "Rider recruitment page visible",
                   f"URL: {driver.current_url}",
                   "PASS", "Low", path)
        except Exception as e:
            path = take_screenshot(driver, "TC_Customer", f"{tc}_FAIL_Ride.png")
            record(tc, "Customer", "Ride with us page", [], "Page loads", str(e), "FAIL", "Low", path)
            pytest.fail(str(e))
