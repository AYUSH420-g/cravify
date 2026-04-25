"""
run_all_tests.py — Master Test Runner for Cravify QA Suite
Executes all 90 test cases and generates the final HTML + JSON report.

Usage:
    python run_all_tests.py
"""

import os
import sys
import json
import time
import subprocess
from datetime import datetime

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TESTS_DIR      = os.path.join(BASE_DIR, 'tests')
REPORTS_DIR    = os.path.join(BASE_DIR, 'reports')
SCREENSHOT_DIR = os.path.join(BASE_DIR, 'screenshots')
BASE_URL       = "https://cravify-peach.vercel.app"

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

BANNER = """
╔══════════════════════════════════════════════════════════════════╗
║           🍔  CRAVIFY QA AUTOMATION SUITE  🍔                    ║
║           Selenium WebDriver + PyTest                            ║
║           90 Test Cases | 9 Modules | Full Coverage              ║
╚══════════════════════════════════════════════════════════════════╝
"""

def run():
    print(BANNER)
    print(f"▶  Target URL  : {BASE_URL}")
    print(f"▶  Tests Dir   : {TESTS_DIR}")
    print(f"▶  Reports Dir : {REPORTS_DIR}")
    print(f"▶  Started At  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("═" * 68)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_report = os.path.join(REPORTS_DIR, f"cravify_test_report_{timestamp}.json")
    html_report = os.path.join(REPORTS_DIR, f"cravify_test_report_{timestamp}.html")

    # Build pytest command
    cmd = [
        sys.executable, "-m", "pytest",
        TESTS_DIR,
        "--tb=short",
        "-v",
        "--continue-on-collection-errors",
        f"--json-report",
        f"--json-report-file={json_report}",
        "--capture=no",
        "-p", "no:warnings",
    ]

    print("\n🚀 Launching test suite...\n")
    start = time.time()

    result = subprocess.run(cmd, cwd=TESTS_DIR)

    elapsed = time.time() - start
    print(f"\n{'═'*68}")
    print(f"⏱  Total execution time: {elapsed:.1f}s")
    print(f"📁 JSON report: {json_report}")

    # Now generate HTML report from stored results
    _generate_html_from_json(json_report, html_report, elapsed)

    print(f"📊 HTML report: {html_report}")
    print(f"\n{'═'*68}")

    if result.returncode == 0:
        print("✅  ALL TESTS PASSED!")
    else:
        print(f"⚠️  Some tests failed (exit code {result.returncode}). Check HTML report.")

    # Open the report in browser
    try:
        import webbrowser
        webbrowser.open(f"file:///{html_report.replace(os.sep, '/')}")
        print("🌐 Report opened in your default browser.")
    except Exception:
        pass

    return result.returncode


def _generate_html_from_json(json_path, html_path, elapsed):
    """Read pytest-json-report output and generate styled HTML."""
    try:
        if not os.path.exists(json_path):
            print(f"⚠ JSON report not found at {json_path} — HTML skipped.")
            return

        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)

        tests = data.get("tests", [])
        summary = data.get("summary", {})
        total   = summary.get("total", len(tests))
        passed  = summary.get("passed", 0)
        failed  = summary.get("failed", 0)
        warned  = summary.get("warnings", 0)
        errors  = summary.get("error", 0)
        pass_rate = (passed / total * 100) if total else 0

        STATUS_COLOR = {"passed": "#22c55e", "failed": "#ef4444", "error": "#ef4444"}
        STATUS_EMOJI = {"passed": "✅", "failed": "❌", "error": "❌"}

        rows = ""
        for t in tests:
            nodeid = t.get("nodeid", "")
            outcome = t.get("outcome", "unknown")
            dur = t.get("duration", 0)
            call_log = t.get("call", {})
            longrepr = ""
            if call_log and call_log.get("longrepr"):
                longrepr = str(call_log["longrepr"])[:200]

            # Parse TC ID from test name
            tc_id = "—"
            name_parts = nodeid.split("::")
            if len(name_parts) >= 2:
                fn = name_parts[-1]
                if "_TC" in fn:
                    tc_id = fn.split("_TC")[0] + fn.split("_TC")[1].split("_")[0]
                    tc_id = "TC_" + fn.split("_TC")[1].split("_")[0]

            color = STATUS_COLOR.get(outcome, "#888")
            emoji = STATUS_EMOJI.get(outcome, "⚠️")

            rows += f"""
            <tr>
              <td style="color:#a855f7;font-weight:700">{tc_id}</td>
              <td style="font-size:0.82em">{nodeid.split('::')[-1]}</td>
              <td><span style="background:{color};color:#fff;padding:3px 10px;border-radius:12px;font-size:0.85em;font-weight:700">{emoji} {outcome.upper()}</span></td>
              <td>{dur:.2f}s</td>
              <td style="font-size:0.78em;color:#94a3b8">{longrepr}</td>
            </tr>"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cravify QA Report — {datetime.now().strftime('%d %b %Y')}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Inter',sans-serif;background:#0f0f1a;color:#e2e8f0}}
  .header{{background:linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95);padding:48px 40px 32px;text-align:center;border-bottom:2px solid #7c3aed}}
  .header h1{{font-size:2.8rem;font-weight:900;color:#fff;margin-bottom:8px}}
  .header h1 span{{color:#a855f7}}
  .header p{{color:#c4b5fd}}
  .badge{{display:inline-block;background:#7c3aed;color:#fff;padding:4px 14px;border-radius:20px;font-size:0.85rem;margin:4px}}
  .grid{{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;padding:32px 40px;background:#13131f}}
  .card{{background:#1e1b4b;border-radius:16px;padding:24px 20px;text-align:center;border:1px solid #2d2a5e}}
  .card .num{{font-size:2.5rem;font-weight:900}}
  .card .lbl{{font-size:0.85rem;color:#94a3b8;margin-top:6px;text-transform:uppercase}}
  .progress-bar{{background:#2d2a5e;border-radius:8px;height:18px;overflow:hidden;margin-top:8px}}
  .progress-fill{{height:100%;border-radius:8px}}
  section{{padding:32px 40px}}
  h2{{font-size:1.5rem;font-weight:700;color:#a855f7;margin-bottom:20px;border-left:4px solid #7c3aed;padding-left:12px}}
  .wrap{{overflow-x:auto;border-radius:12px;border:1px solid #2d2a5e}}
  table{{width:100%;border-collapse:collapse;font-size:0.88rem}}
  th{{background:#1e1b4b;color:#c4b5fd;font-weight:700;padding:14px 12px;text-align:left}}
  td{{padding:12px;border-bottom:1px solid #1e1b4b;vertical-align:middle}}
  tr:nth-child(even) td{{background:#13131f}}
  .suggestions{{background:#1e1b4b;border-radius:12px;padding:24px;border:1px solid #7c3aed}}
  .suggestions li{{margin:10px 0;padding-left:8px;border-left:3px solid #7c3aed;list-style:none}}
  footer{{text-align:center;padding:24px;background:#0a0a14;color:#64748b;font-size:0.85rem;border-top:1px solid #1e1b4b}}
</style>
</head>
<body>
<div class="header">
  <h1>🍔 <span>Cravify</span> QA Test Report</h1>
  <p>Comprehensive End-to-End Quality Assurance Automation Report</p><br>
  <span class="badge">🌐 {BASE_URL}</span>
  <span class="badge">📅 {datetime.now().strftime('%d %B %Y, %H:%M')}</span>
  <span class="badge">⏱ {elapsed:.1f}s execution</span>
  <span class="badge">🤖 Selenium WebDriver + PyTest</span>
</div>

<div class="grid">
  <div class="card"><div class="num" style="color:#a855f7">{total}</div><div class="lbl">Total Tests</div></div>
  <div class="card"><div class="num" style="color:#22c55e">{passed}</div><div class="lbl">✅ Passed</div></div>
  <div class="card"><div class="num" style="color:#ef4444">{failed + errors}</div><div class="lbl">❌ Failed</div></div>
  <div class="card"><div class="num" style="color:#f97316">{warned}</div><div class="lbl">⚠️ Warnings</div></div>
  <div class="card">
    <div class="num" style="color:{'#22c55e' if pass_rate>=80 else '#ef4444'}">{pass_rate:.1f}%</div>
    <div class="lbl">Pass Rate</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:{pass_rate}%;background:{'#22c55e' if pass_rate>=80 else '#ef4444'}"></div>
    </div>
  </div>
</div>

<section>
  <h2>📋 Test Execution Results</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>TC ID</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Details</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
</section>

<section>
  <h2>💡 Improvement Suggestions</h2>
  <div class="suggestions">
    <ul>
      <li>🔐 <strong>JWT Storage:</strong> Use HTTP-only cookies instead of localStorage to prevent XSS-based token theft.</li>
      <li>🏎️ <strong>Performance:</strong> Implement lazy loading for restaurant card images to improve LCP scores.</li>
      <li>♿ <strong>Accessibility:</strong> Add aria-labels to all icon-only buttons; ensure all images have meaningful alt text.</li>
      <li>📱 <strong>Mobile UX:</strong> Audit and fix horizontal overflow on 375px viewport in data tables and card grids.</li>
      <li>🛡️ <strong>Input Validation:</strong> Enforce server-side validation for all user inputs beyond HTML5 constraints.</li>
      <li>📊 <strong>Admin Security:</strong> Add server-side RBAC middleware — reject API calls with wrong-role JWTs, not just frontend redirect.</li>
      <li>🔄 <strong>Loading States:</strong> Add skeleton loaders during API fetch for better perceived performance.</li>
      <li>💳 <strong>Payment Testing:</strong> Integrate Razorpay sandbox for realistic end-to-end payment testing.</li>
      <li>📝 <strong>Error Handling:</strong> Standardize error messages using a centralized toast notification system.</li>
      <li>🧪 <strong>CI/CD Pipeline:</strong> Integrate this suite in GitHub Actions for automated regression testing on every PR merge.</li>
    </ul>
  </div>
</section>

<section>
  <h2>📁 Test Coverage Map</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>Module</th><th>TC Range</th><th>Test Count</th><th>Coverage</th></tr></thead>
      <tbody>
        <tr><td>Homepage & Smoke</td><td>TC_01 – TC_08</td><td>8</td><td>Landing page, navbar, footer, cards, static pages</td></tr>
        <tr><td>Authentication</td><td>TC_09 – TC_22</td><td>14</td><td>Login, signup, forgot pwd, route guards, role protection</td></tr>
        <tr><td>Customer Flow</td><td>TC_23 – TC_36</td><td>14</td><td>Browse, search, cart, checkout, tracking, loyalty</td></tr>
        <tr><td>Admin Module</td><td>TC_37 – TC_44</td><td>8</td><td>Dashboard, users, restaurants, orders, settings guards</td></tr>
        <tr><td>Vendor Module</td><td>TC_45 – TC_52</td><td>8</td><td>Login, dashboard, menu, orders, history, signup</td></tr>
        <tr><td>Delivery Partner</td><td>TC_53 – TC_60</td><td>8</td><td>Login, dashboard, history, earnings, profile, signup</td></tr>
        <tr><td>Security</td><td>TC_61 – TC_70</td><td>10</td><td>XSS, SQLi, HTTPS, stack traces, broken links, secrets</td></tr>
        <tr><td>Responsive / Cross-Device</td><td>TC_71 – TC_80</td><td>10</td><td>Desktop, laptop, tablet, mobile, hamburger menu</td></tr>
        <tr><td>Performance & UI</td><td>TC_81 – TC_90</td><td>10</td><td>Load time, timing API, console errors, buttons, alt text</td></tr>
      </tbody>
    </table>
  </div>
</section>

<footer>
  Generated by Cravify QA Automation Framework · Selenium WebDriver · PyTest<br>
  {datetime.now().strftime('%A, %d %B %Y at %H:%M:%S')} · Execution: {elapsed:.1f}s
</footer>
</body>
</html>"""

        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)

    except Exception as e:
        print(f"⚠ HTML generation error: {e}")


if __name__ == "__main__":
    sys.exit(run())