/**
 * Vendor Dashboard API Service
 * All new endpoints for the expanded Vendor Dashboard.
 * Base URL: http://187.124.115.195
 * Auth: Bearer token via Authorization header (handled by axios interceptor)
 */

import { api } from "./api";
import * as apiService from "./api";

// ─────────────────────────────────────────────
// 1. DASHBOARD OVERVIEW
// ─────────────────────────────────────────────

/**
 * GET /vendor/dashboard/overview/
 * Returns key metrics for the vendor dashboard overview.
 * Response: { today_orders, meals_to_prepare, active_subscriptions,
 *             total_earnings, weekly_revenue, new_subscribers_this_week,
 *             cancelled_subscriptions, net_growth }
 */
export const fetchVendorDashboardOverview = apiService.fetchVendorDashboardOverview;

/**
 * GET /vendor/dashboard/subscriber-growth/?period=weekly
 * Returns subscriber growth data (new vs lost per day/week).
 * Query params: period (weekly | monthly)
 * Response: { labels: [...], new_subscribers: [...], lost_subscribers: [...] }
 */
export const fetchSubscriberGrowth = async (period = "weekly") => {
  const response = await api.get("/foods/vendor/dashboard/subscriber-growth/", {
    params: { period },
  });
  return response.data;
};

/**
 * GET /vendor/dashboard/recent-activity/
 * Returns recent customer activity (subscriptions, cancellations, renewals).
 * Response: [{ id, customer_name, action, meal_plan, timestamp }]
 */
export const fetchRecentActivity = async () => {
  const response = await api.get("/foods/vendor/dashboard/recent-activity/");
  return response.data;
};

// ─────────────────────────────────────────────
// 2. ORDER MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /vendor/orders/
 * Returns paginated list of all subscription orders for this vendor.
 * Query params: page, page_size, date (YYYY-MM-DD), status, meal_plan_id
 * Response: { count, next, previous, results: [order...] }
 * Order shape: { id, customer_name, phone, delivery_address, delivery_time,
 *                meal_plan, status, created_at }
 */
export const fetchVendorOrders = apiService.fetchVendorOrders;

/**
 * PATCH /vendor/orders/{orderId}/status/
 * Updates the status of a specific order.
 * Body: { status: "preparing" | "ready" | "out_for_delivery" | "delivered" }
 * Response: updated order object
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/foods/vendor/orders/${orderId}/status/`, {
    status,
  });
  return response.data;
};

/**
 * GET /vendor/orders/daily-prep-list/
 * Returns today's meal preparation list (all meals to cook today).
 * Query params: date (YYYY-MM-DD, defaults to today)
 * Response: [{ meal_name, quantity, meal_plan, customer_count }]
 */
export const fetchDailyPrepList = async (date = null) => {
  const params = date ? { date } : {};
  const response = await api.get("/foods/vendor/orders/daily-prep-list/", {
    params,
  });
  return response.data;
};

// ─────────────────────────────────────────────
// 3. SUBSCRIPTION MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /subscriptions/vendor/
 * Returns all subscriptions for this vendor with filtering.
 * Query params: page, page_size, status (active|expired|pending), plan_type (weekly|monthly)
 * Response: { count, next, previous, results: [subscription...] }
 * Subscription shape: { id, customer_name, meal_preferences, plan_type,
 *                       start_date, end_date, status, duration_days }
 */
export const fetchVendorSubscriptions = (params = {}) =>
  apiService.api.get("/foods/subscriptions/vendor/", { params }).then((r) => r.data);

// ─────────────────────────────────────────────
// SUBSCRIPTION REQUESTS - Backend endpoints not implemented
// ─────────────────────────────────────────────

/**
 * GET /vendor/subscriptions/requests/
 * Returns pending subscription requests awaiting vendor acceptance.
 * Response: [{ id, customer_name, requested_plan, requested_at, meal_preferences }]
 *
 * NOTE: Backend endpoint not implemented yet
 */
// export const fetchSubscriptionRequests = async () => {
//   const response = await api.get("/foods/vendor/requests/");
//   return response.data;
// };

/**
 * POST /vendor/subscriptions/requests/{requestId}/accept/
 * Accepts a subscription request.
 * Response: { success: true, subscription_id }
 *
 * NOTE: Backend endpoint not implemented yet
 */
// export const acceptSubscriptionRequest = async (requestId) => {
//   const response = await api.post(
//     `/foods/vendor/subscriptions/requests/${requestId}/accept/`
//   );
//   return response.data;
// };

/**
 * POST /vendor/subscriptions/requests/{requestId}/decline/
 * Declines a subscription request.
 * Body: { reason? }
 * Response: { success: true }
 *
 * NOTE: Backend endpoint not implemented yet
 */
// export const declineSubscriptionRequest = async (requestId, reason = "") => {
//   const response = await api.post(
//     `/foods/vendor/subscriptions/requests/${requestId}/decline/`,
//     { reason }
//   );
//   return response.data;
// };

// ─────────────────────────────────────────────
// 4. MONTHLY SUBSCRIPTION PLAN
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// MONTHLY SUBSCRIPTION PLAN - Backend endpoints not implemented
// ─────────────────────────────────────────────

/**
 * POST /vendor/plans/monthly/enable/
 * Enables monthly subscription plans for this vendor.
 * Body: { price, description?, max_subscribers? }
 * Response: { success: true, plan_id }
 *
 * NOTE: Backend endpoint not implemented yet
 */
// export const enableMonthlyPlan = async (planData) => {
//   const response = await api.post("/foods/vendor/plans/monthly/enable/", planData);
//   return response.data;
// };

/**
 * PATCH /vendor/plans/monthly/{planId}/
 * Updates a monthly subscription plan.
 * Body: { price?, description?, max_subscribers?, is_active? }
 * Response: updated plan object
 *
 * NOTE: Backend endpoint not implemented yet
 */
// export const updateMonthlyPlan = async (planId, planData) => {
//   const response = await api.patch(`/foods/vendor/plans/monthly/${planId}/`, planData);
//   return response.data;
// };

// ─────────────────────────────────────────────
// 5. MENU MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /vendor/menu/
 * Returns all meals for this vendor.
 * Response: [{ id, name, price, size_category, image_url, is_available, created_at }]
 */
export const fetchVendorMenu = async () => {
  const response = await api.get("/foods/vendor/menu/");
  return response.data;
};

/**
 * POST /vendor/menu/
 * Adds a new meal to the vendor's menu.
 * Body (multipart/form-data): name, price,
 *                              description?, image (file), video_url?, calories?, protein?, carbs?, fat?, ingredients?, allergens?, dietary_tags?, preparation_time?, serving_size?, media? (file)
 * Response: created meal object
 */
export const addMeal = async (mealData) => {
  const formData = new FormData();
  formData.append("name", mealData.name);
  formData.append("price", mealData.price.toString());
  if (mealData.description)
    formData.append("description", mealData.description);
  if (mealData.image instanceof File) formData.append("image", mealData.image);
  if (mealData.video_url) formData.append("video_url", mealData.video_url);
  if (mealData.calories) formData.append("calories", mealData.calories);
  if (mealData.protein) formData.append("protein", mealData.protein);
  if (mealData.carbs) formData.append("carbs", mealData.carbs);
  if (mealData.fat) formData.append("fat", mealData.fat);
  if (mealData.ingredients)
    formData.append("ingredients", JSON.stringify(mealData.ingredients));
  if (mealData.allergens)
    formData.append("allergens", JSON.stringify(mealData.allergens));
  if (mealData.dietary_tags)
    formData.append("dietary_tags", JSON.stringify(mealData.dietary_tags));
  if (mealData.preparation_time)
    formData.append("preparation_time", mealData.preparation_time);
  if (mealData.serving_size)
    formData.append("serving_size", mealData.serving_size);
  if (mealData.media) {
    if (Array.isArray(mealData.media)) {
      mealData.media.forEach((file) => {
        formData.append("media", file);
      });
    } else if (mealData.media instanceof File) {
      formData.append("media", mealData.media);
    }
  }

  const response = await api.post("/foods/vendor/menu/", formData);
  return response.data;
};

/**
 * PATCH /vendor/menu/{mealId}/
 * Updates an existing meal.
 * Body (multipart/form-data): name?, price?,
 *                              description?, image?, video_url?, calories?, protein?, carbs?, fat?, ingredients?, allergens?, dietary_tags?, preparation_time?, serving_size?, media? (file)
 * Response: updated meal object
 */
export const updateMeal = async (mealId, mealData) => {
  const formData = new FormData();
  if (mealData.name) formData.append("name", mealData.name);
  if (mealData.price !== undefined)
    formData.append("price", mealData.price.toString());
  if (mealData.description !== undefined)
    formData.append("description", mealData.description);
  if (mealData.image instanceof File) formData.append("image", mealData.image);
  if (mealData.video_url) formData.append("video_url", mealData.video_url);
  if (mealData.calories) formData.append("calories", mealData.calories);
  if (mealData.protein) formData.append("protein", mealData.protein);
  if (mealData.carbs) formData.append("carbs", mealData.carbs);
  if (mealData.fat) formData.append("fat", mealData.fat);
  if (mealData.ingredients)
    formData.append("ingredients", JSON.stringify(mealData.ingredients));
  if (mealData.allergens)
    formData.append("allergens", JSON.stringify(mealData.allergens));
  if (mealData.dietary_tags)
    formData.append("dietary_tags", JSON.stringify(mealData.dietary_tags));
  if (mealData.preparation_time)
    formData.append("preparation_time", mealData.preparation_time);
  if (mealData.serving_size)
    formData.append("serving_size", mealData.serving_size);
  if (mealData.media) {
    if (Array.isArray(mealData.media)) {
      mealData.media.forEach((file) => {
        formData.append("media", file);
      });
    } else if (mealData.media instanceof File) {
      formData.append("media", mealData.media);
    }
  }

  const response = await api.patch(`/foods/vendor/menu/${mealId}/`, formData);
  return response.data;
};

/**
 * DELETE /vendor/menu/{mealId}/
 * Removes a meal from the vendor's menu.
 * Response: 204 No Content
 */
export const deleteMealItem = async (mealId) => {
  const response = await api.delete(`/foods/vendor/menu/${mealId}/`);
  return response.data;
};

// ─────────────────────────────────────────────
// 6. AVAILABILITY MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /vendor/availability/
 * Returns vendor's current availability settings.
 * Response: { working_days: [...], delivery_times: [...],
 *             max_meals_per_day, is_sold_out }
 */
export const fetchAvailability = async () => {
  const response = await api.get("/foods/vendor/availability/");
  return response.data;
};

/**
 * PUT /vendor/availability/
 * Updates vendor's availability settings.
 * Body: { working_days: ["monday","tuesday",...], delivery_times: ["12:00","18:00"],
 *         max_meals_per_day: 50 }
 * Response: updated availability object
 */
export const updateAvailability = async (availabilityData) => {
  const response = await api.put(
    "/foods/vendor/availability/",
    availabilityData,
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 7. CUT-OFF TIME MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /vendor/cutoff-settings/
 * Returns vendor's order cut-off time settings.
 * Response: { cutoff_day, cutoff_time, delivery_day, delivery_window_start,
 *             delivery_window_end, is_enabled }
 */
export const fetchCutoffSettings = async () => {
  const response = await api.get("/foods/vendor/cutoff-settings/");
  return response.data;
};

/**
 * PUT /vendor/cutoff-settings/
 * Updates vendor's order cut-off time settings.
 * Body: { cutoff_day: "saturday", cutoff_time: "12:00",
 *         delivery_day: "monday", delivery_window_start: "10:00",
 *         delivery_window_end: "18:00", is_enabled: true }
 * Response: updated settings object
 */
export const updateCutoffSettings = async (settingsData) => {
  const response = await api.put(
    "/foods/vendor/cutoff-settings/",
    settingsData,
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 8. VACATION / PAUSE SHOP
// ─────────────────────────────────────────────

/**
 * GET /vendor/shop-status/
 * Returns current shop pause/vacation status.
 * Response: { is_paused, paused_at, pause_reason, resume_date?,
 *             pause_existing_subscriptions }
 */
export const fetchShopStatus = async () => {
  const response = await api.get("/foods/vendor/shop-status/");
  return response.data;
};

/**
 * POST /vendor/shop-status/pause/
 * Pauses the vendor's shop (vacation mode).
 * Body: { reason, pause_existing_subscriptions: boolean, resume_date? }
 * Response: { success: true, paused_at }
 */
export const pauseShop = async (pauseData) => {
  const response = await api.post(
    "/foods/vendor/shop-status/pause/",
    pauseData,
  );
  return response.data;
};

/**
 * POST /vendor/shop-status/resume/
 * Resumes the vendor's shop from pause.
 * Response: { success: true, resumed_at }
 */
export const resumeShop = async () => {
  const response = await api.post("/foods/vendor/shop-status/resume/");
  return response.data;
};

// ─────────────────────────────────────────────
// 9. EARNINGS & PAYMENTS
// ─────────────────────────────────────────────

/**
 * GET /vendor/earnings/summary/
 * Returns earnings summary across different time periods.
 * Response: { total_earnings, platform_fee, net_payout,
 *             daily_earnings, weekly_earnings, monthly_earnings }
 */
export const fetchEarningsSummary = apiService.fetchEarningsSummary;

/**
 * GET /vendor/earnings/history/
 * Returns paginated payment history.
 * Query params: page, page_size, period (daily|weekly|monthly), start_date, end_date
 * Response: { count, next, previous, results: [{ id, customer_name, amount,
 *             platform_fee, net, payment_date, subscription_plan, status }] }
 */
export const fetchEarningsHistory = apiService.fetchEarningsHistory;

/**
 * GET /vendor/earnings/chart/
 * Returns earnings chart data.
 * Query params: period (daily|weekly|monthly)
 * Response: { labels: [...], earnings: [...] }
 */
export const fetchEarningsChart = apiService.fetchEarningsChart;

// ─────────────────────────────────────────────
// 12. VENDOR WALLET
// ─────────────────────────────────────────────

/**
 * GET /vendor/wallet/
 * Returns vendor wallet balance.
 * Response: { id, vendor, balance_kobo, balance_naira, updated_at }
 */
export const fetchVendorWallet = apiService.fetchVendorWallet;

/**
 * GET /vendor/withdrawals/
 * Returns vendor withdrawal requests.
 * Query params: page, page_size, status
 * Response: { count, next, previous, results: [withdrawal...] }
 */
export const fetchVendorWithdrawals = apiService.fetchVendorWithdrawals;

/**
 * POST /vendor/withdrawals/
 * Creates a new withdrawal request.
 * Body: { amount_kobo, bank_name, account_number, account_name }
 * Response: created withdrawal object
 */
export const createVendorWithdrawal = apiService.createVendorWithdrawal;

/**
 * Alias for createVendorWithdrawal - used by VendorEarningsPage
 * Initiates an earnings payout/withdrawal
 */
export const initiateEarningsPayout = createVendorWithdrawal;

/**
 * GET /vendor/withdrawals/{id}/
 * Returns withdrawal details.
 * Response: withdrawal object
 */
export const fetchWithdrawalDetails = (withdrawalId) =>
  apiService.api.get(`/foods/vendor/withdrawals/${withdrawalId}/`).then((r) => r.data);

// ─────────────────────────────────────────────
// 10. ADD-ON UPSELL
// ─────────────────────────────────────────────

/**
 * GET /vendor/addons/
 * Returns all add-ons for this vendor.
 * Response: [{ id, name, price, image_url?, is_available }]
 */
export const fetchAddons = async () => {
  const response = await api.get("/foods/vendor/addons/");
  return response.data;
};

/**
 * POST /vendor/addons/
 * Creates a new add-on item.
 * Body (multipart/form-data): name, price, description?, image? (file)
 * Response: created addon object
 */
export const createAddon = async (addonData) => {
  const formData = new FormData();
  formData.append("name", addonData.name);
  formData.append("price", addonData.price.toString());
  if (addonData.description)
    formData.append("description", addonData.description);
  if (addonData.image instanceof File)
    formData.append("image", addonData.image);

  const response = await api.post("/foods/vendor/addons/", formData);
  return response.data;
};

/**
 * PATCH /vendor/addons/{addonId}/
 * Updates an existing add-on.
 * Body: { name?, price?, description?, is_available? }
 * Response: updated addon object
 */
export const updateAddon = async (addonId, addonData) => {
  const response = await api.patch(
    `/foods/vendor/addons/${addonId}/`,
    addonData,
  );
  return response.data;
};

/**
 * DELETE /vendor/addons/{addonId}/
 * Deletes an add-on.
 * Response: 204 No Content
 */
export const deleteAddon = async (addonId) => {
  const response = await api.delete(`/foods/vendor/addons/${addonId}/`);
  return response.data;
};

// ─────────────────────────────────────────────
// 11. CUSTOMER COMMUNICATION & MESSAGING
// ─────────────────────────────────────────────

/**
 * GET /vendor/conversations/
 * Returns all customer conversations for this vendor.
 * Response: [{ id, customer_name, customer_avatar, last_message,
 *             last_message_time, unread_count }]
 */
export const fetchVendorConversations = apiService.fetchVendorConversations;

/**
 * GET /vendor/conversations/{conversationId}/messages/
 * Returns messages in a specific conversation.
 * Query params: page, page_size
 * Response: { count, next, previous, results: [{ id, sender, text, timestamp, is_read }] }
 */
export const fetchConversationMessages = async (
  conversationId,
  params = {},
) => {
  const response = await api.get(
    `/foods/vendor/conversations/${conversationId}/messages/`,
    { params },
  );
  console.log(`API response for vendor conversation ${conversationId} messages:`, response.data);
  return response.data;
};

/**
 * POST /vendor/conversations/{conversationId}/messages/
 * Sends a message to a customer.
 * Body: { text }
 * Response: created message object
 */
export const sendMessageToCustomer = async (conversationId, text) => {
  const response = await api.post(
    `/foods/vendor/conversations/${conversationId}/messages/`,
    { text },
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 12. BROADCAST MESSAGING
// ─────────────────────────────────────────────

/**
 * POST /vendor/broadcast/
 * Sends a broadcast message to all active subscribers.
 * Body: { message, title? }
 * Response: { success: true, recipients_count, sent_at }
 */
export const sendBroadcastMessage = async (broadcastData) => {
  const response = await api.post("/foods/vendor/broadcast/", broadcastData);
  return response.data;
};

/**
 * GET /vendor/broadcast/history/
 * Returns history of past broadcast messages.
 * Response: [{ id, title, message, recipients_count, sent_at }]
 */
export const fetchBroadcastHistory = async () => {
  const response = await api.get("/foods/vendor/broadcast/history/");
  // Handle both plain array and paginated { results: [...] } responses
  const data = response.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
};

// ─────────────────────────────────────────────
// 13. RATINGS & FEEDBACK
// ─────────────────────────────────────────────

/**
 * GET /vendor/ratings/
 * Returns meal ratings and customer feedback for this vendor.
 * Query params: page, page_size, meal_id
 * Response: { count, next, previous, results: [{ id, meal_name, rating,
 *             review, customer_name, created_at }] }
 */
export const fetchMealRatings = async (params = {}) => {
  const response = await api.get("/foods/vendor/ratings/", { params });
  return response.data;
};

/**
 * GET /vendor/ratings/summary/
 * Returns a summary of all meal ratings.
 * Response: [{ meal_id, meal_name, average_rating, total_reviews,
 *             common_removal (e.g. "onions 80%") }]
 */
export const fetchRatingsSummary = async () => {
  const response = await api.get("/foods/vendor/ratings/summary/");
  return response.data;
};

// ─────────────────────────────────────────────
// 14. CHURN TRACKING
// ─────────────────────────────────────────────

/**
 * GET /vendor/churn/
 * Returns customers who did not renew their subscription.
 * Query params: page, page_size, period (this_week|this_month|all_time)
 * Response: { count, next, previous, results: [{ id, customer_name,
 *             customer_avatar, last_plan, cancelled_at, days_since_cancel }] }
 */
export const fetchChurnedCustomers = async (params = {}) => {
  const response = await api.get("/foods/vendor/churn/", { params });
  return response.data;
};

/**
 * POST /vendor/churn/{customerId}/offer-discount/
 * Sends a win-back discount offer to a churned customer.
 * Body: { discount_percentage, message?, expiry_days }
 * Response: { success: true, offer_id }
 */
export const sendWinbackOffer = async (customerId, offerData) => {
  const response = await api.post(
    `/foods/vendor/churn/${customerId}/offer-discount/`,
    offerData,
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 15. ANALYTICS
// ─────────────────────────────────────────────

/**
 * GET /vendor/analytics/
 * Returns comprehensive vendor analytics.
 * Query params: period (weekly|monthly|quarterly)
 * Response: { subscriber_growth_rate, retention_rate, churn_rate,
 *             meal_popularity: [{ meal_name, order_count, percentage }],
 *             ingredient_insights: [{ ingredient, removal_rate }],
 *             top_performing_plans: [...] }
 */
export const fetchVendorAnalytics = apiService.fetchVendorAnalytics;

// ─────────────────────────────────────────────
// 16. PACKAGE PRICING
// ─────────────────────────────────────────────

/**
 * GET /vendor/packages/
 * Returns all meal packages defined by this vendor.
 * Response: [{ id, name, tier, base_price, description, meals_per_cycle,
 *             includes_delivery, extras: [{ name, price }] }]
 */
export const fetchVendorPackages = apiService.fetchVendorPackages;

/**
 * POST /vendor/packages/
 * Creates a new meal package.
 * Body: { name, tier, base_price, description?, meals_per_cycle,
 *         includes_delivery, extras: [{ name, price }] }
 */
export const createVendorPackage = apiService.createVendorPackage;

/**
 * PATCH /vendor/packages/{packageId}/
 * Updates an existing package.
 */
export const updateVendorPackage = apiService.partialUpdateVendorPackage;

/**
 * DELETE /vendor/packages/{packageId}/
 */
export const deleteVendorPackage = apiService.deleteVendorPackage;
