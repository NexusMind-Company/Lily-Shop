import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for the cart: an empty list of items
const initialState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // This is the action that FeedItem.jsx will dispatch
    addItemToCart: (state, action) => {
      const newItem = action.payload; // This is the product object passed from the component
      
      // 1. Check if the item (by ID) is already in the cart
      // NOTE: For simplicity, we assume the item ID alone defines uniqueness.
      // In a real app, you might check ID + color + size.
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        // 2. If it exists, increase its quantity (IMMUTABLY, thanks to RTK)
        existingItem.quantity += newItem.quantity;
      } else {
        // 3. If it's new, add the item to the array
        state.items.push(newItem);
      }
    },
    // You would add more actions here (e.g., removeItemFromCart, clearCart)
  },
});

// Export the action creator so components can use it
export const { addItemToCart } = cartSlice.actions;

// Export the reducer function to be added to the store
export default cartSlice.reducer;