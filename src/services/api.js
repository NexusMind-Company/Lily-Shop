import axios from "axios";

// ---- Base URL ----
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://lily-shop.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Token Helpers ----

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

// Load stored token on app start
const storedAccess = localStorage.getItem("access_token");
if (storedAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedAccess}`;
}

// ---- Response Interceptor (Logout when token expires) ----

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid -> logout user
      clearAuthTokens();

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }

      return Promise.reject("Session expired. Please login again.");
    }

    return Promise.reject(error);
  }
);

/**
 * Get the authenticated user's profile (requires JWT)
 */
export const getAuthProfile = async () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  const response = await api.get("/auth/profile/");
  return response.data;
};

/**
 *  Get another user's public profile using token
 */
export const getUserProfile = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const response = await api.get("/auth/profile/");
  return response.data;
};


export default api;
