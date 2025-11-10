import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthTokens, clearAuthTokens } from "../services/api";
import { fetchProfile, resetProfile } from "./profileSlice";

// --- LOGIN USER ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ login, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login/", { login, password });
      const data = response.data;
      console.log(" Login response:", data);

      // ---- Save tokens ----
      if (data.access && data.refresh) {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      } else if (data.token?.access && data.token?.refresh) {
        // Some backends nest tokens under "token"
        setAuthTokens({
          access: data.token.access,
          refresh: data.token.refresh,
        });
      } else if (data.token) {
        // fallback single token (older API)
        setAuthTokens({ access: data.token, refresh: data.token });
      }

      // ---- Save user info (if returned) ----
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }

      // Fetch authenticated profile after login
      await dispatch(fetchProfile());

      return data;
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      return rejectWithValue(errMsg);
    }
  }
);

// --- INITIAL STATE ---
const initialState = {
  user_data: (() => {
    const stored = localStorage.getItem("user_data");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Error parsing stored user_data:", err);
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,
};

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      let userData = action.payload.user_data;
      if (typeof userData === "string") {
        try {
          userData = JSON.parse(userData);
        } catch (err) {
          console.error("Error parsing userData:", err);
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
      clearAuthTokens();
    },
  },

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

        if (action.payload.user) {
          localStorage.setItem(
            "user_data",
            JSON.stringify(action.payload.user)
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
        state.isAuthenticated = false;
      });
  },
});

// --- HELPER THUNKS ---
export const handleLogin = (userData) => (dispatch) => {
  dispatch(loginSuccess({ user_data: userData }));
  dispatch(fetchProfile());
};

export const handleLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(resetProfile());
};

// --- EXPORTS ---
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
