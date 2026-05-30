import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

// ==================== THUNKS ====================

// Create Order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders/create/", orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create order.");
    }
  }
);

// Fetch Orders List
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch order history."
      );
    }
  }
);

// Fetch Single Order Detail
export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOrderDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch order details."
      );
    }
  }
);

// ==================== SLICE ====================

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false, // general loading for fetching lists/details
    createOrderLoading: false, // specific for order creation
    error: null,
    createOrderError: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.createOrderError = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderError = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.createOrderLoading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderError = action.payload;
      });

    // Fetch Orders List
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload)
          ? action.payload
          : action.payload.results || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Order Detail
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================

// Actions
export const { clearOrderError, resetCurrentOrder } = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderLoading = (state) => state.orders.loading;
export const selectOrderError = (state) => state.orders.error;

// Creation-specific selectors
export const selectCreateOrderLoading = (state) => state.orders.createOrderLoading;
export const selectCreateOrderError = (state) => state.orders.createOrderError;

// Reducer
export default orderSlice.reducer;
