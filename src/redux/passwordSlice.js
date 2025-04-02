import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for the API
const API_BASE_URL = "https://your-api-domain.com/api";

// Async thunk for requesting a password reset
export const requestPasswordReset = createAsyncThunk(
  "password/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/request/`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for verifying the password reset token
export const verifyPasswordReset = createAsyncThunk(
  "password/verifyPasswordReset",
  async ({ uid, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/verify/`, { uid, token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for confirming the password reset
export const confirmPasswordReset = createAsyncThunk(
  "password/confirmPasswordReset",
  async ({ uid, token, new_password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/confirm/`, {
        uid,
        token,
        new_password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  loading: false,
  success: null,
  error: null,
};

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Request Password Reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Password Reset
    builder
      .addCase(verifyPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(verifyPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(verifyPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Confirm Password Reset
    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = passwordSlice.actions;
export default passwordSlice.reducer;