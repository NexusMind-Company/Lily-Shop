import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { addProduct } from "./addProductSlice";

export const fetchShops = createAsyncThunk("shops/fetchShops", async () => {
  const response = await api.get("/shops", { skipAuth: true });
  return response.data;
});

export const fetchShopById = createAsyncThunk(
  "shops/fetchShopById",
  async (id) => {
    const response = await api.get(`/shops/${id}`, { 
      skipAuth: true,
      params: { t: Date.now() }
    });
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
      })
      
      // Optimistic Update: When a product is added, inject it into the currently selected shop
      .addCase(addProduct.fulfilled, (state, action) => {
        // action.payload could be the created product object or an array of products
        // We ensure it gets injected so the UI shows it instantly
        if (state.selectedShop) {
          const newProducts = Array.isArray(action.payload) ? action.payload : [action.payload];
          state.selectedShop.products = [
            ...newProducts,
            ...(state.selectedShop.products || [])
          ];
          
          // Also update the global shops list if it exists
          const shopIndex = state.shops.findIndex(s => s.id === state.selectedShop.id);
          if (shopIndex !== -1) {
             state.shops[shopIndex].products = state.selectedShop.products;
          }
        }
      });
  },
});

export const { clearSelectedShopState } = shopSlice.actions;

export default shopSlice.reducer;
