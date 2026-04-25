import pytest

from config import build_test_data
from utils import CravifyBusinessFlow, DriverFactory


@pytest.fixture(scope="module")
def driver():
    drv = DriverFactory.create(browser="chrome", viewport=(1920, 1080))
    yield drv
    drv.quit()


def test_master_marketplace_business_flow(driver):
    data = build_test_data()
    flow = CravifyBusinessFlow(driver, data, browser="chrome", viewport_name="desktop_1920x1080")
    flow.run_all()
