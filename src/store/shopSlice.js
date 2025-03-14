import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch shops from the API
export const fetchShops = createAsyncThunk("shops/fetchShops", async () => {
  const response = await axios.get(`${API_BASE_URL}/shops/`);
  return response.data;
});

const shopSlice = createSlice({
  name: "shops",
  initialState: {
    shops: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default shopSlice.reducer;
