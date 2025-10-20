import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to set the token dynamically from the Redux store
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Also store in localStorage for persistence
    localStorage.setItem("auth_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
  }
};

// Initialize token from localStorage on service creation
const storedToken = localStorage.getItem("auth_token");
if (storedToken) {
  setAuthToken(storedToken);
}

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 
export const getAuthProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;

