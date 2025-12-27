import { createSlice, createSelector } from "@reduxjs/toolkit";

// Helper to load from localStorage safely
const loadCartFromStorage = () => {
  try {
    const serializedState = localStorage.getItem("lily_cart");
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load cart from storage", err);
    return [];
  }
};

// Helper to save to localStorage
const saveCartToStorage = (items) => {
  try {
    const serializedState = JSON.stringify(items);
    localStorage.setItem("lily_cart", serializedState);
  } catch (err) {
    console.error("Could not save cart to storage", err);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage(), // Load items on start
  },
  reducers: {
    addItemToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      saveCartToStorage(state.items); // Save after update
    },
    updateItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
      saveCartToStorage(state.items); // Save after update
    },
    removeItemFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.items = state.items.filter((item) => item.id !== idToRemove);
      saveCartToStorage(state.items); // Save after update
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items); // Save after update
    },
  },
});

export const {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0)
);
