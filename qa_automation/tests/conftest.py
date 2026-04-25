"""
conftest.py — Shared fixtures for Cravify QA Test Suite
Author: QA Automation Framework
"""

import pytest
import os
import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CHROMEDRIVER_PATH = os.path.join(BASE_DIR, 'qa_automation', 'Chromedriver', 'chromedriver.exe')
SCREENSHOT_BASE    = os.path.join(BASE_DIR, 'qa_automation', 'screenshots')
REPORTS_DIR        = os.path.join(BASE_DIR, 'qa_automation', 'reports')

BASE_URL = "https://cravify-peach.vercel.app"

# ─── Shared test result store ────────────────────────────────────────────────
_results = []

def record(tc_id, module, description, steps, expected, actual, status, severity, screenshot=""):
    _results.append({
        "tc_id": tc_id, "module": module, "description": description,
        "steps": steps, "expected": expected, "actual": actual,
        "status": status, "severity": severity, "screenshot": screenshot,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

def get_results():
    return _results

# ─── Driver factory ──────────────────────────────────────────────────────────
def make_driver(headless=False, width=1920, height=1080):
    options = Options()
    if headless:
        options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument(f'--window-size={width},{height}')
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    svc = Service(executable_path=CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=svc, options=options)
    driver.set_window_size(width, height)
    return driver

def take_screenshot(driver, folder, filename):
    path = os.path.join(SCREENSHOT_BASE, folder, filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    driver.save_screenshot(path)
    return path

@pytest.fixture(scope="session")
def driver():
    d = make_driver(headless=False)
    yield d
    d.quit()

@pytest.fixture(scope="session")
def headless_driver():
    d = make_driver(headless=True)
    yield d
    d.quit()
