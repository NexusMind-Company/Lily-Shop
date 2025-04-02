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

// Async thunk for fetching ad details
export const fetchAdDetails = createAsyncThunk(
  "ads/fetchAdDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ads/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch ad details");
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
    adDetailsStatus: "idle",
    adDetailsError: null,
    adDetails: null,
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
    resetAdDetailsState: (state) => {
      state.adDetailsStatus = "idle";
      state.adDetailsError = null;
      state.adDetails = null;
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
      })
      // Fetch ad details
      .addCase(fetchAdDetails.pending, (state) => {
        state.adDetailsStatus = "loading";
        state.adDetailsError = null;
      })
      .addCase(fetchAdDetails.fulfilled, (state, action) => {
        state.adDetailsStatus = "succeeded";
        state.adDetails = action.payload;
      })
      .addCase(fetchAdDetails.rejected, (state, action) => {
        state.adDetailsStatus = "failed";
        state.adDetailsError = action.payload;
      });
  },
});

export const { resetPaymentState, resetVerificationState, resetAdDetailsState } = adsSlice.actions;
export default adsSlice.reducer;