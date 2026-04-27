"""
utils.py - Cravify QA Framework Utilities
Browser factory, smart waits, auth helpers, screenshot, logging, HTML report.
"""
import os, re, time, datetime, logging
from selenium import webdriver
from selenium.webdriver.chrome.service  import Service as CService
from selenium.webdriver.chrome.options  import Options as COpts
from selenium.webdriver.firefox.service import Service as FService
from selenium.webdriver.firefox.options import Options as FOpts
from selenium.webdriver.edge.service    import Service as EService
from selenium.webdriver.edge.options    import Options as EOpts
from selenium.webdriver.common.by       import By
from selenium.webdriver.support.ui      import WebDriverWait
from selenium.webdriver.support         import expected_conditions as EC
from selenium.common.exceptions         import (TimeoutException,
    NoSuchElementException, NoAlertPresentException, ElementClickInterceptedException)
import config

# ── Console Colors ────────────────────────────────────────────
G='\033[92m'; R='\033[91m'; Y='\033[93m'; C='\033[96m'; RESET='\033[0m'

# ── File Logger ───────────────────────────────────────────────
logging.basicConfig(filename=config.LOG_FILE, filemode='a', level=logging.DEBUG,
    format='[%(asctime)s] %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
_log = logging.getLogger("cravify_qa")

def log(msg, color=RESET):
    print(f"{color}{msg}{RESET}")
    _log.info(re.sub(r'\033\[[0-9;]*m', '', msg))

# ── Browser Factory ───────────────────────────────────────────
def create_driver(browser="chrome"):
    """Factory supports Chrome/Firefox/Edge. Primary = Chrome."""
    b = browser.lower()
    if b == "chrome":
        o = COpts()
        o.add_argument("--start-maximized")
        o.add_argument("--disable-notifications")
        o.add_argument("--disable-background-networking")  # suppress GCM errors
        o.add_argument("--log-level=3")
        o.add_experimental_option("excludeSwitches", ["enable-logging"])
        if config.HEADLESS: o.add_argument("--headless=new")
        return webdriver.Chrome(service=CService(config.CHROMEDRIVER), options=o)
    elif b == "firefox":
        o = FOpts()
        if config.HEADLESS: o.add_argument("--headless")
        return webdriver.Firefox(service=FService(), options=o)
    elif b == "edge":
        o = EOpts()
        if config.HEADLESS: o.add_argument("--headless")
        return webdriver.Edge(service=EService(), options=o)
    raise ValueError(f"Unsupported browser: {browser}")

# ── Smart Wait Helpers ────────────────────────────────────────
# Explicit waits prevent the flakiness caused by time.sleep().
def _wdw(driver, t): return WebDriverWait(driver, t)
def wait_present (d,by,v,t=config.W_DEFAULT): return _wdw(d,t).until(EC.presence_of_element_located((by,v)))
def wait_visible  (d,by,v,t=config.W_DEFAULT): return _wdw(d,t).until(EC.visibility_of_element_located((by,v)))
def wait_clickable(d,by,v,t=config.W_DEFAULT): return _wdw(d,t).until(EC.element_to_be_clickable((by,v)))
def wait_url_has  (d,s,t=config.W_DEFAULT):    _wdw(d,t).until(EC.url_contains(s))
def wait_url_not  (d,s,t=config.W_DEFAULT):    _wdw(d,t).until(lambda x: s not in x.current_url.lower())

def safe_find(d, by, v):
    try: return d.find_element(by,v)
    except NoSuchElementException: return None

def safe_find_all(d, by, v):
    try: return d.find_elements(by,v)
    except: return []

# ── Retry Click ───────────────────────────────────────────────
def retry_click(d, by, v, retries=3, t=config.W_DEFAULT):
    """Retries click on intercepted/stale elements — handles overlays."""
    for i in range(retries):
        try:
            el = wait_clickable(d, by, v, t)
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
            time.sleep(0.2)
            el.click()
            return el
        except ElementClickInterceptedException:
            d.execute_script("arguments[0].click();", d.find_element(by,v))
            return d.find_element(by,v)
        except Exception:
            if i == retries-1: raise
            time.sleep(0.5)

def js_click(d, by, v, t=config.W_DEFAULT):
    el = wait_clickable(d, by, v, t)
    d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    d.execute_script("arguments[0].click();", el)
    return el

# ── Screenshot ────────────────────────────────────────────────
def shot(driver, name):
    try:
        p = os.path.join(config.SCREENSHOT_DIR, name)
        driver.save_screenshot(p)
        log(f"    📷 {name}", C)
    except Exception as e:
        log(f"    ⚠ Screenshot failed: {e}", Y)

# ── Alert / Captcha ───────────────────────────────────────────
def dismiss_alert(d, t=4):
    try: _wdw(d,t).until(EC.alert_is_present()); d.switch_to.alert.accept()
    except: pass

def solve_captcha(d):
    """Solves arithmetic captcha like 'Captcha: 3 + 4'."""
    try:
        lbl = _wdw(d,5).until(EC.presence_of_element_located(
            (By.XPATH,"//label[contains(text(),'Captcha')]"))).text
        m = re.search(r'Captcha:\s*(\d+)\s*\+\s*(\d+)', lbl)
        if m:
            inp = d.find_element(By.XPATH,"//input[@placeholder='?']")
            inp.clear(); inp.send_keys(str(int(m.group(1))+int(m.group(2))))
    except: pass

# ── Session / Auth ────────────────────────────────────────────
def clear_session(d):
    d.execute_script("window.localStorage.clear();window.sessionStorage.clear();")
    d.delete_all_cookies()

def login(d, email, password):
    """Navigates to /login, fills credentials, waits for redirect."""
    d.get(config.BASE_URL)
    clear_session(d)
    d.get(config.BASE_URL + "login")
    wait_present(d, By.NAME, "email").send_keys(email)
    d.find_element(By.NAME, "password").send_keys(password)
    solve_captcha(d)
    d.find_element(By.XPATH,"//button[@type='submit']").click()
    try: _wdw(d,config.W_DEFAULT).until(lambda x:"login" not in x.current_url.lower())
    except TimeoutException: pass

def logout(d):
    """Finds and clicks Logout button; falls back to session clear."""
    d.get(config.BASE_URL)
    # Try hamburger on mobile
    try:
        h = _wdw(d,4).until(EC.element_to_be_clickable((By.CSS_SELECTOR,"button.md\\:hidden")))
        if h.is_displayed(): h.click(); time.sleep(0.3)
    except: pass
    try:
        btn = _wdw(d,6).until(EC.element_to_be_clickable(
            (By.XPATH,"//button[contains(translate(.,'LOGOUT','logout'),'logout') or "
                      "contains(translate(.,'SIGN OUT','sign out'),'sign out')]")))
        btn.click()
        return
    except: pass
    clear_session(d)

# ── Dummy File Creation ───────────────────────────────────────
def ensure_dummy_files():
    """Creates minimal valid PNG and PDF for upload tests."""
    if not os.path.exists(config.DUMMY_PNG):
        with open(config.DUMMY_PNG,'wb') as f:
            f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
                    b'\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01'
                    b'\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
    if not os.path.exists(config.DUMMY_PDF):
        with open(config.DUMMY_PDF,'wb') as f:
            f.write(b'%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n'
                    b'2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n'
                    b'3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>\nendobj\n'
                    b'xref\n0 4\n0000000000 65535 f\ntrailer\n<</Size 4/Root 1 0 R>>\n'
                    b'startxref\n9\n%%EOF')

# ── HTML Report Generator ─────────────────────────────────────
def generate_report(results, total, passed, failed, skipped, secs, browser):
    mins, s = divmod(secs, 60)
    pct  = (passed/total*100) if total else 0
    now  = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    rows = ""
    for r in results:
        cls = "pass" if r["status"]=="PASS" else ("skip" if r["status"]=="SKIP" else "fail")
        icon = {"PASS":"✅","FAIL":"❌","SKIP":"⏭"}[r["status"]]
        ss = (f'<a href="screenshots/{os.path.basename(r["ss"])}" target="_blank">📷</a>'
              if r.get("ss") else "—")
        rows += (f'<tr class="{cls}-row"><td>{r["id"]}</td><td>{r["name"]}</td>'
                 f'<td class="{cls}">{icon} {r["status"]}</td>'
                 f'<td class="err">{r.get("error","")}</td><td>{ss}</td></tr>\n')

    failed_li = "\n".join(f"<li>{r['id']} — {r.get('error','')}</li>"
                          for r in results if r["status"]=="FAIL") or "<li>None 🎉</li>"
    skip_li   = "\n".join(f"<li>{r['id']} — {r.get('error','Skipped')}</li>"
                          for r in results if r["status"]=="SKIP") or "<li>None</li>"

    html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Cravify QA Report — {now}</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#e6edf3;padding:2rem}}
h1{{color:#f97316;font-size:2rem;margin-bottom:.3rem}}
.meta{{color:#8b949e;font-size:.85rem;margin-bottom:1.5rem}}
.cards{{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}}
.card{{background:#161b22;border-radius:10px;padding:1rem 1.5rem;min-width:130px;border:1px solid #30363d}}
.card .v{{font-size:1.8rem;font-weight:700}}.card .l{{font-size:.75rem;color:#8b949e;margin-top:.2rem}}
.blue{{color:#58a6ff}}.green{{color:#3fb950}}.red{{color:#f85149}}.orange{{color:#f97316}}.yellow{{color:#e3b341}}
.bar{{height:10px;background:#21262d;border-radius:5px;margin-bottom:1.5rem;max-width:600px}}
.bar-fill{{height:100%;border-radius:5px;background:linear-gradient(90deg,#3fb950,#2ea043)}}
h2{{color:#f97316;margin:1rem 0 .5rem}}
table{{width:100%;border-collapse:collapse;font-size:.83rem}}
th{{background:#161b22;color:#f97316;padding:.6rem 1rem;text-align:left;border-bottom:2px solid #30363d}}
td{{padding:.55rem 1rem;border-bottom:1px solid #21262d}}
.pass-row{{background:#0d1f13}}.fail-row{{background:#1f0d0d}}.skip-row{{background:#161206}}
.pass{{color:#3fb950;font-weight:600}}.fail{{color:#f85149;font-weight:600}}.skip{{color:#e3b341;font-weight:600}}
.err{{color:#f87171;font-size:.78rem}}a{{color:#58a6ff}}
ul{{padding-left:1.5rem;line-height:1.9}}
</style></head><body>
<h1>🍔 Cravify QA — Automated Test Report</h1>
<p class="meta">Generated: {now} &nbsp;|&nbsp; Browser: {browser.title()} &nbsp;|&nbsp; URL: {config.BASE_URL}</p>
<div class="cards">
  <div class="card"><div class="v blue">{total}</div><div class="l">Total</div></div>
  <div class="card"><div class="v green">{passed}</div><div class="l">Passed</div></div>
  <div class="card"><div class="v red">{failed}</div><div class="l">Failed</div></div>
  <div class="card"><div class="v yellow">{skipped}</div><div class="l">Skipped</div></div>
  <div class="card"><div class="v orange">{pct:.1f}%</div><div class="l">Pass Rate</div></div>
  <div class="card"><div class="v blue">{mins}m {s}s</div><div class="l">Duration</div></div>
</div>
<div class="bar"><div class="bar-fill" style="width:{pct:.1f}%"></div></div>
<h2>📋 Test Results</h2>
<table><thead><tr><th>ID</th><th>Test Name</th><th>Status</th><th>Error</th><th>Screenshot</th></tr></thead>
<tbody>{rows}</tbody></table>
<h2>❌ Failed Cases</h2><ul class="fail">{failed_li}</ul>
<h2>⏭ Skipped Cases</h2><ul class="yellow">{skip_li}</ul>
</body></html>"""

    with open(config.REPORT_FILE,"w",encoding="utf-8") as f: f.write(html)
    log(f"\n  📄 Report: {config.REPORT_FILE}", C)
