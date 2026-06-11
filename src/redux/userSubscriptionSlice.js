import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  initiateUserSubscription,
  verifyUserSubscription,
  fetchUserSubscriptionStatus,
  cancelUserSubscription,
} from "../services/api";

// Async thunk to initiate user subscription payment
export const initiateUserSubscriptionPayment = createAsyncThunk(
  "userSubscription/initiatePayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await initiateUserSubscription(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Failed to initiate subscription",
      );
    }
  },
);

// Async thunk to verify user subscription payment
export const verifyUserSubscriptionPayment = createAsyncThunk(
  "userSubscription/verifyPayment",
  async (reference, { rejectWithValue }) => {
    try {
      const response = await verifyUserSubscription(reference);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Failed to verify subscription",
      );
    }
  },
);

// Async thunk to fetch user subscription status
export const getUserSubscriptionStatus = createAsyncThunk(
  "userSubscription/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUserSubscriptionStatus();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Failed to fetch subscription status",
      );
    }
  },
);

// Async thunk to cancel user subscription
export const cancelUserSubscriptionAction = createAsyncThunk(
  "userSubscription/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cancelUserSubscription();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Failed to cancel subscription",
      );
    }
  },
);

const userSubscriptionSlice = createSlice({
  name: "userSubscription",
  initialState: {
    subscription: null,
    status: "idle", // idle, loading, succeeded, failed
    error: null,
    paymentInitiating: false,
    paymentVerifying: false,
    cancelling: false,
  },
  reducers: {
    resetUserSubscriptionState: (state) => {
      state.status = "idle";
      state.error = null;
      state.paymentInitiating = false;
      state.paymentVerifying = false;
      state.cancelling = false;
    },
    setSubscriptionData: (state, action) => {
      state.subscription = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate payment
      .addCase(initiateUserSubscriptionPayment.pending, (state) => {
        state.paymentInitiating = true;
        state.error = null;
      })
      .addCase(initiateUserSubscriptionPayment.fulfilled, (state) => {
        state.paymentInitiating = false;
        // Payment data will be handled by the component
      })
      .addCase(initiateUserSubscriptionPayment.rejected, (state, action) => {
        state.paymentInitiating = false;
        state.error = action.payload;
      })

      // Verify payment
      .addCase(verifyUserSubscriptionPayment.pending, (state) => {
        state.paymentVerifying = true;
        state.error = null;
      })
      .addCase(verifyUserSubscriptionPayment.fulfilled, (state, action) => {
        state.paymentVerifying = false;
        state.subscription = action.payload.subscription;
      })
      .addCase(verifyUserSubscriptionPayment.rejected, (state, action) => {
        state.paymentVerifying = false;
        state.error = action.payload;
      })

      // Fetch status
      .addCase(getUserSubscriptionStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getUserSubscriptionStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscription = action.payload;
      })
      .addCase(getUserSubscriptionStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Cancel subscription
      .addCase(cancelUserSubscriptionAction.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelUserSubscriptionAction.fulfilled, (state, action) => {
        state.cancelling = false;
        state.subscription = action.payload.subscription;
      })
      .addCase(cancelUserSubscriptionAction.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      });
  },
});

export const { resetUserSubscriptionState, setSubscriptionData } =
  userSubscriptionSlice.actions;
export default userSubscriptionSlice.reducer;
