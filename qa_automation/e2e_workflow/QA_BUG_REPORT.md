# Cravify E2E QA Bug Report

Generated: 2026-04-25

## Fixed

1. Login selectors were hardened in the production E2E framework.
   - Exact selectors now target `name="email"` and `name="password"`.
   - Signup/vendor/rider fields now target exact `name` attributes.
   - File uploads now target exact file input names such as `restaurantImage`, `fssaiCert`, `gstCert`, `menuCard`, `license`, `rc`, and `aadhar`.

2. Backend upload validation was fixed for the installed `file-type@16.5.4` API.
   - Replaced the unsupported `fileTypeFromBuffer` dynamic import.
   - Uses `FileType.fromBuffer(file.buffer)` from the CommonJS-compatible v16 API.

3. Vendor menu image upload now has a stable selector.
   - Added `name="image"` to the menu item image file input.

## Test Coverage Added

1. Customer account lifecycle: register, login, logout, login again, profile verification.
2. Vendor lifecycle: register, upload documents, admin approval, dashboard access, menu creation, customer visibility.
3. Customer ordering: restaurant search, item add-to-cart, quantity update attempt, checkout, address, payment, order placement.
4. Vendor order processing: accept order, verify preparing state, mark ready for pickup.
5. Delivery lifecycle: rider registration, document upload, admin approval, go online, accept, picked up, delivered.
6. Customer final verification: delivered status in profile/order history.
7. Cross-browser execution: Chrome, Firefox, Edge.
8. Responsive execution: 1920x1080, 1366x768, 768x1024, 430x932, 390x844.

## Residual Risks

1. Live-data tests depend on admin credentials and the deployed API being available.
2. Browser execution requires local Chrome, Firefox, and Edge drivers or Selenium Manager support.
3. Razorpay is avoided by choosing COD where available; payment gateway sandbox testing should be added separately.
4. Some UI actions still rely on visible button text because the app does not expose test IDs for all command buttons.

## Improvements Recommended

1. Add stable `data-testid` attributes for every workflow button and row action.
2. Add backend seed/reset APIs for QA data to make live E2E repeatable.
3. Add dedicated admin approval endpoints for test fixtures instead of UI-only approval.
4. Add CI matrix jobs for Chrome, Firefox, and Edge.
5. Store admin and test credentials in CI secrets, not source code.
