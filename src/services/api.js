
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

//Function to set the token dynamically from Redux or localStorage
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("auth_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
  }
};

// Initialize token on app load
const storedToken = localStorage.getItem("auth_token");
if (storedToken) {
  setAuthToken(storedToken);
}

// Intercept responses and handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_token");

      // Prevent infinite redirect loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

//Get authenticated user profile
export const getAuthProfile = async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No authentication token found");

  const response = await api.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;