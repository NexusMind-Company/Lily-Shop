import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { clearCart, removeItemFromCart } from "./cartSlice"; // Import cart actions

// Async thunk: Create a new order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No access token found");
      }

      const response = await api.post("/orders/create/", orderData);

      // After successfully creating the order, clear the items from the cart
      const createdOrder = response.data;
      const itemIdsInOrder = orderData.items.map((item) => item.product_id);

      // Clear only the items that were just ordered
      // If you want to clear the whole cart, just use dispatch(clearCart())
      itemIdsInOrder.forEach((id) => {
        dispatch(removeItemFromCart(id)); // Assumes your removeItem action uses the product ID
      });

      return createdOrder; // Return the new order
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to create order"
      );
    }
  }
);

// Async thunk: Fetch *all* orders (auto-fetch all pages)
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No access token found");
      }

      let allOrders = [];
      let nextUrl = "/orders/";

      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;

        allOrders = [...allOrders, ...(data.results || [])];
        nextUrl = data.next
          ? new URL(data.next).pathname + new URL(data.next).search
          : null;
      }

      return allOrders;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to load orders"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    creating: false, // Add state for creating
    createError: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        // Add the new order to the list so it appears immediately
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Could not create order";
      });
  },
});

export const { clearOrders } = orderSlice.actions;

export default orderSlice.reducer;
