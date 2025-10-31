import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Thunk for verifying email
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-email/", { token });
      return response.data;
    } catch (error) {
      // Handle both API and network errors
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Email verification failed";
      return rejectWithValue(message);
    }
  }
);

const verifyEmailSlice = createSlice({
  name: "verifyEmail",
  initialState: {
    loading: false,
    success: false,
    message: null,
    error: null,
  },
  reducers: {
    resetVerifyEmailState: (state) => {
      state.loading = false;
      state.success = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message =
          action.payload?.message || action.payload?.detail || "Email verified successfully!";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetVerifyEmailState } = verifyEmailSlice.actions;
export default verifyEmailSlice.reducer;
