import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, withdrawFromWallet, fetchWithdrawalHistory } from "../services/api";

/** Helper to attach token */
const setAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

/**
 * Fetch wallet data for the logged-in user
 */
export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await api.get("/wallet/me/");
      return response.data;
    } catch (error) {
      console.error(
        "Wallet fetch failed:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data || { detail: "Failed to load wallet data." },
      );
    }
  },
);

/**
 * Start Paystack top-up process
 */
export const topUpWallet = createAsyncThunk(
  "wallet/topUpWallet",
  async (amount_naira, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await api.post("/wallet/topup/", { amount_naira });
      return response.data;
    } catch (error) {
      console.error("Top-up failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { detail: "Unable to start top-up process." },
      );
    }
  },
);

/**
 * Verify Paystack callback
 */
export const verifyPaystackCallback = createAsyncThunk(
  "wallet/verifyPaystackCallback",
  async (reference, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await api.get(
        `/wallet/paystack/callback/?reference=${reference}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        "Paystack verification failed:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data || { detail: "Verification failed." },
      );
    }
  },
);

/**
 * Release promotion earnings
 */
export const releasePromotionEarnings = createAsyncThunk(
  "wallet/releasePromotionEarnings",
  async (_, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await api.post("/wallet/release-promotion-earnings/");
      return response.data;
    } catch (error) {
      console.error(
        "Promotion earnings release failed:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data || { detail: "Unable to release earnings." },
      );
    }
  },
);

/**
 * Create virtual account
 */
export const createVirtualAccount = createAsyncThunk(
  "wallet/createVirtualAccount",
  async (_, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await api.post("/wallet/create-virtual-account/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          detail: "Failed to generate virtual account.",
        },
      );
    }
  },
);

/**
 * Withdraw funds to bank account
 */
export const withdrawFunds = createAsyncThunk(
  "wallet/withdrawFunds",
  async (withdrawalData, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await withdrawFromWallet(withdrawalData);
      return response.data;
    } catch (error) {
      console.error("Withdrawal failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { detail: "Unable to process withdrawal." },
      );
    }
  },
);

/**
 * Fetch withdrawal history
 */
export const fetchWithdrawals = createAsyncThunk(
  "wallet/fetchWithdrawals",
  async (params = {}, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await fetchWithdrawalHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Unable to fetch withdrawal history." },
      );
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    loading: false,
    error: null,
    balance_naira: 0,
    withdrawable_naira: 0,
    recent_transactions: [],
    topup_loading: false,
    topup_error: null,
    authorization_url: null,
    verifying: false,
    promotion_releasing: false,
    virtual_account: null,
    withdrawal_loading: false,
    withdrawal_error: null,
    withdrawal_success: false,
    withdrawal_history: [],
  },
  reducers: {
    resetWalletState: (state) => {
      state.loading = false;
      state.error = null;
      state.balance_naira = 0;
      state.recent_transactions = [];
      state.authorization_url = null;
      state.virtual_account = null;
    },
    resetWithdrawalState: (state) => {
      state.withdrawal_loading = false;
      state.withdrawal_error = null;
      state.withdrawal_success = false;
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
        state.withdrawable_naira = action.payload.withdrawable_naira || 0;
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
        state.error = action.payload?.detail || "Paystack verification failed.";
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
      })

      //  Create virtual account
      .addCase(createVirtualAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVirtualAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.virtual_account = action.payload;
      })
      .addCase(createVirtualAccount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.detail || "Failed to create virtual account.";
      })

      // Withdraw funds
      .addCase(withdrawFunds.pending, (state) => {
        state.withdrawal_loading = true;
        state.withdrawal_error = null;
        state.withdrawal_success = false;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.withdrawal_loading = false;
        state.withdrawal_success = true;
        state.balance_naira = action.payload.balance_naira ?? state.balance_naira;
        state.withdrawable_naira = action.payload.withdrawable_naira ?? state.withdrawable_naira;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.withdrawal_loading = false;
        state.withdrawal_error =
          action.payload?.detail || "Withdrawal failed. Please try again.";
        state.withdrawal_success = false;
      })

      // Fetch withdrawal history
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawal_history = action.payload.withdrawals || action.payload.results || [];
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to fetch withdrawal history.";
      });
  },
});

export const { resetWalletState, resetWithdrawalState } = walletSlice.actions;
export default walletSlice.reducer;
