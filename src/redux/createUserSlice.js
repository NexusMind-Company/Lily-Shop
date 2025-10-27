import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api"; // axios instance with baseURL, etc.

/**
 * Async thunk for user registration
 */
export const createUser = createAsyncThunk(
  "createUser/signup",
  async ({ email_or_phonenumber, password }, { rejectWithValue }) => {
    try {
      // Debug log — helps ensure correct payload structure
      console.log("📦 Sending signup payload:", { email_or_phonenumber, password });

      const response = await api.post("/auth/users/", {
        email_or_phonenumber,
        password,
      });

      console.log("✅ Signup response:", response.data);
      return response.data;
    } catch (error) {
      // Log details for easier debugging
      console.error("❌ Signup failed:", error.response?.data || error.message);

      // Return a normalized error message
      return rejectWithValue(
        error.response?.data || { detail: "Failed to create user" }
      );
    }
  }
);

const createUserSlice = createSlice({
  name: "createUser",
  initialState: {
    loading: false,
    error: null,
    success: false,
    user: null,
    message: null,
  },
  reducers: {
    resetCreateUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.user = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
        state.message =
          action.payload?.message || "User created successfully!";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.detail ||
          action.payload?.message ||
          "Failed to register user. Please try again.";
        state.success = false;
      });
  },
});

export const { resetCreateUserState } = createUserSlice.actions;
export default createUserSlice.reducer;
