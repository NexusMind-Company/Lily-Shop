import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunk for initiating payment
export const initiatePayment = createAsyncThunk(
  "ads/initiatePayment",
  async ({ shop_id, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post("/ads/payment/initiate/", {
        shop_id,
        amount,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to initiate payment");
    }
  }
);

// Async thunk for verifying payment
export const verifyPayment = createAsyncThunk(
  "ads/verifyPayment",
  async ({ reference }, { rejectWithValue }) => {
    try {
      const response = await api.post("/ads/payment/verify/", {
        reference,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to verify payment");
    }
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    paymentStatus: "idle",
    paymentError: null,
    paymentData: null,
    verificationStatus: "idle",
    verificationError: null,
    verificationData: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.paymentStatus = "idle";
      state.paymentError = null;
      state.paymentData = null;
    },
    resetVerificationState: (state) => {
      state.verificationStatus = "idle";
      state.verificationError = null;
      state.verificationData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Payment initiation
      .addCase(initiatePayment.pending, (state) => {
        state.paymentStatus = "loading";
        state.paymentError = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.paymentStatus = "succeeded";
        state.paymentData = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.paymentStatus = "failed";
        state.paymentError = action.payload;
      })
      // Payment verification
      .addCase(verifyPayment.pending, (state) => {
        state.verificationStatus = "loading";
        state.verificationError = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verificationStatus = "succeeded";
        state.verificationData = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verificationStatus = "failed";
        state.verificationError = action.payload;
      });
  },
});

export const { resetPaymentState, resetVerificationState } = adsSlice.actions;
export default adsSlice.reducer;
