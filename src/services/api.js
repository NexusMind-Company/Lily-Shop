import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://lily-shop.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Auth Token Management ---

export const setAuthTokens = ({ access, refresh }) => {
  if (access) {
    localStorage.setItem("access_token", access);
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  }
  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  delete api.defaults.headers.common["Authorization"];
};

const storedAccess = localStorage.getItem("access_token");
if (storedAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedAccess}`;
}

// --- Response Interceptor (Token Refresh) ---

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        clearAuthTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject("No refresh token");
      }

      try {
        const rs = await api.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        const { access } = rs.data;
        setAuthTokens({ access });
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
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
  }
);

// --- Auth & Profile ---

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
    Object.entries(profileData).filter(([_, v]) => v != null)
  );
  const response = await api.patch("/auth/profile/update/", cleanData);
  return response.data;
};

export const updateProfilePic = async (imageFile) => {
  const formData = new FormData();
  formData.append("profile_pic", imageFile);

  const response = await api.put(
    "/auth/profile/update-profile-pic/",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );
  return response.data;
};

export const fetchPublicProfile = async (userId) => {
  const response = await api.get(`/auth/profile/${userId}/`);
  return response.data;
};

// --- Shops ---

export const fetchShopDetails = async (shopId) => {
  const response = await api.get(`/shops/${shopId}/`);
  return response.data;
};

export const fetchShopProducts = async (shopId) => {
  const response = await api.get(`/shops/${shopId}/products/`);
  return response.data;
};

// --- Feed & Products ---

export const fetchFeed = async () => {
  const response = await api.get("/shops/feed/");
  return response.data;
};

export const fetchProducts = async (params = {}) => {
  const response = await api.get("/shops/products/", { params });
  return response.data;
};

export const fetchNearbyFeed = async () => {
  const response = await api.get("/shops/products/nearby/");
  return response.data;
};

export const fetchProductDetails = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/`);
  return response.data;
};

// --- Search ---

export const searchShops = async (searchTerm) => {
  const response = await api.get("/shops/", { params: { search: searchTerm } });
  return response.data;
};

// --- Product Comments ---

export const fetchProductComments = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/comments/`);
  return response.data;
};

export const addProductComment = async (
  productId,
  commentText,
  parentId = null
) => {
  const payload = {
    comment_text: commentText,
    parent: parentId,
  };

  const response = await api.post(
    `/shops/products/${productId}/comment-create/`,
    payload
  );
  return response.data;
};

export const deleteProductComment = async (commentId) => {
  const response = await api.delete(
    `/shops/products/comments/${commentId}/delete/`
  );
  return response.data;
};

// --- Content Comments ---

export const fetchContentComments = async (contentId) => {
  const response = await api.get(`/shops/contents/${contentId}/comments/`);
  return response.data;
};

export const addContentComment = async (
  contentId,
  commentText,
  parentId = null
) => {
  const response = await api.post(
    `/shops/contents/${contentId}/comment-create/`,
    {
      content: contentId,
      comment_text: commentText,
      parent: parentId,
    }
  );
  return response.data;
};

export const deleteContentComment = async (commentId) => {
  const response = await api.delete(
    `/shops/contents/comments/${commentId}/delete/`
  );
  return response.data;
};

// --- Interactions ---

export const likeProduct = async (productId) => {
  const response = await api.post(`/shops/products/${productId}/like/`, {});
  return response.data;
};

export const likeContent = async (contentId) => {
  const response = await api.post(`/shops/contents/${contentId}/like/`, {});
  return response.data;
};

export const followUser = async (username) => {
  const response = await api.post(
    `/auth/follow/${encodeURIComponent(username)}/`,
    {}
  );
  return response.data;
};

export const toggleFollowShop = async (shopId) => {
  const response = await api.post(`/shops/${shopId}/toggle-follow/`, {});
  return response.data;
};

// --- Messaging ---

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

// --- Checkout Data ---

export const fetchDeliveryAddresses = async () => {
  const response = await api.get("/user/addresses");
  return response.data;
};

export const addNewAddress = async (addressData) => {
  const response = await api.post("/user/addresses", addressData);
  return response.data;
};

export const fetchPickupLocations = async () => {
  const response = await api.get("/pickup-locations");
  return response.data;
};

export const fetchSavedCards = async () => {
  const response = await api.get("/user/cards");
  return response.data;
};

export const addNewCard = async (cardData) => {
  const response = await api.post("/user/cards", cardData);
  return response.data;
};

// --- Payment & Orders ---

export const createOrder = async ({
  items,
  total_amount_kobo,
  payment_method,
}) => {
  const response = await api.post("/orders/create/", {
    items,
    total_amount_kobo,
    payment_method,
  });
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

// --- Wallet ---

export const fetchWallet = async () => {
  const response = await api.get("/wallet/me/");
  return response.data;
};

export const topUpWallet = async (amountNaira) => {
  const response = await api.post("/wallet/topup/", {
    amount_naira: amountNaira,
  });
  return response.data;
};

export default api;
