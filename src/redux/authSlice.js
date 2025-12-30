import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthTokens, clearAuthTokens } from "../services/api";
import { fetchProfile, resetProfile } from "./profileSlice";

// --- LOGIN USER ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // 1. Construct the exact payload the backend expects: "login" and "password"
      // We accept input from UI as 'login', 'email', or 'username' and map it to 'login'
      const payload = {
        login: credentials.login || credentials.email || credentials.username,
        password: credentials.password,
      };

      // console.log("Logging in with payload:", payload);

      const response = await api.post("/auth/login/", payload);
      const data = response.data;

      // 2. Save Tokens
      if (data.access && data.refresh) {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      } else if (data.token?.access && data.token?.refresh) {
        setAuthTokens({
          access: data.token.access,
          refresh: data.token.refresh,
        });
      } else if (data.token) {
        setAuthTokens({ access: data.token, refresh: data.token });
      }

      // 3. Save User Data (if provided)
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }

      // 4. Fetch full profile to ensure Redux state is complete
      await dispatch(fetchProfile());

      return data;
    } catch (error) {
      console.error("Login Error:", error.response?.data);

      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        // If the backend returns field-specific errors, grab the first one
        error.response?.data?.login?.[0] ||
        error.response?.data?.password?.[0] ||
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

export const handleLogin = (userData) => (dispatch) => {
  dispatch(loginSuccess({ user_data: userData }));
  dispatch(fetchProfile());
};

export const handleLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(resetProfile());
};

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;