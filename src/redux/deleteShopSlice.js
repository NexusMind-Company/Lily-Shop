import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunk to delete a shop
export const deleteShop = createAsyncThunk(
  "shop/deleteShop",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/shops/${id}/delete/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

// Async thunk to update a shop
export const updateShop = createAsyncThunk(
  "shop/updateShop",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/shops/${id}/update/`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

const shopSlice = createSlice({
  name: "shop",
  initialState: {
    deleteStatus: "idle",
    updateStatus: "idle",
    error: null,
  },
  reducers: {
    resetDeleteShopState: (state) => {
      state.deleteStatus = "idle";
      state.error = null;
    },
    resetUpdateShopState: (state) => {
      state.updateStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Delete Shop Cases
      .addCase(deleteShop.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteShop.fulfilled, (state) => {
        state.deleteStatus = "succeeded";
      })
      .addCase(deleteShop.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      })

      // Update Shop Cases
      .addCase(updateShop.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateShop.fulfilled, (state) => {
        state.updateStatus = "succeeded";
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetDeleteShopState, resetUpdateShopState } = shopSlice.actions;
export default shopSlice.reducer;
