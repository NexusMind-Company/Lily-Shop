import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// ==================== THUNKS ====================

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders/carts/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch cart items.",
      );
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { product_id, quantity, quantity_grams },
    { dispatch, rejectWithValue },
  ) => {
    if (!product_id) {
      return rejectWithValue("Cannot add item: Product ID is missing.");
    }

    try {
      const payload = {
        product_id,
        quantity: quantity || 1,
        quantity_grams: quantity_grams || 0,
      };

      console.log("🛒 Attempting to add to cart:", payload);
      const response = await api.post("/orders/carts/add/", payload);
      console.log("✅ Cart response:", response.data);

      // Crucial: Fetch the updated cart state immediately after adding
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      console.error("❌ Add to cart FULL error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      return rejectWithValue(
        error.response?.data || "Failed to add item to cart.",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ id, quantity, quantity_grams }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/cart/items/${id}/`, {
        quantity,
        quantity_grams,
      });

      // Fetch updated cart to ensure accurate totals
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update cart item.",
      );
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/orders/cart/items/${itemId}/remove/`);

      // Fetch updated cart to ensure accurate totals
      dispatch(fetchCart());

      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove item from cart.",
      );
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.delete("/orders/cart/clear/");
      dispatch(fetchCart());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to clear cart.");
    }
  },
);

// ==================== SLICE ====================

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total_amount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.items = [];
      state.total_amount = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload || [];
        state.total_amount =
          action.payload.total_price_naira || action.payload.total_amount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(addToCart.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateCartItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      // Optimistically filter item out so UI feels instant while fetchCart resolves
      state.items = state.items.filter((item) => item.id !== action.payload);
    });
    builder.addCase(clearCart.fulfilled, (state) => {
      state.items = [];
      state.total_amount = 0;
    });
  },
});

// ==================== EXPORTS ====================

export const { clearError, resetCart } = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total_amount;
export const selectCartIsLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
