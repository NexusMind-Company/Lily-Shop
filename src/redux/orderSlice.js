import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// ✅ Async thunk: Fetch *all* orders (auto-fetch all pages)
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      // 🔐 Get token from localStorage and set Authorization header
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No access token found");
      }

      let allOrders = [];
      let nextUrl = "/orders/";

      // Keep fetching all pages
      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;

        allOrders = [...allOrders, ...(data.results || [])];
        nextUrl = data.next
          ? new URL(data.next).pathname + new URL(data.next).search
          : null;
      }

      return allOrders; // Flattened list of all orders
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
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearOrders } = orderSlice.actions;

export default orderSlice.reducer;
