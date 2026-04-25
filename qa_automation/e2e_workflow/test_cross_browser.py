import os

import pytest
from selenium.webdriver.common.by import By

from config import BROWSERS, VIEWPORTS, build_test_data
from utils import CravifyBusinessFlow, DriverFactory, UIActions


def _enabled_viewports():
    requested = os.getenv("CRAVIFY_VIEWPORTS")
    if not requested:
        return VIEWPORTS.items()
    names = [name.strip() for name in requested.split(",") if name.strip()]
    return [(name, VIEWPORTS[name]) for name in names if name in VIEWPORTS]


@pytest.mark.parametrize("browser", BROWSERS)
def test_major_business_flow_cross_browser(browser):
    driver = DriverFactory.create(browser=browser, viewport=(1366, 768))
    try:
        data = build_test_data(f"{browser}")
        flow = CravifyBusinessFlow(driver, data, browser=browser, viewport_name="desktop_1366x768")
        flow.run_all()
    finally:
        driver.quit()


@pytest.mark.parametrize("browser", BROWSERS)
@pytest.mark.parametrize("viewport_name,viewport", list(_enabled_viewports()))
def test_responsive_core_forms_and_layout(browser, viewport_name, viewport):
    driver = DriverFactory.create(browser=browser, viewport=viewport)
    failures = []
    ui = UIActions(driver, browser=browser, viewport_name=viewport_name, soft_failures=failures)
    try:
        ui.step(
            f"TC_RESP_{browser}_{viewport_name}_Home",
            "Homepage layout loads without horizontal overflow",
            lambda: (
                ui.open(),
                (_ for _ in ()).throw(AssertionError("Horizontal overflow detected"))
                if driver.execute_script("return document.documentElement.scrollWidth > document.documentElement.clientWidth;")
                else True,
            ),
        )
        ui.step(
            f"TC_RESP_{browser}_{viewport_name}_Login",
            "Login form exposes exact credential selectors",
            lambda: (
                ui.open("/login"),
                ui.wait_visible((By.NAME, "email")),
                ui.wait_visible((By.NAME, "password")),
            ),
        )
        ui.step(
            f"TC_RESP_{browser}_{viewport_name}_Signup",
            "Signup form exposes exact registration selectors",
            lambda: (
                ui.open("/signup"),
                ui.wait_visible((By.NAME, "name")),
                ui.wait_visible((By.NAME, "email")),
                ui.wait_visible((By.NAME, "password")),
            ),
        )
        if failures:
            raise AssertionError(f"{len(failures)} responsive checks failed")
    finally:
        driver.quit()
