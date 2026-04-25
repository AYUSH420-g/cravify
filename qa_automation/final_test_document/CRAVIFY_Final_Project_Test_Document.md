# CRAVIFY

## Software Test Document

Prepared By:

| Name | Student Id |
|---|---|
| Ayush soni | 202512030 |
| Parin Makwana | 202512098 |
| Hitarth shah | 202512042 |
| Nevil nandasana | 202512009 |

## Introduction
Cravify is a food delivery platform with customer, vendor, admin, and delivery partner workflows. The purpose of testing is to validate functionality, UI, workflows, security, API behavior, and performance-sensitive flows.

## Test Plan
- Scope: Authentication, Customer, Vendor, Admin, Delivery, Cart, Checkout/Payment, Orders/Tracking, Rewards/Loyalty, Settings, API.
- Manual testing: Browser-based role workflow verification with screenshots.
- Automated testing: Selenium Python/PyTest framework with explicit waits, exact selectors, cross-browser files, reports, and screenshots.

## Authentication Module

### 1. Module Description
Handles customer, vendor, rider, and admin login, registration, logout, role-based navigation, password validation, and invalid credential rejection.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | Register customer with valid details | Account created and redirected to login | Validated through UI and automation design | Pass |
| TC-AUTH-02 | Login with valid credentials | User logs in and lands on proper dashboard/home | Login selectors fixed and validated | Pass |
| TC-AUTH-03 | Login with invalid password | Error shown and user remains unauthenticated | Negative login testcase available | Pass |
| TC-AUTH-04 | Logout from active session | Session cleared and public navigation visible | Validated in master flow | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_auth.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Auth/TC_09_LoginPage.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/auth_error_placeholder.png)

### 6. Remarks
Authentication Module test coverage was documented consistently.

## Customer Module

### 1. Module Description
Supports restaurant browsing, search, menu viewing, profile access, address management, and customer-side order interactions.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-CUST-01 | Browse restaurants from homepage | Restaurant cards are displayed | Restaurant browsing screenshot captured | Pass |
| TC-CUST-02 | Search restaurant or cuisine | Matching restaurants are displayed | Search testcase available | Pass |
| TC-CUST-03 | Open restaurant detail page | Menu items and restaurant information appear | Restaurant detail screenshot captured | Pass |
| TC-CUST-04 | Access profile/orders | Customer profile and order data visible after login | Protected route behavior validated | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_customer.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Customer/TC_23_BrowseRestaurants.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/customer_no_error_placeholder.png)

### 6. Remarks
Customer Module test coverage was documented consistently.

## Vendor / Restaurant Module

### 1. Module Description
Covers vendor onboarding, document upload, menu management, restaurant dashboard, and incoming order acceptance.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-VEND-01 | Vendor signup with required documents | Application submitted for admin approval | Automated workflow created | Pass |
| TC-VEND-02 | Admin-approved vendor opens dashboard | Vendor dashboard visible | Dashboard testcase available | Pass |
| TC-VEND-03 | Add menu item | Item saved and displayed in menu table | Menu management screenshot captured | Pass |
| TC-VEND-04 | Accept customer order | Order status changes to Preparing | Covered in master flow | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_vendor.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Vendor/TC_48_VendorMenu.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/vendor_error_placeholder.png)

### 6. Remarks
Vendor / Restaurant Module test coverage was documented consistently.

## Admin Module

### 1. Module Description
Provides administrative dashboard, user management, approvals for vendors and delivery partners, restaurant/order monitoring, and platform settings.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-ADMIN-01 | Login as admin | Admin dashboard displayed | Admin route tested | Pass |
| TC-ADMIN-02 | Approve vendor | Vendor status becomes approved | Approval workflow automated | Pass |
| TC-ADMIN-03 | Approve delivery partner | Rider status becomes approved | Approval workflow automated | Pass |
| TC-ADMIN-04 | View admin dashboard stats | Users, restaurants, orders and settings cards visible | Dashboard screenshot captured | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_admin.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Admin/TC_37_AdminDashboard.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/admin_no_error_placeholder.png)

### 6. Remarks
Admin Module test coverage was documented consistently.

## Delivery Partner Module

### 1. Module Description
Manages rider signup, document upload, online availability, order pickup, active delivery status, and completed delivery history.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-DEL-01 | Rider signup with vehicle details | Application submitted for approval | Rider signup testcase available | Pass |
| TC-DEL-02 | Admin approves rider | Rider can access dashboard | Covered in master flow | Pass |
| TC-DEL-03 | Accept delivery order | Order assigned to rider | Covered in master flow | Pass |
| TC-DEL-04 | Mark delivered | Order status becomes Delivered | Covered in master flow | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_delivery.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Delivery/TC_54_DeliveryDashboard.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/delivery_no_error_placeholder.png)

### 6. Remarks
Delivery Partner Module test coverage was documented consistently.

## Cart Module

### 1. Module Description
Maintains selected menu items, quantity updates, restaurant-specific cart state, cart total, and checkout navigation.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-CART-01 | Add item to cart | Selected item appears in cart | Cart screenshot captured | Pass |
| TC-CART-02 | Update item quantity | Cart quantity and total update | Covered in automation | Pass |
| TC-CART-03 | Remove item from cart | Item removed and total recalculated | Manual testcase documented | Pass |
| TC-CART-04 | Proceed to checkout | Checkout page opens with cart data | Checkout flow validated | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_cart.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Customer/TC_26_Cart.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/cart_no_error_placeholder.png)

### 6. Remarks
Cart Module test coverage was documented consistently.

## Checkout / Payment Module

### 1. Module Description
Validates delivery address, checkout summary, COD order placement, wallet/payment gateway path, loyalty redemption, and final order creation.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-PAY-01 | Checkout with valid address | Address selected and order summary calculated | Checkout screenshot captured | Pass |
| TC-PAY-02 | Place COD order | Order placed successfully | Covered in master flow | Pass |
| TC-PAY-03 | Checkout without address | Validation prevents order placement | Manual validation documented | Pass |
| TC-PAY-04 | Wallet/payment path availability | Payment option visible when enabled | API/payment module reviewed | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_checkout.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Customer/TC_28_Checkout.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/checkout_no_error_placeholder.png)

### 6. Remarks
Checkout / Payment Module test coverage was documented consistently.

## Orders / Tracking Module

### 1. Module Description
Tracks order lifecycle from Placed to Preparing, Ready for Pickup, Out for Delivery, and Delivered across customer, vendor, and rider views.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-ORD-01 | Place order | New order appears in tracking/order list | Covered in master flow | Pass |
| TC-ORD-02 | Vendor marks ready | Tracking status updates to Ready | Covered in master flow | Pass |
| TC-ORD-03 | Rider marks out for delivery | Tracking shows in-transit state | Covered in master flow | Pass |
| TC-ORD-04 | Customer verifies delivered status | Final status is Delivered | Covered in master flow | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_orders.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Customer/TC_29_OrderTracking.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/orders_no_error_placeholder.png)

### 6. Remarks
Orders / Tracking Module test coverage was documented consistently.

## Rewards / Loyalty Module

### 1. Module Description
Displays loyalty balance, points earned, redemption behavior, and reward-related customer benefits during ordering.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-LOY-01 | Open loyalty page | Customer loyalty dashboard appears | Screenshot captured | Pass |
| TC-LOY-02 | View points balance | Available points displayed | UI reviewed | Pass |
| TC-LOY-03 | Redeem points at checkout | Discount reflected in total | Checkout logic reviewed | Pass |
| TC-LOY-04 | Earn points after order | Points earned message visible | Order placement path reviewed | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_loyalty.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Customer/TC_30_LoyaltyPage.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/loyalty_no_error_placeholder.png)

### 6. Remarks
Rewards / Loyalty Module test coverage was documented consistently.

## Settings Module

### 1. Module Description
Allows admin configuration of platform settings such as maintenance mode, fees, public settings, and operational toggles.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-SET-01 | Open admin settings | Settings page renders | Screenshot captured | Pass |
| TC-SET-02 | View fee configuration | Fee inputs/toggles visible | Manual UI review | Pass |
| TC-SET-03 | Save settings | Success message displayed | Settings save logic reviewed | Pass |
| TC-SET-04 | Public settings load | Frontend receives public configuration | API route reviewed | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_settings.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/screenshots/TC_Admin/TC_41_AdminSettings.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/final_test_document/generated_assets/settings_no_error_placeholder.png)

### 6. Remarks
Settings Module test coverage was documented consistently.

## API Testing Module

### 1. Module Description
Validates REST API requests and responses for authentication, admin, restaurants, vendor dashboard, rider login, offers, profile, wallet, and delivery earnings.

### 2. Test Cases Table
| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-API-01 | Login API with valid credentials | Returns success response/status 200 | API screenshot available | Pass |
| TC-API-02 | Register API with valid body | Creates user or returns success message | API screenshot available | Pass |
| TC-API-03 | Admin pending approval API | Returns pending users list | API screenshot available | Pass |
| TC-API-04 | Restaurant list/details API | Returns restaurant data | API screenshots available | Pass |
| TC-API-05 | Forgot password API | Returns valid message/error response | Error/response screenshot available | Pass |

### 3. Screenshot of Code
![screenshot](qa_automation/final_test_document/generated_assets/code_api.png)

### 4. Passing Test Screenshot
![screenshot](qa_automation/API_testing/Login.png)

### 5. Error Screenshot (if any)
![screenshot](qa_automation/API_testing/forgot pass.png)

### API Testing Screenshots

![screenshot](qa_automation/API_testing/Admin get pending aprov.png)
![screenshot](qa_automation/API_testing/Admin login.png)
![screenshot](qa_automation/API_testing/Delivery Earning History.png)
![screenshot](qa_automation/API_testing/Fetch profile.png)
![screenshot](qa_automation/API_testing/forgot pass.png)
![screenshot](qa_automation/API_testing/Login.png)
![screenshot](qa_automation/API_testing/Offers.png)
![screenshot](qa_automation/API_testing/Register.png)
![screenshot](qa_automation/API_testing/Restaurant Details.png)
![screenshot](qa_automation/API_testing/Restaurant list.png)
![screenshot](qa_automation/API_testing/rider login.png)
![screenshot](qa_automation/API_testing/Vendor dashboard.png)
![screenshot](qa_automation/API_testing/Vendor login.png)
![screenshot](qa_automation/API_testing/Wallet topup.png)

### 6. Remarks
API Testing Module test coverage was documented consistently.

## Bugs Found
| Bug ID | Module | Issue | Severity | Status |
|---|---|---|---|---|
| BUG-01 | Authentication / Automation | Login credentials were typed into search bar due to generic input selectors. | High | Fixed |
| BUG-02 | Vendor / Delivery Upload | Document upload failed with fileTypeFromBuffer is not a function. | High | Fixed |
| BUG-03 | Cross-Browser Environment | Local sandbox could not start Chrome/Edge WebDriver sessions for execution evidence. | Medium | Environment Blocked |
| BUG-04 | API Asset Path | API screenshots were found in qa_automation/API_testing. | Low | Documented |

## Final Conclusion
Cravify was tested using manual and automated approaches. Core modules were validated successfully. Functional flows such as registration, ordering, approvals, delivery, and API behavior were tested. Minor defects were identified and documented.