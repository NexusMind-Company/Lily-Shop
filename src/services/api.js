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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor to handle 401 (Unauthorized) errors by logging out
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
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        clearAuthTokens();
        window.location.href = "/login";
        return Promise.reject("No refresh token, logging out.");
      }

      try {
        // Request a new token
        const rs = await api.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        const { access } = rs.data;
        setAuthTokens({ access: access });
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        processQueue(null, access);
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token itself is bad, log everyone out
        processQueue(refreshError, null);
        clearAuthTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Get the authenticated user's profile
export const fetchUserProfile = async () => {
  const response = await api.get("/auth/profile/me");
  return response.data;
};

// Update username
export const updateUsername = async (username) => {
  const response = await api.put("/auth/username/set/", { username });
  return response.data;
};

// Update profile picture
export const updateProfilePic = async (imageFile) => {
  const formData = new FormData();
  formData.append("profile_pic", imageFile); //TODO Check if the backend expects "profile_pic"

  const response = await api.put(
    "/auth/profile/update-profile-pic/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Fetch the personalized 'For You' feed
export const fetchFeed = async () => {
  const response = await api.get("/shops/home/");
  return response.data;
};

// Fetch the nearby feed
export const fetchNearbyFeed = async () => {
  const response = await api.get("/shops/products/nearby/");
  return response.data;
};

//Search functon
export const searchShops = async (searchTerm) => {
  const response = await api.get("/shops/", {
    params: {
      search: searchTerm,
    },
  });
  return response.data;
};

// Fetch comments for a specific product
export const fetchProductComments = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/comments/`);
  return response.data;
};

// Toggle (like/unlike) a PRODUCT
export const likeProduct = async (productId) => {
  const response = await api.post(`/shops/products/${productId}/like/`);
  return response.data;
};

// Toggle (like/unlike) a CONTENT post
export const likeContent = async (contentId) => {
  const response = await api.post(`/shops/contents/${contentId}/like/`);
  return response.data;
};

// Toggle (follow/unfollow) a USER
export const followUser = async (username) => {
  const response = await api.post(`/auth/follow/${username}/`);
  return response.data;
};

// Send a new message
export const sendMessage = async ({ recipientId, content }) => {
  const response = await api.post("/messages/", {
    recipient: recipientId,
    content: content,
  });
  return response.data;
};

// PRODUCT COMMENTS
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
