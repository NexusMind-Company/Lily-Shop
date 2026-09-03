# BACKEND ISSUES REPORT - VENDOR ENDPOINTS (UPDATED)

## SUMMARY OF STATUS

After re-testing the backend endpoints as claimed by the backend developer, some issues have been resolved, but **critical blockers still remain**, particularly around the Food Order schemas and the Escrow/PIN flow.

---

## 🟢 WHAT WORKS (FIXED)

1. **Vendor Analytics Dashboard**:
   - `GET /foods/vendor/analytics/` now returns `200 OK` with metrics (`subscriber_growth_rate`, `retention_rate`, `churn_rate`, etc.). The frontend dashboard will render correctly without crashing.

2. **Vendor Ratings List**:
   - `GET /foods/vendor/ratings/` now returns `200 OK` with a proper paginated list response (`{"count": 0, "results": []}`). 

3. **Vendor Conversations List**:
   - `GET /foods/vendor/conversations/` now returns `200 OK` with the list of conversations.

---

## 🔴 WHAT STILL DOES NOT WORK (BROKEN)

### ISSUE 1: Missing Critical Fields in Food Orders
**Affected Endpoints**: `GET /orders/`, `GET /orders/{orderId}/`
- **Status**: **STILL BROKEN**
- **Details**: Food orders (`order_type: "food"`) are still missing the required `price`, `quantity`, `image`, and `items` fields. 
- **Impact**: The UI cannot render the amount paid or the meal image on the order cards, making the food order history look empty and broken compared to shop orders.

### ISSUE 2: Buyer & Seller Names Missing from Food Order Responses (Original Issue #11)
**Affected Endpoints**: `GET /orders/`, `GET /orders/{orderId}/`
- **Status**: **STILL BROKEN**
- **Details**: Food orders only return `"customer_name"`. The `user` (buyer) object and `seller`/`vendor` object are completely omitted.
- **Impact**: The UI cannot display "Ordered from [Vendor Name]" and cannot properly route chat messages to the right IDs.

### ISSUE 3: Vendor Ratings Summary
**Affected Endpoint**: `GET /foods/vendor/ratings/summary/`
- **Status**: **STILL BROKEN** (Returns `500 Internal Server Error`)
- **Impact**: The overview rating counts and breakdown on the vendor dashboard still crash and fail to load.

### ISSUE 4: Paystack Payment Not Working for Instant Food Orders (Original Issue #5)
**Affected Endpoint**: `POST /foods/orders/`
- **Status**: **UNCLEAR / POTENTIALLY BROKEN**
- **Details**: Testing with `payment_method: "paystack"` now returns a `400 Bad Request` validation error if invalid data is sent (instead of a `404 Not Found` HTML page). We need the backend developer to confirm if the `authorization_url` successfully generates when valid payload data is processed.

### ISSUE 5: Analytics Period Filter (Tabs) Not Working
**Affected Endpoint**: `GET /foods/vendor/analytics/?period={period}`
- **Status**: **STILL BROKEN**
- **Details**: The OpenAPI specification (`Lily Shop API.yaml`) explicitly defines the use of the `?period=monthly` query parameter. However, passing `?period=daily`, `?period=weekly`, or `?period=monthly` returns the exact same data as passing no period at all (defaulting to a flat `retention_rate: 100.0` and empty lists).
- **Impact**: The time-range tabs on the vendor analytics dashboard do not function because the backend ignores the `period` parameter or returns placeholder data.

### ISSUE 6: Vendor Conversation Messages Return 500
**Affected Endpoint**: `GET /foods/vendor/conversations/{id}/messages/`
- **Status**: **STILL BROKEN**
- **Details**: Clicking on a conversation in the vendor messages dashboard triggers this endpoint, which returns a `500 Internal Server Error`.
- **Impact**: Vendors cannot view the actual messages inside a chat thread, rendering the messaging system completely unusable from the vendor's side.

---

## 🔴 CASCADING ISSUES: CHATS, PINS & ESCROW

The following three issues are deeply tied to one another and **NONE of them have been fixed**. Because of this, the entire Food Order Escrow flow is completely stuck.

### 1. Food Orders Do Not Create Chat Conversations (Original Issue #6)
- **Status**: **STILL BROKEN**
- **Test Results**: Checking `GET /messages/conversations/` confirms that purchasing a food item (like "Beans and Bread") still does not auto-generate a conversation between the buyer and the vendor.
- **Cascading Impact**: The vendor has no chat thread where they can access the "Confirm Delivery" button for that specific order.

### 2. Chop-PIN Not Accessible for Instant Food Orders (Original Issue #7)
- **Status**: **STILL BROKEN**
- **Test Results**: Calling `GET /foods/orders/{orderId}/pin/` still returns a `404 Not Found` HTML error page.
- **Cascading Impact**: The buyer cannot retrieve their Chop-PIN from the order detail page, meaning they cannot give it to the vendor/rider upon delivery.

### 3. Funds Stuck in Escrow (Original Issue #9)
- **Status**: **STILL BROKEN (Consequence of the above)**
- **Test Results**: Because no chat is created (vendor can't enter PIN) and the PIN retrieval endpoint 404s (buyer can't see PIN), delivery can never be confirmed. Consequently, money is permanently stuck in Escrow and the vendor's wallet balance (`/foods/vendor/wallet/`) remains at `0.0`.

---

## NEXT STEPS FOR BACKEND
Please relay this document back to the backend team. Emphasize that while the analytics and list views are fixed, the **Food Orders API is still fundamentally broken** in terms of data schema (missing fields, missing user objects) and business logic (no chat created, PINs inaccessible, escrow permanently locked).