"""
generate_report.py — HTML + JSON Test Report Generator
Reads results from conftest._results and generates:
  - qa_automation/reports/cravify_test_report.html
  - qa_automation/reports/cravify_test_report.json
"""

import json
import os
from datetime import datetime
from conftest import get_results, REPORTS_DIR, SCREENSHOT_BASE, BASE_URL

SEVERITY_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
SEVERITY_COLOR = {
    "Critical": "#ef4444",
    "High":     "#f97316",
    "Medium":   "#eab308",
    "Low":      "#22c55e",
}
STATUS_COLOR = {"PASS": "#22c55e", "FAIL": "#ef4444", "WARN": "#f97316"}
STATUS_EMOJI = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}


def generate_html_report(results):
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    warned = sum(1 for r in results if r["status"] == "WARN")
    pass_rate = (passed / total * 100) if total else 0

    # Bug report = only FAILs sorted by severity
    bugs = sorted(
        [r for r in results if r["status"] == "FAIL"],
        key=lambda x: SEVERITY_ORDER.get(x["severity"], 99)
    )

    # Build test rows
    rows = ""
    for r in results:
        sc = r.get("screenshot", "")
        sc_rel = sc.replace("\\", "/") if sc else ""
        sc_html = (
            f'<a href="file:///{sc_rel}" target="_blank">'
            f'<img src="file:///{sc_rel}" style="max-width:120px;max-height:80px;border-radius:4px;" /></a>'
        ) if sc and os.path.exists(sc) else "<em style='color:#666'>No screenshot</em>"

        steps_html = "<ol>" + "".join(f"<li>{s}</li>" for s in r.get("steps", [])) + "</ol>"

        rows += f"""
        <tr>
          <td style="font-weight:700;color:#a855f7">{r['tc_id']}</td>
          <td>{r['module']}</td>
          <td>{r['description']}</td>
          <td style="font-size:0.82em">{steps_html}</td>
          <td style="font-size:0.82em">{r['expected']}</td>
          <td style="font-size:0.82em">{r['actual']}</td>
          <td>
            <span style="background:{STATUS_COLOR.get(r['status'],'#888')};color:#fff;
            padding:3px 10px;border-radius:12px;font-weight:700;font-size:0.85em;">
            {STATUS_EMOJI.get(r['status'],'')} {r['status']}</span>
          </td>
          <td>
            <span style="color:{SEVERITY_COLOR.get(r['severity'],'#888')};font-weight:700;">
            {r['severity']}</span>
          </td>
          <td>{r['timestamp']}</td>
          <td>{sc_html}</td>
        </tr>"""

    # Bug rows
    bug_rows = ""
    for i, b in enumerate(bugs, 1):
        bug_rows += f"""
        <tr>
          <td>BUG-{i:02d}</td>
          <td style="font-weight:700;color:#a855f7">{b['tc_id']}</td>
          <td>{b['module']}</td>
          <td style="color:{SEVERITY_COLOR.get(b['severity'],'#888')};font-weight:700">{b['severity']}</td>
          <td>{b['description']}</td>
          <td style="font-size:0.82em">{b['actual']}</td>
          <td style="font-size:0.82em">{b['expected']}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cravify QA Test Report — {datetime.now().strftime('%d %b %Y')}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Inter', sans-serif; background: #0f0f1a; color: #e2e8f0; }}
  .header {{
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
    padding: 48px 40px 32px;
    text-align: center;
    border-bottom: 2px solid #7c3aed;
  }}
  .header h1 {{ font-size: 2.8rem; font-weight: 900; color: #fff; margin-bottom: 8px; }}
  .header h1 span {{ color: #a855f7; }}
  .header p {{ color: #c4b5fd; font-size: 1.05rem; }}
  .header .badge {{ display: inline-block; background: #7c3aed; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; margin: 4px; }}
  .summary-grid {{
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;
    padding: 32px 40px; background: #13131f;
  }}
  .stat-card {{
    background: #1e1b4b; border-radius: 16px; padding: 24px 20px; text-align: center;
    border: 1px solid #2d2a5e;
  }}
  .stat-card .num {{ font-size: 2.5rem; font-weight: 900; }}
  .stat-card .label {{ font-size: 0.85rem; color: #94a3b8; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }}
  .section {{ padding: 32px 40px; }}
  .section h2 {{ font-size: 1.5rem; font-weight: 700; color: #a855f7; margin-bottom: 20px; border-left: 4px solid #7c3aed; padding-left: 12px; }}
  .table-wrap {{ overflow-x: auto; border-radius: 12px; border: 1px solid #2d2a5e; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 0.88rem; }}
  th {{ background: #1e1b4b; color: #c4b5fd; font-weight: 700; padding: 14px 12px; text-align: left; white-space: nowrap; }}
  td {{ padding: 12px; border-bottom: 1px solid #1e1b4b; vertical-align: middle; }}
  tr:nth-child(even) td {{ background: #13131f; }}
  tr:hover td {{ background: #1a1a30; }}
  .progress-bar {{ background: #2d2a5e; border-radius: 8px; height: 18px; overflow: hidden; margin-top: 8px; }}
  .progress-fill {{ height: 100%; border-radius: 8px; transition: width 0.3s; }}
  .improvements {{ background: #1e1b4b; border-radius: 12px; padding: 24px; border: 1px solid #7c3aed; }}
  .improvements li {{ margin: 10px 0; padding-left: 8px; border-left: 3px solid #7c3aed; }}
  footer {{ text-align: center; padding: 24px; background: #0a0a14; color: #64748b; font-size: 0.85rem; border-top: 1px solid #1e1b4b; }}
</style>
</head>
<body>

<div class="header">
  <h1>🍔 <span>Cravify</span> QA Test Report</h1>
  <p>Comprehensive End-to-End Quality Assurance Report</p>
  <br>
  <span class="badge">🌐 Live: {BASE_URL}</span>
  <span class="badge">📅 {datetime.now().strftime('%d %B %Y, %H:%M')}</span>
  <span class="badge">🤖 Selenium WebDriver 4.x</span>
  <span class="badge">🐍 PyTest Framework</span>
</div>

<div class="summary-grid">
  <div class="stat-card">
    <div class="num" style="color:#a855f7">{total}</div>
    <div class="label">Total Tests</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#22c55e">{passed}</div>
    <div class="label">✅ Passed</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#ef4444">{failed}</div>
    <div class="label">❌ Failed</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#f97316">{warned}</div>
    <div class="label">⚠️ Warnings</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:{'#22c55e' if pass_rate >= 80 else '#ef4444'}">{pass_rate:.1f}%</div>
    <div class="label">Pass Rate</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:{pass_rate}%;background:{'#22c55e' if pass_rate >= 80 else '#ef4444'};"></div>
    </div>
  </div>
</div>

<div class="section">
  <h2>📋 Full Test Case Results</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>TC ID</th><th>Module</th><th>Description</th><th>Steps</th>
          <th>Expected</th><th>Actual Result</th><th>Status</th>
          <th>Severity</th><th>Timestamp</th><th>Screenshot</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>
</div>

<div class="section">
  <h2>🐛 Bug Report ({len(bugs)} Issues)</h2>
  {"<p style='color:#22c55e;font-weight:700;'>🎉 No bugs found! All tests passed.</p>" if not bugs else f'''
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Bug ID</th><th>TC ID</th><th>Module</th><th>Severity</th><th>Description</th><th>Actual (Bug)</th><th>Expected</th></tr>
      </thead>
      <tbody>{bug_rows}</tbody>
    </table>
  </div>'''}
</div>

<div class="section">
  <h2>💡 Improvement Suggestions</h2>
  <div class="improvements">
    <ul style="list-style:none;padding:0;">
      <li>🔐 <strong>Auth Tokens:</strong> Consider HTTP-only cookies over localStorage for JWT to prevent XSS token theft.</li>
      <li>🏎️ <strong>Performance:</strong> Implement lazy loading for restaurant card images to improve LCP (Largest Contentful Paint).</li>
      <li>♿ <strong>Accessibility:</strong> Add <code>aria-label</code> to all icon-only buttons and ensure all images have meaningful alt text.</li>
      <li>📱 <strong>Responsive:</strong> Test and fix horizontal overflow on mobile (375px) particularly in data tables and card grids.</li>
      <li>🛡️ <strong>Input Validation:</strong> Add server-side validation for all form inputs beyond frontend HTML validation.</li>
      <li>📊 <strong>Admin Dashboard:</strong> Add role-based API middleware to reject requests with wrong role tokens (not just redirect on frontend).</li>
      <li>🔄 <strong>Loading States:</strong> Add skeleton loaders during API fetch to improve perceived performance.</li>
      <li>💳 <strong>Payment:</strong> Replace mock payment with Razorpay sandbox integration for realistic E2E testing.</li>
      <li>📝 <strong>Error Messages:</strong> Standardize error messages across all modules (use a shared toast component).</li>
      <li>🧪 <strong>CI/CD:</strong> Integrate this Selenium suite into a GitHub Actions pipeline for automated regression on every PR.</li>
    </ul>
  </div>
</div>

<div class="section">
  <h2>📁 Screenshot Index</h2>
  <p style="color:#94a3b8;margin-bottom:12px;">All screenshots saved in: <code style="color:#a855f7">qa_automation/screenshots/</code></p>
  <table style="width:auto">
    <thead><tr><th>Folder</th><th>Module</th></tr></thead>
    <tbody>
      <tr><td>TC_Homepage/</td><td>Homepage & UI Smoke Tests (TC_01–TC_08)</td></tr>
      <tr><td>TC_Auth/</td><td>Authentication Tests (TC_09–TC_22)</td></tr>
      <tr><td>TC_Customer/</td><td>Customer Flow Tests (TC_23–TC_36)</td></tr>
      <tr><td>TC_Admin/</td><td>Admin Module Tests (TC_37–TC_44)</td></tr>
      <tr><td>TC_Vendor/</td><td>Vendor Module Tests (TC_45–TC_52)</td></tr>
      <tr><td>TC_Delivery/</td><td>Delivery Partner Tests (TC_53–TC_60)</td></tr>
      <tr><td>TC_Security/</td><td>Security & Injection Tests (TC_61–TC_70)</td></tr>
      <tr><td>TC_Responsive/</td><td>Responsive & Cross-Browser Tests (TC_71–TC_80)</td></tr>
      <tr><td>TC_UI/</td><td>Performance & UI Alignment Tests (TC_81–TC_90)</td></tr>
    </tbody>
  </table>
</div>

<footer>
  Generated by Cravify QA Automation Framework · Selenium WebDriver · PyTest<br>
  {datetime.now().strftime('%A, %d %B %Y at %H:%M:%S')} · ChromeDriver Automation
</footer>

</body>
</html>"""
    return html


def save_reports(results):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Save JSON
    json_path = os.path.join(REPORTS_DIR, f"cravify_test_report_{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total": len(results),
            "passed": sum(1 for r in results if r["status"] == "PASS"),
            "failed": sum(1 for r in results if r["status"] == "FAIL"),
            "warned": sum(1 for r in results if r["status"] == "WARN"),
            "results": results
        }, f, indent=2)
    print(f"\n✅ JSON report: {json_path}")

    # Save HTML
    html_path = os.path.join(REPORTS_DIR, f"cravify_test_report_{timestamp}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(generate_html_report(results))
    print(f"✅ HTML report: {html_path}")

    return html_path, json_path


if __name__ == "__main__":
    # This runs standalone after pytest to generate final report from JSON
    # In normal usage, run via conftest session fixture
    print("Report generator ready. Run via pytest conftest or directly after tests.")
