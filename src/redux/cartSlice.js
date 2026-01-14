import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "../services/api";

// ========================================
// ASYNC THUNKS - Backend Integration
// ========================================

/**
 * Fetch cart from backend
 */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders/cart/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch cart"
      );
    }
  }
);

/**
 * Add item to cart (backend)
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_id, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders/cart/add/", {
        product_id,
        quantity,
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add to cart"
      );
    }
  }
);

/**
 * Update cart item quantity
 */
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      if (quantity < 1) {
        // Delete if quantity is 0
        await api.delete(`/orders/cart/items/${id}/remove/`);
        return { id, deleted: true };
      }
      
      const response = await api.patch(`/orders/cart/items/${id}/`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update cart"
      );
    }
  }
);

/**
 * Remove item from cart
 */
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/cart/items/${itemId}/remove/`);
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to remove item"
      );
    }
  }
);

/**
 * Clear entire cart
 */
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/orders/cart/clear/");
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to clear cart"
      );
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Cart data from backend
  id: null,
  items: [],
  total_items: 0,
  total_price_kobo: 0,
  total_price_naira: 0,
  
  // UI state
  isLoading: false,
  isFetching: false,
  isUpdating: false,
  error: null,
  
  // Optimistic updates tracking
  pendingUpdates: {},
};

// ========================================
// SLICE
// ========================================

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    // Optimistic update (local only, before backend confirms)
    optimisticUpdateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      
      if (item) {
        // Store original quantity for rollback
        if (!state.pendingUpdates[itemId]) {
          state.pendingUpdates[itemId] = {
            originalQuantity: item.quantity,
          };
        }
        
        item.quantity = quantity;
        
        // Recalculate totals
        const newTotal = state.items.reduce(
          (sum, i) => sum + (i.subtotal_kobo || 0),
          0
        );
        state.total_price_kobo = newTotal;
        state.total_price_naira = newTotal / 100;
      }
    },
  },
  
  extraReducers: (builder) => {
    // ========================================
    // FETCH CART
    // ========================================
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isFetching = false;
        
        const cart = action.payload;
        state.id = cart.id;
        state.items = cart.items || [];
        state.total_items = cart.total_items || 0;
        state.total_price_kobo = cart.total_price_kobo || 0;
        state.total_price_naira = cart.total_price_naira || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || "Failed to fetch cart";
      })

    // ========================================
    // ADD TO CART
    // ========================================
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const cart = action.payload;
        state.id = cart.id;
        state.items = cart.items || [];
        state.total_items = cart.total_items || 0;
        state.total_price_kobo = cart.total_price_kobo || 0;
        state.total_price_naira = cart.total_price_naira || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add to cart";
      })

    // ========================================
    // UPDATE CART ITEM
    // ========================================
      .addCase(updateCartItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        if (action.payload.deleted) {
          // Item was deleted
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        } else {
          // Item was updated
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
        
        // Clear pending update
        delete state.pendingUpdates[action.payload.id];
        
        // Recalculate totals
        const newTotal = state.items.reduce(
          (sum, item) => sum + (item.subtotal_kobo || 0),
          0
        );
        state.total_price_kobo = newTotal;
        state.total_price_naira = newTotal / 100;
        state.total_items = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update cart";
        
        // Rollback optimistic updates
        Object.keys(state.pendingUpdates).forEach((itemId) => {
          const item = state.items.find((i) => i.id === itemId);
          if (item && state.pendingUpdates[itemId]) {
            item.quantity = state.pendingUpdates[itemId].originalQuantity;
          }
        });
        state.pendingUpdates = {};
      })

    // ========================================
    // REMOVE FROM CART
    // ========================================
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
        
        // Recalculate totals
        const newTotal = state.items.reduce(
          (sum, item) => sum + (item.subtotal_kobo || 0),
          0
        );
        state.total_price_kobo = newTotal;
        state.total_price_naira = newTotal / 100;
        state.total_items = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to remove item";
      })

    // ========================================
    // CLEAR CART
    // ========================================
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.total_items = 0;
        state.total_price_kobo = 0;
        state.total_price_naira = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

// ========================================
// ACTIONS & SELECTORS
// ========================================

export const { clearError, optimisticUpdateQuantity } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.total_items;
export const selectCartTotal = (state) => state.cart.total_price_naira;
export const selectCartIsLoading = (state) => state.cart.isLoading || state.cart.isFetching;
export const selectCartError = (state) => state.cart.error;

// Memoized selector for cart items with product details
export const selectCartItemsWithDetails = createSelector(
  [selectCartItems],
  (items) => {
    return items.map((item) => ({
      id: item.id,
      cartItemId: item.id,
      productId: item.product?.id,
      productName: item.product?.name || "Product",
      price: item.current_price_kobo / 100, // Convert kobo to naira
      quantity: item.quantity,
      subtotal: item.subtotal_naira,
      mediaSrc: item.product?.media_url || item.product?.image_url || "/placeholder.png",
      username: item.product?.user || "Seller",
      inStock: item.product?.in_stock,
      availableQuantity: item.product?.quantity_available,
      priceChanged: item.price_kobo_snapshot !== item.current_price_kobo,
    }));
  }
);

export default cartSlice.reducer;