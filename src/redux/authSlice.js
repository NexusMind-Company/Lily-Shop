import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../services/api";
import { fetchProfile } from "./profileSlice";

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ login, password }, { rejectWithValue }) => {
    try {
      // Call backend API
      const response = await api.post("/auth/login/", { login, password });

      // If backend sends token + user data
      const data = response.data;

      // Save token for future requests
      if (data.access || data.token) {
        setAuthToken(data.access || data.token);
      }

      // Persist user data
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      return rejectWithValue(errMsg);
    }
  }
);

// Initial state
const initialState = {
  user_data: (() => {
    const storedData = localStorage.getItem("user_data");
    try {
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Error parsing stored user_data:", error);
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem("user_data"),
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      let userData = action.payload.user_data;

      if (typeof userData === "string") {
        try {
          userData = JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing userData:", error);
        }
      }

      state.user_data = userData;
      state.isAuthenticated = true;
      localStorage.setItem("user_data", JSON.stringify(userData));
    },

    logout: (state) => {
      state.user_data = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_token");
      setAuthToken(null);
    },
  },

  //  Handle async login states
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user_data = action.payload.user || null;

        // Store user info in localStorage
        if (action.payload.user) {
          localStorage.setItem("user_data", JSON.stringify(action.payload.user));
        }

        // Trigger profile fetch
        fetchProfile();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
        state.isAuthenticated = false;
      });
  },
});

//  Thunks for login/logout
export const handleLogin = (userData) => (dispatch) => {
  dispatch(loginSuccess({ user_data: userData }));
  dispatch(fetchProfile());
};

export const handleLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(fetchProfile());
};

// 🔹 Export actions and reducer
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
