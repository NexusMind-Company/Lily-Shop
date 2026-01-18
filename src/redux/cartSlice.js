import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// ==================== THUNKS ====================

// Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders/cart/");
      return response.data;
    } catch (error) {
      console.error("Fetch Cart Error:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch cart items."
      );
    }
  }
);

// Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_id, quantity, quantity_grams }, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders/cart/add/", {
        product_id,
        quantity,
        quantity_grams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add item to cart."
      );
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity, quantity_grams }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/cart/items/${itemId}/`, {
        quantity,
        quantity_grams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update cart item."
      );
    }
  }
);

// Remove from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/cart/items/${itemId}/`);
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove item from cart."
      );
    }
  }
);

// Clear Cart (local state + optional backend call if needed)
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch }) => {
    // You can add an API call here if your backend has a clear-cart endpoint
    return true;
  }
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
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Adjust based on your actual API response structure (e.g., action.payload.items)
        state.items = action.payload.items || action.payload || [];
        state.total_amount = action.payload.total_amount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Cart
    builder.addCase(addToCart.fulfilled, (state) => {
      state.loading = false;
      // Usually we refetch the cart after adding to ensure sync
    });

    // Update Cart Item
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      // Optimistic update could go here, or just refetch
    });

    // Remove from Cart
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
    });
    
    // Clear Cart
    builder.addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.total_amount = 0;
    });
  },
});

// ==================== EXPORTS ====================

export const { clearError, resetCart } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total_amount;
export const selectCartIsLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;