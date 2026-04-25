import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CHROMEDRIVER_PATH = os.path.join(BASE_DIR, 'qa_automation', 'Chromedriver', 'chromedriver.exe')

def make_driver():
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    svc = Service(executable_path=CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=svc, options=options)
    driver.implicitly_wait(10)
    return driver

@pytest.fixture(scope="session")
def driver():
    d = make_driver()
    yield d
    d.quit()

@pytest.fixture(scope="session")
def shared_data():
    return {}
