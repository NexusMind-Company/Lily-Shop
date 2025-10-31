
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api"; 

// 1️⃣ REQUEST PASSWORD RESET (send email)
export const requestPasswordReset = createAsyncThunk(
  "passwordReset/request",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/password-reset/request/", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to send reset email." }
      );
    }
  }
);

// 2️⃣ VERIFY TOKEN (before allowing reset)
export const verifyResetToken = createAsyncThunk(
  "passwordReset/verify",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/password-reset/verify/", { token });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Invalid or expired token." }
      );
    }
  }
);

// 3️⃣ CONFIRM PASSWORD RESET
export const confirmPasswordReset = createAsyncThunk(
  "passwordReset/confirm",
  async ({ token, new_password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/password-reset/confirm/", {
        token,
        new_password,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to reset password." }
      );
    }
  }
);

const initialState = {
  email: "",
  token: "",
  status: "idle", // idle | loading | succeeded | failed
  step: "request", // request → verify → confirm → completed
  error: null,
  successMessage: null,
};

const passwordResetSlice = createSlice({
  name: "passwordReset",
  initialState,
  reducers: {
    clearPasswordResetState: (state) => {
      state.email = "";
      state.token = "";
      state.status = "idle";
      state.step = "request";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.email = action.meta.arg; // email passed as payload
        state.step = "verify";
        state.successMessage = "Password reset email sent successfully.";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.detail || "Failed to send reset email.";
      })

      // 🔹 Verify Token
      .addCase(verifyResetToken.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyResetToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token || action.meta.arg;
        state.step = "confirm";
        state.successMessage = "Token verified successfully.";
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.detail || "Invalid or expired token.";
      })

      // 🔹 Confirm Password Reset
      .addCase(confirmPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.status = "succeeded";
        state.token = "";
        state.step = "completed";
        state.successMessage = "Password has been reset successfully.";
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.detail || "Failed to reset password.";
      });
  },
});

export const { clearPasswordResetState } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;

// Optional aliases (if you used these in imports before)
export const clearResetState = clearPasswordResetState;
export const confirmResetPassword = confirmPasswordReset;
