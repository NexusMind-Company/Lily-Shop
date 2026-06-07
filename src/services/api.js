import axios from "axios";

const API_BASE_URL = "https://lily-shops-8636e768f6f5.herokuapp.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem("auth_tokens");
    if (tokens) {
      const { access } = JSON.parse(tokens);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = localStorage.getItem("auth_tokens");
        if (tokens) {
          const { refresh } = JSON.parse(tokens);
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh,
          });
          const { access } = response.data;
          localStorage.setItem(
            "auth_tokens",
            JSON.stringify({ access, refresh }),
          );
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh failure (e.g., logout user)
        localStorage.removeItem("auth_tokens");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

/* ---------------- AUTH API ---------------- */
export const login = (credentials) => api.post("/token/", credentials);
export const register = (userData) => api.post("/users/register/", userData);
export const fetchProfile = () => api.get("/users/profile/");
export const updateProfile = (userData) =>
  api.patch("/users/profile/", userData);

/* ---------------- FEED API ---------------- */
export const fetchAllFeed = (params) => api.get("/feeds/all/", { params });
export const fetchNearbyVendors = (lat, lon) =>
  api.get("/foods/vendors/nearby/", { params: { lat, lon } });

/* ---------------- SHOP API ---------------- */
export const fetchShops = (params) => api.get("/shops/", { params });
export const fetchShopDetails = (id) => api.get(`/shops/${id}/`);
export const createShop = (shopData) => {
  const formData = new FormData();
  Object.keys(shopData).forEach((key) => {
    if (key === "banner_image" && shopData[key]) {
      formData.append(key, shopData[key]);
    } else {
      formData.append(key, shopData[key]);
    }
  });
  return api.post("/shops/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ---------------- PRODUCT API ---------------- */
export const fetchProducts = (params) =>
  api.get("/shops/products/", { params });
export const fetchProductDetails = (id) => api.get(`/shops/products/${id}/`);

/* ---------------- ORDER API ---------------- */
export const createOrder = (orderData) => api.post("/orders/", orderData);
export const fetchOrders = () => api.get("/orders/");
export const fetchOrderDetails = (id) => api.get(`/orders/${id}/`);

/* ---------------- WALLET API ---------------- */
export const fetchWalletBalance = () => api.get("/wallets/balance/");
export const fetchTransactions = () => api.get("/wallets/transactions/");
export const deposit = (amount) => api.post("/wallets/deposit/", { amount });
export const withdraw = (data) => api.post("/wallets/withdraw/", data);

/* ---------------- SEARCH API ---------------- */
export const searchShops = (params) => api.get("/shops/", { params });
export const searchProducts = (params) =>
  api.get("/shops/products/", { params });
export const searchContents = (params) => api.get("/feeds/all/", { params });
export const searchFoodVendors = (params) =>
  api.get("/foods/vendors/", { params });
export const searchMealPlans = (params) =>
  api.get("/foods/meal-plans/", { params });

/* ---------------- NOTIFICATION API ---------------- */
export const fetchNotifications = (params) =>
  api.get("/notifications/", { params });
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/`, { is_read: true });
export const markAllNotificationsRead = () =>
  api.post("/notifications/mark_all_read/");

/* ---------------- VENDOR API ---------------- */
const appendVendorMedia = (formData, vendorData) => {
  if (vendorData.banner_image instanceof File) {
    formData.append("banner_image", vendorData.banner_image);
  }

  if (vendorData.profile_image instanceof File) {
    formData.append("profile_image", vendorData.profile_image);
  } else if (
    typeof vendorData.profile_image === "string" &&
    vendorData.profile_image.startsWith("http")
  ) {
    formData.append("profile_image", vendorData.profile_image);
  }

  if (Array.isArray(vendorData.media)) {
    vendorData.media.forEach((file) => {
      if (file instanceof File) formData.append("media", file);
    });
  } else if (vendorData.media instanceof File) {
    formData.append("media", vendorData.media);
  }
};

export const createFoodVendor = async (vendorData) => {
  const formData = new FormData();

  if (vendorData.shop_name || vendorData.name) {
    formData.append("name", vendorData.shop_name || vendorData.name);
  }
  if (vendorData.description) {
    formData.append("description", vendorData.description);
  }
  // Bug fix from 0c643ec: create endpoint expects "street_address"
  if (vendorData.address || vendorData.street_address) {
    formData.append(
      "street_address",
      vendorData.address || vendorData.street_address,
    );
  }
  if (vendorData.category || vendorData.cuisine) {
    formData.append("cuisine", vendorData.category || vendorData.cuisine);
  }
  if (vendorData.state) {
    formData.append("state", vendorData.state);
  }
  if (vendorData.lga) {
    formData.append("lga", vendorData.lga);
  }
  if (vendorData.contact_email && vendorData.contact_email.trim()) {
    formData.append("contact_email", vendorData.contact_email.trim());
  }
  if (vendorData.contact_phone) {
    formData.append("contact_phone", vendorData.contact_phone.trim());
  }

  appendVendorMedia(formData, vendorData);

  const response = await api.post("/foods/food-vendors/", formData);

  return response.data;
};

export const updateFoodVendor = async (vendorData) => {
  const formData = new FormData();

  // Map vendor data fields to API schema correctly
  if (vendorData.shop_name || vendorData.name)
    formData.append("name", vendorData.shop_name || vendorData.name);
  if (vendorData.description)
    formData.append("description", vendorData.description);

  // Bug fix from 0c643ec: update serializer expects "address" instead of "street_address"
  if (vendorData.address || vendorData.street_address)
    formData.append("address", vendorData.address || vendorData.street_address);

  if (vendorData.category || vendorData.cuisine)
    formData.append("cuisine", vendorData.category || vendorData.cuisine);

  if (vendorData.state) {
    formData.append("state", vendorData.state);
  }
  if (vendorData.lga) {
    formData.append("lga", vendorData.lga);
  }

  // Bug fix from 0c643ec: ensuring contact_email is appended
  if (vendorData.contact_email && vendorData.contact_email.trim()) {
    formData.append("contact_email", vendorData.contact_email.trim());
  }

  if (vendorData.contact_phone) {
    formData.append("contact_phone", vendorData.contact_phone.trim());
  }

  // Handle new fields from the new payload schema
  if (vendorData.all_media_urls) {
    formData.append("all_media_urls", vendorData.all_media_urls);
  }

  appendVendorMedia(formData, vendorData);

  // Bug fix from 0c643ec: missing trailing slash caused 404 / redirect failure for PATCH requests
  const response = await api.patch(`/foods/food-vendors/me/`, formData);

  return response.data;
};

export const fetchVendorProfileFormData = async () => {
  const response = await api.get("/foods/vendors/profiles/form-data/", {
    params: { t: Date.now() },
  });
  return response.data;
};

export const fetchFoodVendor = async (vendorId) => {
  // Use list endpoint with filter since /foods/food-vendors/{id}/ returns 405
  const response = await api.get(`/foods/vendors/`, {
    params: { id: vendorId, t: Date.now() },
  });
  const results = response.data.results || response.data;
  return results.find((v) => v.id === vendorId) || results[0] || null;
};

export const fetchAllFoodVendors = async (params = {}) => {
  const response = await api.get("/foods/vendors/", { params });
  return response.data;
};

export const fetchStates = async () => {
  const response = await api.get("/locations/states/");
  return response.data;
};

export const fetchLgas = async (stateId) => {
  const response = await api.get("/locations/lgas/", {
    params: { state_id: stateId },
  });
  return response.data;
};

export const updateSubscriptionPlan = async (planId, planData) => {
  const formData = new FormData();

  // Basic fields
  if (planData.plan_name) formData.append("plan_name", planData.plan_name);
  if (planData.description)
    formData.append("description", planData.description);
  if (planData.address) formData.append("address", planData.address);
  if (planData.price !== undefined && planData.price !== null)
    formData.append("price", planData.price.toString());
  if (
    planData.meals_per_cycle !== undefined &&
    planData.meals_per_cycle !== null
  )
    formData.append("meals_per_cycle", planData.meals_per_cycle.toString());
  if (planData.frequency) formData.append("frequency", planData.frequency);
  if (planData.trial_days !== undefined && planData.trial_days !== null)
    formData.append("trial_days", planData.trial_days.toString());

  // Array fields
  if (Array.isArray(planData.service_days)) {
    formData.append("service_days", JSON.stringify(planData.service_days));
  }

  // Media files
  if (planData.media && Array.isArray(planData.media)) {
    planData.media.forEach((file) => {
      if (file instanceof File) formData.append("media", file);
    });
  }

  const response = await api.patch(`/foods/plans/${planId}/`, formData);
  return response.data;
};

export const deleteSubscriptionPlan = async (planId) => {
  const response = await api.delete(`/foods/plans/${planId}/`);
  return response.data;
};

export const createSubscriptionPlan = async (planData) => {
  const formData = new FormData();

  // Basic fields
  if (planData.plan_name) formData.append("plan_name", planData.plan_name);
  if (planData.description)
    formData.append("description", planData.description);
  if (planData.address) formData.append("address", planData.address);
  if (planData.price !== undefined && planData.price !== null)
    formData.append("price", planData.price.toString());
  if (
    planData.meals_per_cycle !== undefined &&
    planData.meals_per_cycle !== null
  )
    formData.append("meals_per_cycle", planData.meals_per_cycle.toString());
  if (planData.frequency) formData.append("frequency", planData.frequency);
  if (planData.trial_days !== undefined && planData.trial_days !== null)
    formData.append("trial_days", planData.trial_days.toString());

  // Array fields
  if (Array.isArray(planData.service_days)) {
    formData.append("service_days", JSON.stringify(planData.service_days));
  }

  // Media files
  if (planData.media && Array.isArray(planData.media)) {
    planData.media.forEach((file) => {
      if (file instanceof File) formData.append("media", file);
    });
  }

  const response = await api.post("/foods/plans/", formData);
  return response.data;
};

export const fetchSubscriptionPlans = async (vendorId) => {
  const response = await api.get("/foods/plans/", {
    params: { vendor_id: vendorId },
  });
  return response.data;
};

export const fetchSubscriptionPlanDetails = async (planId) => {
  const response = await api.get(`/foods/plans/${planId}/`);
  return response.data;
};

export const createMealPlan = async (mealData) => {
  const formData = new FormData();

  // Basic fields
  if (mealData.plan_name) formData.append("plan_name", mealData.plan_name);
  if (mealData.description)
    formData.append("description", mealData.description);
  if (mealData.price !== undefined && mealData.price !== null)
    formData.append("price", mealData.price.toString());
  if (mealData.is_available !== undefined)
    formData.append("is_available", mealData.is_available.toString());
  if (mealData.vendor_id) formData.append("vendor_id", mealData.vendor_id);

  // Media files
  if (mealData.media && Array.isArray(mealData.media)) {
    mealData.media.forEach((file) => {
      if (file instanceof File) formData.append("media", file);
    });
  }

  const response = await api.post("/foods/meal-plans/", formData);
  return response.data;
};

export const updateMealPlan = async (mealId, mealData) => {
  const formData = new FormData();

  // Basic fields
  if (mealData.plan_name) formData.append("plan_name", mealData.plan_name);
  if (mealData.description)
    formData.append("description", mealData.description);
  if (mealData.price !== undefined && mealData.price !== null)
    formData.append("price", mealData.price.toString());
  if (mealData.is_available !== undefined)
    formData.append("is_available", mealData.is_available.toString());

  // Media files
  if (mealData.media && Array.isArray(mealData.media)) {
    mealData.media.forEach((file) => {
      if (file instanceof File) formData.append("media", file);
    });
  }

  const response = await api.patch(`/foods/meal-plans/${mealId}/`, formData);
  return response.data;
};

export const fetchMealPlans = async (vendorId) => {
  const response = await api.get("/foods/meal-plans/", {
    params: { vendor_id: vendorId },
  });
  return response.data;
};

export const deleteMealPlan = async (mealId) => {
  const response = await api.delete(`/foods/meal-plans/${mealId}/`);
  return response.data;
};

export const subscribeToPlan = async (planId) => {
  const response = await api.post("/foods/subscriptions/", { plan_id: planId });
  return response.data;
};

export const fetchUserSubscriptions = async () => {
  const response = await api.get("/foods/subscriptions/my-subscriptions/");
  return response.data;
};

export const fetchVendorSubscriptions = async () => {
  const response = await api.get("/foods/subscriptions/vendor-subscriptions/");
  return response.data;
};

export const updateSubscriptionStatus = async (subscriptionId, status) => {
  const response = await api.patch(`/foods/subscriptions/${subscriptionId}/`, {
    status,
  });
  return response.data;
};

export const fetchSubscriptionDetails = async (subscriptionId) => {
  const response = await api.get(`/foods/subscriptions/${subscriptionId}/`);
  return response.data;
};

export const pauseSubscription = async (subscriptionId) => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/pause/`,
  );
  return response.data;
};

export const resumeSubscription = async (subscriptionId) => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/resume/`,
  );
  return response.data;
};

export const cancelSubscription = async (subscriptionId) => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/cancel/`,
  );
  return response.data;
};

/* ---------------- MEAL SELECTION API ---------------- */
export const fetchMealSelections = async (subscriptionId) => {
  const response = await api.get("/foods/meal-selections/", {
    params: { subscription_id: subscriptionId },
  });
  return response.data;
};

export const createMealSelection = async (selectionData) => {
  const response = await api.post("/foods/meal-selections/", selectionData);
  return response.data;
};

export const fetchUserMealSelections = async () => {
  const response = await api.get("/foods/meal-selections/my-selections/");
  return response.data;
};

/* ---------------- PAYSTACK API ---------------- */
export const initiatePayment = async (data) =>
  api.post("/payments/initiate/", data);
export const verifyPayment = async (reference) =>
  api.get(`/payments/verify/${reference}/`);

/* ---------------- AD API ---------------- */
export const fetchAds = () => api.get("/ads/");
export const createAd = (adData) => api.post("/ads/", adData);
export const fetchAdDetails = (id) => api.get(`/ads/${id}/`);

/* ---------------- FEEDBACK & SUPPORT ---------------- */
export const submitSupportTicket = (ticketData) =>
  api.post("/support/tickets/", ticketData);
export const fetchSupportTickets = () => api.get("/support/tickets/");

/* ---------------- SEARCH MODAL API ---------------- */
// Simplified search functions for the unified search modal
// These use the same endpoints as above but are grouped for clarity
export const searchAll = async (query) => {
  const [shops, products, contents, vendors] = await Promise.all([
    searchShops({ search: query }),
    searchProducts({ search: query }),
    searchContents({ search: query }),
    searchFoodVendors({ search: query }),
  ]);
  return { shops, products, contents, vendors };
};

/* ---------------- VENDOR DASHBOARD API ---------------- */
export const fetchVendorOrders = async () => {
  const response = await api.get("/foods/orders/vendor-orders/");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/foods/orders/${orderId}/`, { status });
  return response.data;
};

export const fetchVendorAnalytics = async () => {
  const response = await api.get("/foods/vendors/analytics/");
  return response.data;
};

export const fetchVendorEarnings = async () => {
  const response = await api.get("/foods/vendors/earnings/");
  return response.data;
};

export const fetchVendorRatings = async () => {
  const response = await api.get("/foods/vendors/ratings/");
  return response.data;
};

export const toggleVendorAvailability = async () => {
  const response = await api.post("/foods/vendors/toggle-availability/");
  return response.data;
};

export const updateVendorCutoffTime = async (cutoffTime) => {
  const response = await api.patch("/foods/vendors/me/", {
    order_cutoff_time: cutoffTime,
  });
  return response.data;
};

export const fetchVendorMenuItems = async () => {
  const response = await api.get("/foods/meal-plans/");
  return response.data;
};

export const toggleMenuItemAvailability = async (itemId) => {
  const response = await api.post(`/foods/meal-plans/${itemId}/toggle/`);
  return response.data;
};

/* ---------------- ADMIN / STAFF API ---------------- */
export const fetchAllUsersAsStaff = async (params) => {
  const response = await api.get("/admin/users/", { params });
  return response.data;
};

export const fetchAllVendorsAsStaff = async (params) => {
  const response = await api.get("/admin/vendors/", { params });
  return response.data;
};

export const fetchAllOrdersAsStaff = async (params) => {
  const response = await api.get("/admin/orders/", { params });
  return response.data;
};

export const updateVendorStatusAsStaff = async (vendorId, status) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/`, { status });
  return response.data;
};

export const deleteUserAsStaff = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}/`);
  return response.data;
};

export const deleteVendorAsStaff = async (vendorId, hard = false) => {
  const response = await api.delete(`/admin/vendors/${vendorId}/`, {
    params: { hard },
  });
  return response.data;
};

export default api;
