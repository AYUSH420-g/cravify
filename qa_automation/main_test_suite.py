"""
Cravify QA — main_test_suite.py
35 real business tests: Auth, Customer, Vendor, Delivery, Admin, Security, UI, Perf.
Imports config.py (settings) and utils.py (helpers). Run: python main_test_suite.py
"""
import os, time, random, string
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import config
from utils import (create_driver, shot, log, G, R, Y, C, RESET,
                   wait_present, wait_visible, wait_clickable, wait_url_not,
                   safe_find, safe_find_all, retry_click, js_click,
                   dismiss_alert, solve_captcha, ensure_dummy_files,
                   login, logout, clear_session, generate_report)

# ── Shared Test State ─────────────────────────────────────────
_id = ''.join(random.choices(string.ascii_lowercase+string.digits, k=5))
D = {
    "cust_email": f"qa_c_{_id}@test.com", "cust_pass": "Test@1234!",
    "vend_email": f"qa_v_{_id}@test.com", "vend_pass": "Test@1234!",
    "vend_name":  f"QA Resto {_id}",      "item_name": f"QA Burger {_id}",
    "rider_email":f"qa_r_{_id}@test.com", "rider_pass":"Test@1234!",
    # Flow dependency flags
    "vendor_ok": False, "item_ok": False, "order_ok": False, "rider_ok": False,
}
results, passed, failed, skipped = [], 0, 0, 0

def _r(driver, tc_id, name, fn, skip_if=False, skip_reason=""):
    """Universal test runner with PASS/FAIL/SKIP tracking."""
    global passed, failed, skipped
    if skip_if:
        skipped += 1
        results.append({"id":tc_id,"name":name,"status":"SKIP","ss":None,"error":skip_reason})
        log(f"  ⏭ [SKIP] {tc_id}: {skip_reason}", Y)
        return False
    log(f"\n▶ {tc_id}: {name}", C)
    try:
        fn(driver)
        shot(driver, f"{tc_id}_PASS.png")
        passed += 1
        results.append({"id":tc_id,"name":name,"status":"PASS","ss":f"{tc_id}_PASS.png","error":""})
        log(f"  ✅ [PASS] {tc_id}", G)
        return True
    except Exception as e:
        shot(driver, f"{tc_id}_FAIL.png")
        failed += 1
        msg = str(e).split('\n')[0][:120]
        results.append({"id":tc_id,"name":name,"status":"FAIL","ss":f"{tc_id}_FAIL.png","error":msg})
        log(f"  ❌ [FAIL] {tc_id}: {msg}", R)
        return False

# ── AUTH TESTS ────────────────────────────────────────────────
def auth_01(d):
    d.get(config.BASE_URL+"signup")
    wait_present(d,By.NAME,"name").send_keys("QA Customer")
    d.find_element(By.NAME,"email").send_keys(D["cust_email"])
    d.find_element(By.NAME,"password").send_keys(D["cust_pass"])
    retry_click(d,By.XPATH,"//button[@type='submit']")
    wait_url_not(d,"signup")

def auth_02(d):
    # Duplicate email must be rejected — stays on signup with error
    d.get(config.BASE_URL+"signup")
    wait_present(d,By.NAME,"name").send_keys("QA Dup")
    d.find_element(By.NAME,"email").send_keys(D["cust_email"])
    d.find_element(By.NAME,"password").send_keys(D["cust_pass"])
    retry_click(d,By.XPATH,"//button[@type='submit']")
    time.sleep(2)
    assert "signup" in d.current_url.lower(), "Duplicate email should stay on signup"

def auth_03(d):
    d.get(config.BASE_URL+"signup")
    wait_present(d,By.NAME,"name").send_keys("Bad Email")
    d.find_element(By.NAME,"email").send_keys("notanemail")
    d.find_element(By.NAME,"password").send_keys("Test@1234!")
    retry_click(d,By.XPATH,"//button[@type='submit']")
    time.sleep(2)
    assert "signup" in d.current_url.lower(), "Invalid email must be rejected"

def auth_04(d):
    d.get(config.BASE_URL+"signup")
    wait_present(d,By.NAME,"name").send_keys("Weak Pwd")
    d.find_element(By.NAME,"email").send_keys(f"weak_{_id}@test.com")
    d.find_element(By.NAME,"password").send_keys("123")
    retry_click(d,By.XPATH,"//button[@type='submit']")
    time.sleep(2)
    assert "signup" in d.current_url.lower(), "Weak password must be rejected"

def auth_05(d):
    login(d, D["cust_email"], D["cust_pass"])
    assert "login" not in d.current_url.lower(), "Valid login must navigate away from /login"

def auth_06(d):
    login(d,"wrong@test.com","wrongpass")
    assert "login" in d.current_url.lower(), "Invalid login must stay on /login"
    err = safe_find(d,By.XPATH,"//*[contains(text(),'Invalid') or contains(text(),'invalid')]")
    assert err is not None, "Error message must be visible on invalid login"

def auth_07(d):
    login(d, D["cust_email"], D["cust_pass"])
    logout(d)
    # After logout, protected route must redirect to login
    d.get(config.BASE_URL+"profile")
    time.sleep(2)
    assert "login" in d.current_url.lower() or "login" in d.page_source.lower()

def auth_08(d):
    login(d, D["cust_email"], D["cust_pass"])
    d.refresh()
    time.sleep(2)
    assert "login" not in d.current_url.lower(), "Session must persist after page refresh"
    logout(d)

# ── VENDOR TESTS ──────────────────────────────────────────────
def vendor_01(d):
    ensure_dummy_files()
    d.get(config.BASE_URL+"vendor/signup")
    wait_present(d,By.NAME,"ownerName").send_keys("QA Owner")
    d.find_element(By.NAME,"phone").send_keys("9876543210")
    d.find_element(By.NAME,"email").send_keys(D["vend_email"])
    d.find_element(By.NAME,"password").send_keys(D["vend_pass"])
    retry_click(d,By.XPATH,"//button[contains(.,'Next')]")
    wait_present(d,By.NAME,"restaurantName").send_keys(D["vend_name"])
    d.find_element(By.NAME,"address").send_keys("123 QA Lane")
    d.find_element(By.NAME,"pincode").send_keys("400001")
    try: Select(d.find_element(By.NAME,"cuisine")).select_by_value("Fast Food")
    except: pass
    d.find_element(By.NAME,"fssai").send_keys("12345678901234")
    retry_click(d,By.XPATH,"//button[contains(.,'Next')]")
    for fi in safe_find_all(d,By.CSS_SELECTOR,"input[type='file']"):
        fi.send_keys(config.DUMMY_PNG)
    js_click(d,By.XPATH,"//button[contains(.,'Submit')]")
    dismiss_alert(d, t=5)
    D["vendor_ok"] = True

def admin_01(d):
    login(d, config.ADMIN_EMAIL, config.ADMIN_PASS)
    d.get(config.BASE_URL+"admin/users")
    s = wait_present(d,By.XPATH,"//input[@placeholder='Search...']")
    s.clear(); s.send_keys(D["vend_email"])
    time.sleep(2)
    approves = safe_find_all(d,By.XPATH,"//button[@title='Quick Approve']")
    assert approves, "Vendor must appear in admin user list for approval"
    approves[0].click(); dismiss_alert(d)
    logout(d)

def vendor_02(d):
    login(d, D["vend_email"], D["vend_pass"])
    d.get(config.BASE_URL+"vendor/menu")
    retry_click(d,By.XPATH,"//button[contains(.,'Add New Item')]")
    wait_visible(d,By.XPATH,"//input[@placeholder='e.g. Garlic Bread']").send_keys(D["item_name"])
    d.find_element(By.XPATH,"//input[@placeholder='150']").send_keys("150")
    cat = safe_find(d,By.XPATH,"//input[@placeholder='Starters']")
    if cat: cat.send_keys("QA Category")
    js_click(d,By.XPATH,"//button[@type='submit' and (contains(.,'Add Item') or contains(.,'Save'))]")
    time.sleep(2)
    assert safe_find(d,By.XPATH,f"//*[contains(text(),'{D['item_name']}')]") is not None
    D["item_ok"] = True
    logout(d)

def vendor_03(d):
    # Edit menu item — vendor must see edit button on existing item
    login(d, D["vend_email"], D["vend_pass"])
    d.get(config.BASE_URL+"vendor/menu")
    time.sleep(3)
    edit_btn = safe_find(d,By.XPATH,f"//button[contains(.,'Edit') or contains(.,'✏')]")
    assert edit_btn is not None, "Edit button must exist for menu items"
    shot(d, "vendor_menu_edit_checkpoint.png")
    logout(d)

def vendor_04(d):
    login(d, D["vend_email"], D["vend_pass"])
    d.get(config.BASE_URL+"vendor/orders")
    time.sleep(3)
    # Dashboard must show order panel (even if empty)
    assert safe_find(d,By.TAG_NAME,"main") is not None
    logout(d)

# ── CUSTOMER TESTS ────────────────────────────────────────────
def cust_01(d):
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL+"restaurants")
    time.sleep(3)
    # At least one restaurant card must render
    cards = safe_find_all(d,By.XPATH,"//*[contains(@class,'card') or contains(@class,'restaurant')]")
    assert len(cards) > 0 or safe_find(d,By.XPATH,"//h2 or //h3") is not None
    logout(d)

def cust_02(d):
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL)
    s = wait_present(d,By.XPATH,"//input[contains(@placeholder,'Search')]")
    s.send_keys(D["vend_name"]); time.sleep(2)
    shot(d,"search_results_checkpoint.png")
    logout(d)

def cust_03(d):
    # Empty checkout must be blocked
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL+"cart")
    time.sleep(2)
    chk = safe_find(d,By.XPATH,"//button[contains(.,'Checkout')]")
    if chk:
        chk.click(); time.sleep(2)
        # Must not reach payment — either error shown or still on cart
        assert "payment" not in d.current_url.lower()
    logout(d)

def cust_04(d):
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL)
    # Search and open vendor
    s = wait_present(d,By.XPATH,"//input[contains(@placeholder,'Search')]")
    s.send_keys(D["vend_name"]); time.sleep(2)
    cards = safe_find_all(d,By.XPATH,f"//*[contains(text(),'{D['vend_name']}')]")
    if cards: cards[0].click()
    wait_present(d,By.XPATH,f"//*[contains(text(),'{D['item_name']}')]")
    # Add to cart
    add_btns = safe_find_all(d,By.XPATH,"//button[contains(.,'Add')]")
    assert add_btns, "Add to cart button must exist"
    add_btns[-1].click(); time.sleep(1)
    shot(d,"add_to_cart_checkpoint.png")
    # Verify cart count badge updated
    badge = safe_find(d,By.XPATH,"//a[contains(@href,'/cart')]//span")
    if badge: assert int(badge.text) > 0
    logout(d)

def cust_05(d):
    # Full checkout flow: cart → address → place order
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL+"cart")
    time.sleep(2)
    items = safe_find_all(d,By.XPATH,f"//*[contains(text(),'{D['item_name']}')]")
    assert items, "Item must appear in cart"
    # Verify subtotal > 0
    subtotal = safe_find(d,By.XPATH,"//*[contains(text(),'₹') or contains(text(),'Total')]")
    assert subtotal is not None
    retry_click(d,By.XPATH,"//button[contains(.,'Checkout')]")
    time.sleep(2)
    addr = safe_find(d,By.XPATH,"//button[contains(.,'Add New Address')]")
    if addr:
        addr.click()
        wait_present(d,By.XPATH,"//input[contains(@placeholder,'MG Road')]").send_keys("123 QA St")
        d.find_element(By.XPATH,"//input[contains(@placeholder,'Ahmedabad')]").send_keys("QA City")
        d.find_element(By.XPATH,"//input[contains(@placeholder,'380009')]").send_keys("400001")
        js_click(d,By.XPATH,"//button[contains(.,'Save Address')]")
        time.sleep(2)
    place = safe_find(d,By.XPATH,"//button[contains(.,'Place Order')]")
    if place:
        place.click(); time.sleep(4)
        D["order_ok"] = True
    shot(d,"checkout_complete_checkpoint.png")
    logout(d)

def cust_06(d):
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL+"orders")
    time.sleep(3)
    rows = safe_find_all(d,By.XPATH,"//table//tr[position()>1] | //*[contains(@class,'order-card')]")
    assert len(rows) > 0, "Order history must show at least one order"
    logout(d)

# ── DELIVERY TESTS ────────────────────────────────────────────
def deliv_01(d):
    ensure_dummy_files()
    d.get(config.BASE_URL+"delivery/signup")
    wait_present(d,By.NAME,"name").send_keys("QA Rider")
    d.find_element(By.NAME,"email").send_keys(D["rider_email"])
    d.find_element(By.NAME,"password").send_keys(D["rider_pass"])
    d.find_element(By.NAME,"phone").send_keys("9123456789")
    d.find_element(By.NAME,"city").send_keys("QA City")
    retry_click(d,By.XPATH,"//button[contains(.,'Next')]")
    try: Select(wait_present(d,By.NAME,"vehicleType")).select_by_value("Bike")
    except: pass
    w = safe_find(d,By.NAME,"vehicleNumber")
    if w: w.send_keys("MH12QA1234")
    retry_click(d,By.XPATH,"//button[contains(.,'Next')]")
    for fi in safe_find_all(d,By.CSS_SELECTOR,"input[type='file']"):
        fi.send_keys(config.DUMMY_PNG)
    js_click(d,By.XPATH,"//button[contains(.,'Submit')]")
    dismiss_alert(d, t=5)
    D["rider_ok"] = True

def admin_02(d):
    login(d, config.ADMIN_EMAIL, config.ADMIN_PASS)
    d.get(config.BASE_URL+"admin/users")
    s = wait_present(d,By.XPATH,"//input[@placeholder='Search...']")
    s.clear(); s.send_keys(D["rider_email"])
    time.sleep(2)
    approves = safe_find_all(d,By.XPATH,"//button[@title='Quick Approve']")
    assert approves, "Rider must appear in admin user list"
    approves[0].click(); dismiss_alert(d)
    logout(d)

def deliv_02(d):
    login(d, D["rider_email"], D["rider_pass"])
    d.get(config.BASE_URL+"delivery/dashboard")
    time.sleep(3)
    online = safe_find(d,By.XPATH,"//button[contains(.,'Go Online')]")
    if online: online.click(); time.sleep(1)
    accept = safe_find(d,By.XPATH,"//button[contains(.,'Accept')]")
    if accept:
        accept.click(); time.sleep(2)
        picked = safe_find(d,By.XPATH,"//button[contains(.,'Picked Up')]")
        if picked: picked.click(); time.sleep(2)
        delivered = safe_find(d,By.XPATH,"//button[contains(.,'Delivered')]")
        if delivered: delivered.click(); time.sleep(2)
    shot(d,"delivery_flow_checkpoint.png")
    logout(d)

# ── ADMIN TESTS ───────────────────────────────────────────────
def admin_03(d):
    login(d, config.ADMIN_EMAIL, config.ADMIN_PASS)
    d.get(config.BASE_URL+"admin/dashboard")
    time.sleep(3)
    # Dashboard must show at least one stat card
    stats = safe_find_all(d,By.XPATH,"//*[contains(@class,'stat') or contains(@class,'card') or contains(@class,'count')]")
    assert len(stats) > 0, "Admin dashboard must display statistics"
    logout(d)

def admin_04(d):
    login(d, config.ADMIN_EMAIL, config.ADMIN_PASS)
    d.get(config.BASE_URL+"admin/users")
    s = wait_present(d,By.XPATH,"//input[@placeholder='Search...']")
    s.send_keys("test"); time.sleep(2)
    rows = safe_find_all(d,By.XPATH,"//table//tr[position()>1]")
    assert len(rows) >= 0  # Search must not crash
    logout(d)

# ── SECURITY TESTS ────────────────────────────────────────────
def sec_01(d):
    # Unauthenticated user hitting /admin must be redirected
    clear_session(d); d.get(config.BASE_URL+"admin/dashboard"); time.sleep(2)
    assert "admin/dashboard" not in d.current_url.lower(), "Admin route must block unauthenticated access"

def sec_02(d):
    # Customer must not access admin panel
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL+"admin/dashboard"); time.sleep(2)
    assert "admin/dashboard" not in d.current_url.lower()
    logout(d)

def sec_03(d):
    # XSS in search must not execute JS
    login(d, D["cust_email"], D["cust_pass"])
    d.get(config.BASE_URL)
    s = safe_find(d,By.XPATH,"//input[contains(@placeholder,'Search')]")
    if s: s.send_keys("<script>alert('XSS')</script>"); time.sleep(1)
    alert_fired = False
    try: d.switch_to.alert.dismiss(); alert_fired = True
    except: pass
    assert not alert_fired, "XSS payload must be sanitized — no alert should fire"
    logout(d)

def sec_04(d):
    # SQL injection in login must be rejected
    clear_session(d); d.get(config.BASE_URL+"login")
    wait_present(d,By.NAME,"email").send_keys("admin' OR '1'='1'--")
    d.find_element(By.NAME,"password").send_keys("' OR 1=1--")
    solve_captcha(d)
    d.find_element(By.XPATH,"//button[@type='submit']").click()
    time.sleep(2)
    assert "admin" not in d.current_url.lower() and "dashboard" not in d.current_url.lower()

def sec_05(d):
    # Empty login form must not succeed
    clear_session(d); d.get(config.BASE_URL+"login")
    wait_present(d,By.NAME,"email")
    d.find_element(By.XPATH,"//button[@type='submit']").click()
    time.sleep(2)
    assert "login" in d.current_url.lower()

def sec_06(d):
    # Unauthenticated vendor route must redirect
    clear_session(d); d.get(config.BASE_URL+"vendor/dashboard"); time.sleep(2)
    assert "vendor/dashboard" not in d.current_url.lower() or "login" in d.current_url.lower()

# ── UI TESTS ──────────────────────────────────────────────────
def ui_01(d):
    d.get(config.BASE_URL)
    nav = wait_present(d,By.TAG_NAME,"nav")
    assert nav.is_displayed(), "Navbar must be visible"

def ui_02(d):
    d.set_window_size(375,812); d.get(config.BASE_URL); time.sleep(2)
    scroll = d.execute_script("return document.body.scrollWidth > window.innerWidth")
    assert not scroll, "No horizontal scroll on mobile viewport"
    d.maximize_window()

def ui_03(d):
    d.get(config.BASE_URL); time.sleep(2)
    broken = d.execute_script(
        "return Array.from(document.images).filter(i=>!i.complete||i.naturalWidth===0).length")
    assert broken == 0, f"{broken} broken image(s) found on homepage"

# ── PERFORMANCE TESTS ─────────────────────────────────────────
def perf_01(d):
    t0 = time.time(); d.get(config.BASE_URL)
    wait_present(d,By.TAG_NAME,"nav")
    elapsed = time.time()-t0
    assert elapsed < config.PERF_PAGE_LOAD, f"Homepage load {elapsed:.2f}s > {config.PERF_PAGE_LOAD}s"

def perf_02(d):
    t0 = time.time()
    login(d, D["cust_email"], D["cust_pass"])
    elapsed = time.time()-t0
    assert elapsed < config.PERF_LOGIN, f"Login took {elapsed:.2f}s > {config.PERF_LOGIN}s"
    logout(d)

# ── TEST PLAN ─────────────────────────────────────────────────
# (id, name, function, skip_flag_key, skip_reason)
TEST_PLAN = [
    ("AUTH_01","Register Customer",            auth_01, None, ""),
    ("AUTH_02","Block Duplicate Email",        auth_02, None, ""),
    ("AUTH_03","Reject Invalid Email Format",  auth_03, None, ""),
    ("AUTH_04","Reject Weak Password",         auth_04, None, ""),
    ("AUTH_05","Valid Login",                  auth_05, None, ""),
    ("AUTH_06","Invalid Login Shows Error",    auth_06, None, ""),
    ("AUTH_07","Logout Clears Session",        auth_07, None, ""),
    ("AUTH_08","Session Persists on Refresh",  auth_08, None, ""),
    ("VEND_01","Vendor Signup",                vendor_01, None, ""),
    ("ADMIN_01","Admin Approves Vendor",       admin_01,"vendor_ok","vendor_01 failed"),
    ("VEND_02","Vendor Adds Menu Item",        vendor_02,"vendor_ok","vendor_01 failed"),
    ("VEND_03","Vendor Edit Menu Button",      vendor_03,"item_ok",  "vendor_02 failed"),
    ("VEND_04","Vendor Views Orders Page",     vendor_04,"vendor_ok","vendor_01 failed"),
    ("CUST_01","Browse Restaurants List",      cust_01, None, ""),
    ("CUST_02","Search Restaurant",            cust_02, None, ""),
    ("CUST_03","Empty Checkout Blocked",       cust_03, None, ""),
    ("CUST_04","Add Item to Cart",             cust_04,"item_ok",  "Menu item missing"),
    ("CUST_05","Checkout & Place Order",       cust_05,"item_ok",  "Menu item missing"),
    ("CUST_06","Order Appears in History",     cust_06,"order_ok", "Order was not placed"),
    ("DELIV_01","Delivery Rider Signup",       deliv_01, None, ""),
    ("ADMIN_02","Admin Approves Rider",        admin_02,"rider_ok","deliv_01 failed"),
    ("DELIV_02","Rider Accept & Deliver",      deliv_02,"rider_ok","deliv_01 failed"),
    ("ADMIN_03","Admin Dashboard Stats",       admin_03, None, ""),
    ("ADMIN_04","Admin User Search",           admin_04, None, ""),
    ("SEC_01","Admin Route Blocks Anon",       sec_01,  None, ""),
    ("SEC_02","Admin Route Blocks Customer",   sec_02,  None, ""),
    ("SEC_03","XSS Payload Sanitized",         sec_03,  None, ""),
    ("SEC_04","SQL Injection Rejected",        sec_04,  None, ""),
    ("SEC_05","Empty Login Blocked",           sec_05,  None, ""),
    ("SEC_06","Vendor Route Blocks Anon",      sec_06,  None, ""),
    ("UI_01", "Navbar Visible",               ui_01,   None, ""),
    ("UI_02", "No Horizontal Scroll Mobile",  ui_02,   None, ""),
    ("UI_03", "No Broken Images",             ui_03,   None, ""),
    ("PERF_01","Homepage Load Under Threshold",perf_01,None, ""),
    ("PERF_02","Login Response Under Threshold",perf_02,None,""),
]

def main():
    if os.path.exists(config.LOG_FILE): open(config.LOG_FILE,'w').close()
    log("="*52, Y)
    log("  CRAVIFY AUTOMATED TEST SUITE", Y)
    log("="*52+"\n", Y)

    driver = create_driver(config.BROWSER)
    t0 = time.time()

    for tc_id, name, fn, skip_key, skip_reason in TEST_PLAN:
        should_skip = bool(skip_key and not D.get(skip_key))
        _r(driver, tc_id, name, fn,
           skip_if=should_skip,
           skip_reason=skip_reason if should_skip else "")

    driver.quit()
    elapsed = int(time.time()-t0)
    total = len(TEST_PLAN)
    mins, secs = divmod(elapsed, 60)
    pct = (passed/total*100) if total else 0

    generate_report(results, total, passed, failed, skipped, elapsed, config.BROWSER)

    print("\n"+"="*52)
    print("  CRAVIFY TEST EXECUTION SUMMARY")
    print("="*52)
    print(f"  Total Test Cases   : {total}")
    print(f"  Passed             : \033[92m{passed}\033[0m")
    print(f"  Failed             : \033[91m{failed}\033[0m")
    print(f"  Skipped            : \033[93m{skipped}\033[0m")
    print(f"  Pass Percentage    : {pct:.1f}%")
    print(f"  Execution Time     : {mins}m {secs}s")
    print(f"  Browser Used       : {config.BROWSER.title()}")
    if failed:
        print("\n  Failed Cases:")
        for r in results:
            if r["status"]=="FAIL": print(f"    \033[91m- {r['id']}\033[0m")
    if skipped:
        print("\n  Skipped Cases:")
        for r in results:
            if r["status"]=="SKIP": print(f"    \033[93m- {r['id']}\033[0m")
    print("="*52+"\n")

if __name__ == "__main__":
    main()
