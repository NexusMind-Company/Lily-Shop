// src/redux/walletSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/**
 * Fetch wallet data for the logged-in user
 * Endpoint: GET /wallet/me/
 */
export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/wallet/me/");
      return response.data; // Expected: { balance_naira, recent_transactions }
    } catch (error) {
      console.error("❌ Wallet fetch failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { detail: "Failed to load wallet data." }
      );
    }
  }
);

/**
 * Start Paystack top-up process
 * Endpoint: POST /wallet/topup/
 * Body: { "amount_naira": number }
 * Response: { authorization_url, reference }
 */
export const topUpWallet = createAsyncThunk(
  "wallet/topUpWallet",
  async (amount_naira, { rejectWithValue }) => {
    try {
      const response = await api.post("/wallet/topup/", { amount_naira });
      return response.data; // { authorization_url, reference }
    } catch (error) {
      console.error("❌ Top-up failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { detail: "Unable to start top-up process." }
      );
    }
  }
);

/**
 * Handle Paystack redirect callback
 * Endpoint: GET /wallet/paystack/callback/?reference=REF123
 * Verifies and credits wallet if successful
 */
export const verifyPaystackCallback = createAsyncThunk(
  "wallet/verifyPaystackCallback",
  async (reference, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wallet/paystack/callback/?reference=${reference}`);
      return response.data;
    } catch (error) {
      console.error("❌ Paystack verification failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { detail: "Verification failed." }
      );
    }
  }
);

/**
 * Release promotion earnings
 * Endpoint: POST /wallet/release-promotion-earnings/
 */
export const releasePromotionEarnings = createAsyncThunk(
  "wallet/releasePromotionEarnings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/wallet/release-promotion-earnings/");
      return response.data;
    } catch (error) {
      console.error(
        "❌ Promotion earnings release failed:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data || { detail: "Unable to release earnings." }
      );
    }
  }
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    loading: false,
    error: null,
    balance_naira: 0,
    recent_transactions: [],
    topup_loading: false,
    topup_error: null,
    authorization_url: null,
    verifying: false,
    promotion_releasing: false,
  },
  reducers: {
    resetWalletState: (state) => {
      state.loading = false;
      state.error = null;
      state.balance_naira = 0;
      state.recent_transactions = [];
      state.authorization_url = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance_naira = action.payload.balance_naira || 0;
        state.recent_transactions = action.payload.recent_transactions || [];
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.detail ||
          "Unable to fetch wallet information. Please try again.";
      })

      // Start top-up
      .addCase(topUpWallet.pending, (state) => {
        state.topup_loading = true;
        state.topup_error = null;
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.topup_loading = false;
        state.authorization_url = action.payload.authorization_url;
      })
      .addCase(topUpWallet.rejected, (state, action) => {
        state.topup_loading = false;
        state.topup_error =
          action.payload?.detail || "Unable to initiate top-up.";
      })

      // Verify Paystack Callback
      .addCase(verifyPaystackCallback.pending, (state) => {
        state.verifying = true;
      })
      .addCase(verifyPaystackCallback.fulfilled, (state) => {
        state.verifying = false;
      })
      .addCase(verifyPaystackCallback.rejected, (state, action) => {
        state.verifying = false;
        state.error =
          action.payload?.detail || "Paystack verification failed.";
      })

      // Release promotion earnings
      .addCase(releasePromotionEarnings.pending, (state) => {
        state.promotion_releasing = true;
      })
      .addCase(releasePromotionEarnings.fulfilled, (state) => {
        state.promotion_releasing = false;
      })
      .addCase(releasePromotionEarnings.rejected, (state, action) => {
        state.promotion_releasing = false;
        state.error =
          action.payload?.detail || "Failed to release promotion earnings.";
      });
  },
});

export const { resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
