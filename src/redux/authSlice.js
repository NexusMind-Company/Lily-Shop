import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthTokens, clearAuthTokens } from "../services/api";
import { fetchProfile, resetProfile } from "./profileSlice";

// ==================== LOGIN USER ====================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // Backend expects ONLY 'login' and 'password'
      const payload = {
        login: credentials.login,
        password: credentials.password,
      };

      console.log("🔐 Login attempt:", { login: payload.login });

      const response = await api.post("/auth/login/", payload);
      const data = response.data;

      console.log("✅ Login successful:", data);

      // Extract tokens (backend returns token: { access, refresh })
      const tokens = data.token || {};
      const accessToken = tokens.access || data.access;
      const refreshToken = tokens.refresh || data.refresh;

      if (accessToken && refreshToken) {
        setAuthTokens({ access: accessToken, refresh: refreshToken });
      } else {
        throw new Error("No tokens received from server");
      }

      // Store user data
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
      };

      localStorage.setItem("user_data", JSON.stringify(userData));

      // Fetch full profile after login
      try {
        await dispatch(fetchProfile()).unwrap();
      } catch (profileError) {
        console.warn("⚠️ Profile fetch failed:", profileError);
      }

      return userData;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data);

      // Extract user-friendly error message
      const errorData = error.response?.data || {};
      const errorMsg =
        errorData.detail ||
        errorData.non_field_errors?.[0] ||
        errorData.login?.[0] ||
        errorData.password?.[0] ||
        errorData.message ||
        "Invalid login credentials. Please try again.";

      return rejectWithValue(errorMsg);
    }
  }
);

// ==================== REGISTER USER ====================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const payload = {
        email_or_phonenumber: credentials.email_or_phonenumber,
        password: credentials.password,
      };

      console.log("📝 Registration attempt:", {
        contact: payload.email_or_phonenumber,
      });

      const response = await api.post("/auth/users/", payload);
      const data = response.data;

      console.log("✅ Registration successful:", data);

      return {
        message: data.message || "Registration successful! Please login.",
      };
    } catch (error) {
      console.error("❌ Registration failed:", error.response?.data);

      const errorData = error.response?.data || {};
      const errorMsg =
        errorData.detail ||
        errorData["Invalid registration"] ||
        errorData.email_or_phonenumber?.[0] ||
        errorData.password?.[0] ||
        errorData.message ||
        "Registration failed. Please try again.";

      return rejectWithValue(errorMsg);
    }
  }
);

// ==================== INITIAL STATE ====================
const getUserDataFromStorage = () => {
  try {
    const stored = localStorage.getItem("user_data");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error parsing stored user_data:", error);
    localStorage.removeItem("user_data");
    return null;
  }
};

const initialState = {
  user_data: getUserDataFromStorage(),
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,
  registrationSuccess: false,
};

// ==================== SLICE ====================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const userData = action.payload.user_data;
      state.user_data = userData;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem("user_data", JSON.stringify(userData));
    },

    logout: (state) => {
      state.user_data = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationSuccess = false;
      localStorage.removeItem("user_data");
      clearAuthTokens();
    },

    clearError: (state) => {
      state.error = null;
    },

    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },

  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user_data = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
        state.isAuthenticated = false;
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed.";
        state.registrationSuccess = false;
      });
  },
});

// ==================== HELPER ACTIONS ====================
export const handleLogin = (userData) => (dispatch) => {
  dispatch(loginSuccess({ user_data: userData }));
  dispatch(fetchProfile());
};

export const handleLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(resetProfile());
};

export const { loginSuccess, logout, clearError, clearRegistrationSuccess } =
  authSlice.actions;

export default authSlice.reducer;