import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  "password/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/password-reset/request/", {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to request password reset"
      );
    }
  }
);

// Verify password reset token
export const verifyPasswordReset = createAsyncThunk(
  "password/verifyPasswordReset",
  async ({ uid, token }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/password-reset/verify/", {
        uid,
        token,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to verify password reset token"
      );
    }
  }
);

// Confirm password reset
export const confirmPasswordReset = createAsyncThunk(
  "password/confirmPasswordReset",
  async ({ uid, token, new_password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/password-reset/confirm/", {
        uid,
        token,
        new_password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to confirm password reset"
      );
    }
  }
);

const passwordSlice = createSlice({
  name: "password",
  initialState: {
    status: "idle",
    error: null,
    successMessage: null,
  },
  reducers: {
    clearPasswordState: (state) => {
      state.status = "idle";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage =
          action.payload.message || "Password reset email sent successfully.";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to request password reset.";
      })

      // Verify Password Reset
      .addCase(verifyPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyPasswordReset.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage =
          action.payload.message ||
          "Password reset token verified successfully.";
      })
      .addCase(verifyPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Failed to verify password reset token.";
      })

      // Confirm Password Reset
      .addCase(confirmPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage =
          action.payload.message || "Password reset successfully.";
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to confirm password reset.";
      });
  },
});

export const { clearPasswordState } = passwordSlice.actions;
export default passwordSlice.reducer;
