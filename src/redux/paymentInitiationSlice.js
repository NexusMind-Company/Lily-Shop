import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunk to initiate a payment
export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async ({paymentData, token},{ rejectWithValue }) => {
    try {
      const response = await api.post("/ads/payment/initiate/", paymentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

const paymentInitiationSlice = createSlice({
  name: "payment",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    paymentData: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.paymentData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.paymentData = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetPaymentState } = paymentInitiationSlice.actions;
export default paymentInitiationSlice.reducer;
