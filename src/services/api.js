import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://lily-shop.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Manages auth tokens in localStorage and axios headers
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

// Load token from storage when the app loads
const storedAccess = localStorage.getItem("access_token");
if (storedAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedAccess}`;
}

// Interceptor to handle 401 (Unauthorized) errors by logging out
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuthTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

// AUTH & USER PROFILE

// Get the authenticated user's profile
export const fetchUserProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

// FEED

// Fetch the personalized 'For You' feed
export const fetchFeed = async () => {
  const response = await api.get("/shops/home/");
  return response.data;
};

// PRODUCT COMMENTS

// Fetch comments for a specific product
export const fetchProductComments = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/comments/`);
  return response.data;
};

// Add a comment to a specific product
export const addProductComment = async (productId, commentText) => {
  const response = await api.post(
    `/shops/products/${productId}/comment-create/`,
    {
      comment: commentText,
    }
  );
  return response.data;
};

// Delete a comment from a product
export const deleteProductComment = async (commentId) => {
  const response = await api.delete(
    `/shops/products/comments/${commentId}/delete/`
  );
  return response.data;
};

// CONTENT (SOCIAL POST) COMMENTS

// Fetch comments for a specific content post
export const fetchContentComments = async (contentId) => {
  const response = await api.get(`/shops/contents/${contentId}/comments/`);
  return response.data;
};

// Add a comment to a specific content post
export const addContentComment = async (contentId, commentText) => {
  const response = await api.post(
    `/shops/contents/${contentId}/comment-create/`,
    {
      content: contentId,
      comment: commentText,
    }
  );
  return response.data;
};

// Delete a comment from a content post
export const deleteContentComment = async (commentId) => {
  const response = await api.delete(
    `/shops/contents/comments/${commentId}/delete/`
  );
  return response.data;
};

// CHECKOUT & USER DATA

// Fetch list of saved delivery addresses
export const fetchDeliveryAddresses = async () => {
  const response = await api.get("/user/addresses");
  return response.data;
};

// Add new address
export const addNewAddress = async (addressData) => {
  const response = await api.post("/user/addresses", addressData);
  return response.data;
};

// Fetch list of saved pickup locations
export const fetchPickupLocations = async () => {
  const response = await api.get("/pickup-locations");
  return response.data;
};

// Fetch list of saved cards
export const fetchSavedCards = async () => {
  const response = await api.get("/user/cards");
  return response.data;
};

// Add new card
export const addNewCard = async (cardData) => {
  const response = await api.post("/user/cards", cardData);
  return response.data;
};

// PAYMENT

// Initiate a bank transfer payment
export const initiateBankTransfer = async ({ amount, vendorName }) => {
  const response = await api.post("/payment/initiate-bank-transfer", {
    amount,
    vendorName,
  });
  return response.data;
};

// Check payment status
export const checkPaymentStatus = async (orderId) => {
  const response = await api.get(`/payment/status/${orderId}`);
  return response.data;
};

// Verify user password for payment
export const verifyPaymentPassword = async (password) => {
  const response = await api.post("/user/verify-password", { password });
  return response.data;
};

export default api;
