import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunk to create a shop
export const createShop = createAsyncThunk(
  "createShop/createShop",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/shops/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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

const createShopSlice = createSlice({
  name: "createShop",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    shopData: null,
  },
  reducers: {
    resetCreateShopState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.shopData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.shopData = action.payload;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetCreateShopState } = createShopSlice.actions;
export default createShopSlice.reducer;
