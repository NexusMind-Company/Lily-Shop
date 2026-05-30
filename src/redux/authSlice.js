import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthTokens, clearAuthTokens } from "../services/api";
import { fetchProfile, resetProfile } from "./profileSlice";

// ==================== LOGIN USER ====================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // FIX: STRICT PAYLOAD.
      // The backend ONLY accepts 'login' and 'password'.
      // Any extra fields (like 'email' or 'username') will cause a 400 Bad Request.
      const payload = {
        login: credentials.login || credentials.email || credentials.username,
        password: credentials.password,
      };

      // console.log("Sending Login Payload:", payload); // Debugging log

      const response = await api.post("/auth/login/", payload);
      const data = response.data;

      // ---- Save tokens ----
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

      // ---- Save user info ----
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }

      // Fetch full profile safely
      try {
        await dispatch(fetchProfile());
      } catch (err) {
        console.warn("Profile fetch failed after login:", err);
      }

      return {
        message: data.message || "Registration successful! Please login.",
        user: data.user,
      };
    } catch (error) {
      console.error("Login Error Detail:", error.response?.data);

      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        // Capture 'non_field_errors' which is common for "Invalid credentials"
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.login?.[0] ||
        error.response?.data?.password?.[0] ||
        "Login failed. Please check your credentials.";

      return rejectWithValue(errMsg);
    }
  },
);

// Regiser User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      // Matches the payload sent from signUp.jsx
      const response = await api.post("/auth/users/", userData);
      return response.data;
    } catch (error) {
      console.error("Registration Error FULL:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.["Invalid registration"]?.[0] ||
          error.response?.data?.email_or_phonenumber?.[0] ||
          error.response?.data?.password?.[0] ||
          "Registration failed.",
      );
    }
  },
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
        state.user_data = action.payload.user || state.user_data || null;

        if (action.payload.user) {
          localStorage.setItem(
            "user_data",
            JSON.stringify(action.payload.user),
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
        state.isAuthenticated = false;
        state.user_data = null;
        localStorage.removeItem("user_data");
        clearAuthTokens();
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
        // Clear any stale session from a previous logged-in user on this device
        // so the newly registered account doesn't accidentally inherit old tokens/data
        state.user_data = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user_data");
        clearAuthTokens();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed.";
        state.registrationSuccess = false;
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

export const { loginSuccess, logout, clearError, clearRegistrationSuccess } =
  authSlice.actions;
export default authSlice.reducer;