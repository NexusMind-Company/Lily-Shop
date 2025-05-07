import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchShops = createAsyncThunk("shops/fetchShops", async () => {
  const response = await api.get("/shops", { skipAuth: true });
  return response.data;
});

export const fetchShopById = createAsyncThunk(
  "shops/fetchShopById",
  async (id) => {
    const response = await api.get(`/shops/${id}`, { skipAuth: true });
    return response.data;
  }
);

const shopSlice = createSlice({
  name: "shops",
  initialState: {
    shops: [],
    selectedShop: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearSelectedShopState: (state) => {
      state.selectedShop = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all shops
      .addCase(fetchShops.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.shops = action.payload;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch a single shop
      .addCase(fetchShopById.pending, (state) => {
        state.status = "loading";
        state.selectedShop = null;
        state.error = null;
      })
      .addCase(fetchShopById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedShop = action.payload;
      })
      .addCase(fetchShopById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.selectedShop = null;
      });
  },
});

export const { clearSelectedShopState } = shopSlice.actions;

export default shopSlice.reducer;
