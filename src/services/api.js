import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.lilyshops.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  /*
  // Temporarily disabled to troubleshoot CORS issues
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch"].includes(method)) {
    config.headers["Idempotency-Key"] =
      config.headers["Idempotency-Key"] || crypto.randomUUID();
  }
  */

  return config;
});

export const setAuthTokens = ({ access, refresh }) => {
  if (access) {
    localStorage.setItem("access_token", access);
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  }
  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }
};

const setAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export { api, setAuthHeader };

export const clearAuthTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  delete api.defaults.headers.common["Authorization"];
};

const storedAccess = localStorage.getItem("access_token");
if (storedAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedAccess}`;
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._isRefreshRequest) {
      isRefreshing = false;
      processQueue(error, null);
      clearAuthTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        clearAuthTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("No refresh token available"));
      }

      try {
        const rs = await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken },
          { _isRefreshRequest: true },
        );

        const { access } = rs.data;
        setAuthTokens({ access });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const fetchUserProfile = async () => {
  const response = await api.get("/auth/profile/me/");
  return response.data;
};

export const updateUsername = async (username) => {
  const response = await api.put("/auth/username/set/", { username });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const cleanData = Object.fromEntries(
    Object.entries(profileData).filter(([, v]) => v != null),
  );
  const response = await api.patch("/auth/profile/update/", cleanData);
  return response.data;
};

export const updateProfilePic = async (imageFile) => {
  const formData = new FormData();
  formData.append("profile_pic", imageFile);

  const response = await api.patch(
    "/auth/profile/update-profile-pic/",
    formData,
  );
  return response.data;
};

export const uploadMediaFile = async (file) => {
  if (file instanceof File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
    }
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/foods/subscriptions/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchPublicProfile = async (userId) => {
  const response = await api.get(`/auth/profile/${userId}/`);
  return response.data;
};

export const fetchShopDetails = async (shopId) => {
  const response = await api.get(`/shops/${shopId}/`);
  return response.data;
};

export const fetchShopProducts = async (shopId) => {
  const response = await api.get(`/shops/${shopId}/products/`);
  return response.data;
};

export const fetchAllFeed = async (params = {}) => {
  const response = await api.get("/shops/feed/", { params });
  return response.data;
};

export const fetchProducts = async (params = {}) => {
  const response = await api.get("/shops/feed/", { params });
  return response.data;
};

export const fetchLikedProducts = async () => {
  const response = await api.get("/shops/my-liked-products/");
  return response.data;
};

export const fetchNearbyFeed = async (params = {}) => {
  const response = await api.get("/shops/products/nearby/", { params });
  return response.data;
};

export const fetchProductDetails = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/`);
  return response.data;
};

export const fetchContentById = async (contentId) => {
  const response = await api.get(`/shops/contents/${contentId}/`);
  return response.data;
};

export const searchShops = async (searchTerm) => {
  const response = await api.get("/shops/", { params: { search: searchTerm } });
  return response.data;
};

export const searchContents = async (searchTerm) => {
  const response = await api.get("/shops/feed/", {
    params: { search: searchTerm },
  });
  return response.data;
};

export const fetchProductComments = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/comments/`);
  return response.data;
};

export const addProductComment = async (
  productId,
  commentText,
  parentId = null,
) => {
  const payload = {
    comment_text: commentText,
    product: productId,
  };

  if (parentId) {
    payload.parent = parentId;
  }

  const response = await api.post(
    `/shops/products/${productId}/comment-create/`,
    payload,
  );
  return response.data;
};

export const deleteProductComment = async (commentId) => {
  const response = await api.delete(
    `/shops/products/comments/${commentId}/delete/`,
  );
  return response.data;
};

export const fetchContentComments = async (contentId) => {
  const response = await api.get(`/shops/contents/${contentId}/comments/`);
  return response.data;
};

export const addContentComment = async (
  contentId,
  commentText,
  parentId = null,
) => {
  const payload = {
    comment_text: commentText,
    content_id: contentId,
  };

  if (parentId) {
    payload.parent = parentId;
  }

  const response = await api.post(
    `/shops/contents/${contentId}/comment-create/`,
    payload,
  );
  return response.data;
};

export const deleteContentComment = async (commentId) => {
  const response = await api.delete(
    `/shops/contents/comments/${commentId}/delete/`,
  );
  return response.data;
};

export const deleteContentPost = async (contentId) => {
  const response = await api.delete(`/shops/contents/${contentId}/delete/`);
  return response.data;
};

export const deleteProductPost = async (productId) => {
  const response = await api.delete(`/shops/products/${productId}/delete/`);
  return response.data;
};

export const likeProduct = async (productId) => {
  const response = await api.post(`/shops/products/${productId}/like/`, {});
  return response.data;
};

export const likeContent = async (contentId) => {
  const response = await api.post(`/shops/contents/${contentId}/like/`, {});
  return response.data;
};

export const likeProductComment = async (commentId) => {
  const response = await api.post(
    `/shops/product-comments/${commentId}/like/`,
    {},
  );
  return response.data;
};

export const likeContentComment = async (commentId) => {
  const response = await api.post(
    `/shops/content-comments/${commentId}/like/`,
    {},
  );
  return response.data;
};

// ==================== STRICT API DOCUMENTATION VIEWS FIX ====================

// 1. Record the view (POST)
export const recordProductView = async (productId) => {
  const response = await api.post(`/shops/products/${productId}/views/`, {
    view_count: 1,
  });
  return response.data;
};

export const recordContentView = async (contentId) => {
  const response = await api.post(`/shops/contents/${contentId}/views/`, {
    view_count: 1,
  });
  return response.data;
};

// 2. Fetch the authoritative view count (GET)
export const fetchProductViewCount = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/views/`);
  return response.data;
};

export const fetchContentViewCount = async (contentId) => {
  const response = await api.get(`/shops/contents/${contentId}/views/`);
  return response.data;
};

// ============================================================================

export const followUser = async (userId) => {
  const response = await api.post(`/auth/follow/${userId}/`, {});
  return response.data;
};

export const toggleFollowShop = async (shopId) => {
  const response = await api.post(`/shops/${shopId}/toggle-follow/`, {});
  return response.data;
};

export const sendMessage = async ({
  recipientId,
  content,
  productId = null,
}) => {
  const payload = { recipient: recipientId, content };
  if (productId) payload.product_id = productId;

  const response = await api.post("/messages/", payload);
  return response.data;
};

export const shareProductToChat = async (productId, recipientId) => {
  const response = await api.post(`/messages/share/${productId}/`, {
    recipient: recipientId,
  });
  return response.data;
};

export const fetchDeliveryAddresses = async () => {
  const response = await api.get("/users/me/addresses/");
  return response.data;
};

export const addNewAddress = async (addressData) => {
  const response = await api.post("/users/me/addresses/", addressData);
  return response.data;
};

export const setDefaultAddress = async (addressId) => {
  const response = await api.patch(`/users/me/addresses/${addressId}/`, {
    is_default: true,
  });
  return response.data;
};

export const fetchPickupLocations = async () => {
  const response = await api.get("/shops/pickup-locations/");
  return response.data;
};

export const fetchSavedCards = async () => {
  const response = await api.get("/users/me/cards/");
  return response.data;
};

export const addNewCard = async (cardData) => {
  const response = await api.post("/users/me/cards/", cardData);
  return response.data;
};

export const calculateCheckout = async (checkoutData) => {
  const response = await api.post("/orders/calculate-checkout/", checkoutData);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/orders/create/", orderData);
  return response.data;
};

export const initiateBankTransfer = async ({ amount, vendorName }) => {
  const response = await api.post("/payment/initiate-bank-transfer", {
    amount,
    vendorName,
  });
  return response.data;
};

export const checkPaymentStatus = async (orderId) => {
  const response = await api.get(`/payment/status/${orderId}`);
  return response.data;
};

export const verifyPaymentPassword = async (password) => {
  const response = await api.post("/user/verify-password", { password });
  return response.data;
};

export const fetchWallet = async () => {
  const response = await api.get("/wallet/me/");
  return response.data;
};

export const topUpWallet = async (amountNaira, intent_id = null) => {
  const payload = {
    amount_naira: amountNaira,
  };
  if (intent_id) payload.intent_id = intent_id;

  const response = await api.post("/wallet/topup/", payload);
  return response.data;
};

export const createSubscription = async (plan_id, deliveryMeta = {}) => {
  const response = await api.post("/foods/subscribe/", {
    plan_id,
    payment_method: "wallet",
    ...deliveryMeta,
  });
  return response.data;
};

export const getUserSubscriptions = async (params = {}) => {
  const response = await api.get("/foods/subscriptions/me/", { params });
  return response.data;
};

export const updateSubscriptionMeals = async (
  subscriptionId,
  mealSelections,
) => {
  const response = await api.put(
    `/foods/subscriptions/${subscriptionId}/meals/`,
    {
      meal_selections: mealSelections,
    },
  );
  return response.data;
};

export const cancelSubscription = async (subscriptionId, reason = "") => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/cancel/`,
    {
      reason,
    },
  );
  return response.data;
};

export const pauseSubscription = async (subscriptionId, reason = "") => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/pause/`,
    {
      reason,
    },
  );
  return response.data;
};

export const resumeSubscription = async (subscriptionId) => {
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/resume/`,
  );
  return response.data;
};

export const fetchSubscriptionStats = async (vendorId) => {
  if (!vendorId || typeof vendorId !== "string") {
    console.error("❌ fetchSubscriptionStats: vendorId must be a valid string");
    return { activeSubs: 0, revenue: 0, pending: 0 };
  }

  try {
    const response = await api.get(`/foods/subscriptions/vendor/`);
    const subscriptions = response.data.results || response.data;
    return {
      activeSubs: subscriptions.filter((sub) => sub.status === "active").length,
      revenue: subscriptions
        .filter((sub) => sub.status === "active")
        .reduce((sum, sub) => sum + parseFloat(sub.price || 0), 0),
      pending: subscriptions.filter((sub) => sub.status === "pending").length,
    };
  } catch (error) {
    console.error("❌ API Error fetching subscription stats:", error);
    return { activeSubs: 0, revenue: 0, pending: 0 };
  }
};

export const fetchRecentSubscriptions = async (vendorId, limit = 5) => {
  try {
    const response = await api.get(`/foods/subscriptions/vendor/`);
    const subscriptions = response.data.results || response.data || [];
    return subscriptions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  } catch (error) {
    console.error("❌ API Error fetching recent subscriptions:", error);
    return [];
  }
};

export const fetchAllSubscriptions = async (
  vendorId,
  { page = 1, page_size = 10 } = {},
) => {
  const response = await api.get(`/foods/subscriptions/vendor/`, {
    params: { page, page_size },
  });
  return response.data;
};

export const fetchVendorSubscriptionPlans = async (
  vendorId,
  { page = 1, page_size = 10 } = {},
) => {
  if (!vendorId || typeof vendorId !== "string") {
    console.error(
      "❌ fetchVendorSubscriptionPlans: vendorId must be a valid string",
    );
    return { results: [] };
  }

  try {
    const response = await api.get(
      `/foods/subscriptions/vendors/${vendorId}/plans/`,
      {
        params: { page, page_size },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ API Error fetching vendor subscription plans:", error);
    return { results: [] };
  }
};

export const fetchCustomerSubscriptions = async () => {
  const response = await api.get(`/foods/subscriptions/me/`);
  return response.data;
};

export const fetchMealsByVendor = async (vendorId) => {
  try {
    const response = await api.get(`/foods/meals/vendors/${vendorId}/`);
    return response.data;
  } catch (error) {
    console.warn(
      "Error fetching meals by vendor, returning empty list:",
      error?.message,
    );
    return [];
  }
};

export const fetchMealPlansByVendor = async (vendorId) => {
  if (!vendorId) {
    console.error("fetchMealPlansByVendor: vendorId is required");
    return { count: 0, next: null, previous: null, results: [] };
  }

  try {
    const response = await api.get(
      `/foods/subscriptions/vendors/${vendorId}/plans/`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching meal plans by vendor:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const createMealPlan = async (mealPlanData) => {
  const formData = new FormData();

  // Basic fields
  if (mealPlanData.plan_name)
    formData.append("plan_name", mealPlanData.plan_name);
  if (mealPlanData.description)
    formData.append("description", mealPlanData.description);
  if (mealPlanData.address) formData.append("address", mealPlanData.address);
  if (mealPlanData.price !== undefined)
    formData.append("price", mealPlanData.price.toString());
  if (mealPlanData.meals_per_cycle !== undefined)
    formData.append("meals_per_cycle", mealPlanData.meals_per_cycle.toString());
  if (mealPlanData.frequency)
    formData.append("frequency", mealPlanData.frequency);
  if (mealPlanData.trial_days !== undefined)
    formData.append("trial_days", mealPlanData.trial_days.toString());

  // Array fields
  if (Array.isArray(mealPlanData.service_days)) {
    formData.append("service_days", JSON.stringify(mealPlanData.service_days));
  }

  // Media files
  if (Array.isArray(mealPlanData.media)) {
    mealPlanData.media.forEach((file) => {
      if (file instanceof File) {
        formData.append("media", file);
      }
    });
  } else if (mealPlanData.media instanceof File) {
    formData.append("media", mealPlanData.media);
  }

  const response = await api.post("/foods/subscriptions/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createMeal = async (mealData) => {
  const formData = new FormData();

  if (mealData.name) formData.append("name", mealData.name);
  if (mealData.description)
    formData.append("description", mealData.description);
  if (mealData.image) formData.append("image", mealData.image);
  if (mealData.calories !== undefined)
    formData.append("calories", mealData.calories.toString());
  if (mealData.vendor) formData.append("vendor", mealData.vendor);

  if (Array.isArray(mealData.tags)) {
    mealData.tags.forEach((tag) => {
      formData.append("tags", JSON.stringify(tag));
    });
  }

  const response = await api.post("/foods/meals/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const appendVendorMedia = (formData, vendorData = {}) => {
  const files = [];

  if (vendorData.banner_image instanceof File)
    files.push(vendorData.banner_image);
  if (vendorData.profile_image instanceof File)
    files.push(vendorData.profile_image);

  if (Array.isArray(vendorData.media)) {
    vendorData.media.forEach((file) => {
      if (file instanceof File) files.push(file);
    });
  } else if (vendorData.media instanceof File) {
    files.push(vendorData.media);
  }

  files.forEach((file) => {
    formData.append("media", file);
  });
};

export const createFoodVendor = async (vendorData) => {
  const formData = new FormData();
  formData.append("name", vendorData.shop_name);
  formData.append("description", vendorData.description);
  formData.append("address", vendorData.address);
  formData.append("cuisine", vendorData.category);

  if (vendorData.contact_email) {
    const email = vendorData.contact_email.trim();
    formData.append("contact_email", email);
  }

  if (vendorData.contact_phone) {
    formData.append("contact_phone", vendorData.contact_phone.trim());
  }

  if (vendorData.service_days) {
    formData.append("service_days", vendorData.service_days);
  }

  appendVendorMedia(formData, vendorData);

  const response = await api.post("/foods/food-vendors/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateFoodVendor = async (vendorData) => {
  const formData = new FormData();
  if (vendorData.shop_name) formData.append("name", vendorData.shop_name);
  if (vendorData.description)
    formData.append("description", vendorData.description);
  if (vendorData.address) formData.append("address", vendorData.address);
  if (vendorData.category) formData.append("cuisine", vendorData.category);

  if (vendorData.contact_email) {
    const email = vendorData.contact_email.trim();
    formData.append("contact_email", email);
  }

  if (vendorData.contact_phone) {
    formData.append("contact_phone", vendorData.contact_phone.trim());
  }

  if (vendorData.service_days) {
    formData.append("service_days", vendorData.service_days);
  }

  appendVendorMedia(formData, vendorData);

  const response = await api.patch(`/foods/food-vendors/me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchFoodVendor = async (vendorId) => {
  // Use list endpoint with filter since /foods/food-vendors/{id}/ returns 405
  const response = await api.get(`/foods/vendors/`, {
    params: { id: vendorId },
  });
  const results = response.data.results || response.data;
  return results.find((v) => v.id === vendorId) || results[0] || null;
};

export const fetchAllFoodVendors = async (params = {}) => {
  const response = await api.get("/foods/vendors/", { params });
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
      if (file instanceof File) {
        formData.append("media", file);
      }
    });
  } else if (planData.media instanceof File) {
    formData.append("media", planData.media);
  }

  const response = await api.put(
    `/foods/subscriptions/${planId}/update/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const partialUpdateSubscriptionPlan = async (planId, planData) => {
  const formData = new FormData();

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

  if (planData.media && Array.isArray(planData.media)) {
    planData.media.forEach((file) => {
      if (file instanceof File) {
        formData.append("media", file);
      }
    });
  } else if (planData.media instanceof File) {
    formData.append("media", planData.media);
  }

  const response = await api.patch(
    `/foods/subscriptions/${planId}/update/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const fetchMealPlans = async () => {
  const res = await api.get("/foods/meal-plans/");
  return res.data;
};

export const fetchMealPlan = async (id) => {
  const res = await api.get(`/foods/subscriptions/${id}/`);
  return res.data;
};

export const subscribeToPlan = async () => {
  const response = await api.post("/foods/subscribe/");
  return response.data;
};

export const unsubscribeFromPlan = async (subscriptionId) => {
  // Uses the subscription record ID (UserSubscription.id), not plan_id
  // Backend: POST /foods/subscriptions/{subscription_id}/cancel/
  const response = await api.post(
    `/foods/subscriptions/${subscriptionId}/cancel/`,
  );
  return response.data;
};

export const createSubscriptionPlan = async (planData) => {
  const {
    plan_name,
    price,
    trial_days,
    description,
    address,
    meals_per_cycle,
    frequency,
    service_days,
    media,
  } = planData;

  if (!plan_name || !price) {
    throw new Error("Plan name and price are required");
  }

  const formData = new FormData();
  formData.append("plan_name", plan_name);
  formData.append("price", price.toString());

  if (trial_days !== undefined && trial_days !== null) {
    formData.append("trial_days", trial_days.toString());
  }

  if (description !== undefined && description !== null) {
    formData.append("description", description);
  }

  if (address !== undefined && address !== null) {
    formData.append("address", address);
  }

  if (meals_per_cycle !== undefined && meals_per_cycle !== null) {
    formData.append("meals_per_cycle", meals_per_cycle.toString());
  }

  if (frequency) {
    formData.append("frequency", frequency);
  }

  if (Array.isArray(service_days)) {
    formData.append("service_days", JSON.stringify(service_days));
  }

  if (media && Array.isArray(media)) {
    media.forEach((file) => {
      if (file instanceof File) {
        formData.append("media", file);
      }
    });
  } else if (media instanceof File) {
    formData.append("media", media);
  }

  const response = await api.post("/foods/subscriptions/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteMealPlan = async (mealPlanId) => {
  const response = await api.delete(
    `/foods/subscriptions/${mealPlanId}/delete/`,
  );
  return response.data;
};

export const deleteMeal = async (mealId) => {
  const response = await api.delete(`/foods/meals/${mealId}/delete/`);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/foods/reviews/${reviewId}/`, reviewData);
  return response.data;
};

export const partialUpdateReview = async (reviewId, reviewData) => {
  const response = await api.patch(`/foods/reviews/${reviewId}/`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/foods/reviews/${reviewId}/`);
  return response.data;
};

export const fetchVendorReviews = async (vendorId) => {
  const response = await api.get(`/foods/vendors/${vendorId}/reviews/`);
  return response.data;
};

export const createVendorReview = async (vendorId, reviewData) => {
  const response = await api.post(
    `/foods/vendors/${vendorId}/reviews/create/`,
    reviewData,
  );
  return response.data;
};

export const deleteVendorProfile = async () => {
  const response = await api.delete("/foods/vendors/me/delete/");
  return response.data;
};

export const fetchSubscribedVendors = async () => {
  const response = await api.get("/foods/vendors/subscribed/");
  return response.data;
};

export const fetchVendorSubscriptions = async (vendorId) => {
  const response = await api.get(
    `/foods/subscriptions/vendors/${vendorId}/plans/`,
  );
  return response.data;
};

export const initiateUserSubscription = async (paymentData) => {
  const response = await api.post("/subscriptions/user/initiate/", paymentData);
  return response.data;
};

export const verifyUserSubscription = async (reference) => {
  const response = await api.post("/subscriptions/user/verify/", { reference });
  return response.data;
};

export const fetchUserSubscriptionStatus = async () => {
  const response = await api.get("/subscriptions/user/status/");
  return response.data;
};

export const cancelUserSubscription = async () => {
  const response = await api.post("/subscriptions/user/cancel/");
  return response.data;
};

export const changeUserPassword = async (old_password, new_password) => {
  const response = await api.post("/auth/password-change/request/", {
    old_password,
    new_password,
  });
  return response.data;
};

export const deleteUserAccount = async () => {
  const response = await api.delete("/auth/users/me/");
  return response.data;
};

export default api;
