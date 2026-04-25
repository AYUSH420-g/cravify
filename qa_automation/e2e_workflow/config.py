import os
from dataclasses import dataclass
from datetime import datetime


BASE_URL = os.getenv("CRAVIFY_BASE_URL", "https://cravify-peach.vercel.app").rstrip("/")
WAIT_SECONDS = int(os.getenv("CRAVIFY_WAIT_SECONDS", "20"))
HEADLESS = os.getenv("CRAVIFY_HEADLESS", "false").lower() in {"1", "true", "yes"}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
QA_DIR = os.path.join(BASE_DIR, "qa_automation")
CHROMEDRIVER_PATH = os.getenv(
    "CHROMEDRIVER_PATH",
    os.path.join(QA_DIR, "Chromedriver", "chromedriver.exe"),
)

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")

for directory in (REPORTS_DIR, SCREENSHOT_DIR, LOG_DIR):
    os.makedirs(directory, exist_ok=True)


@dataclass(frozen=True)
class Credentials:
    email: str
    password: str


ADMIN = Credentials(
    email=os.getenv("CRAVIFY_ADMIN_EMAIL", "admin@cravify.com"),
    password=os.getenv("CRAVIFY_ADMIN_PASSWORD", "admin123"),
)

DEFAULT_PASSWORD = os.getenv("CRAVIFY_QA_PASSWORD", "TestPass123!")
RUN_ID = os.getenv("CRAVIFY_RUN_ID", datetime.now().strftime("%Y%m%d%H%M%S"))

BROWSERS = [b.strip().lower() for b in os.getenv("CRAVIFY_BROWSERS", "chrome,firefox,edge").split(",") if b.strip()]

VIEWPORTS = {
    "desktop_1920x1080": (1920, 1080),
    "desktop_1366x768": (1366, 768),
    "tablet_768x1024": (768, 1024),
    "mobile_430x932": (430, 932),
    "mobile_390x844": (390, 844),
}

TEST_RESTAURANT_IMAGE = os.path.join(os.path.dirname(__file__), "dummy.png")
TEST_PNG_DOCUMENT = os.path.join(os.path.dirname(__file__), "dummy.png")
TEST_PDF_DOCUMENT = os.path.join(os.path.dirname(__file__), "dummy.pdf")


def build_test_data(suffix=None):
    token = suffix or RUN_ID
    return {
        "customer_name": "QA Customer",
        "customer_email": f"qa_customer_{token}@cravify.test",
        "customer_pass": DEFAULT_PASSWORD,
        "vendor_owner": "QA Vendor Owner",
        "vendor_email": f"qa_vendor_{token}@cravify.test",
        "vendor_pass": DEFAULT_PASSWORD,
        "restaurant_name": f"QA Bistro {token}",
        "menu_category": "QA Specials",
        "menu_item": "QA Burger Deluxe",
        "rider_name": "QA Rider",
        "rider_email": f"qa_rider_{token}@cravify.test",
        "rider_pass": DEFAULT_PASSWORD,
        "order_id": "",
    }
