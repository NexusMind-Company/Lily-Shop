import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createFoodVendor } from "../services/api";

// Async thunk to create a subscription vendor
export const createSubscriptionVendor = createAsyncThunk(
  "createSubscriptionVendor/createSubscriptionVendor",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await createFoodVendor(formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred",
      );
    }
  },
);

const createSubscriptionVendorSlice = createSlice({
  name: "createSubscriptionVendor",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    vendorData: null,
  },
  reducers: {
    resetCreateSubscriptionVendorState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.vendorData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubscriptionVendor.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscriptionVendor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.vendorData = action.payload;
      })
      .addCase(createSubscriptionVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetCreateSubscriptionVendorState } =
  createSubscriptionVendorSlice.actions;
export default createSubscriptionVendorSlice.reducer;
