import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch shops from the API
export const fetchShops = createAsyncThunk("shops/fetchShops", async () => {
  const response = await axios.get(
    "https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/shops/"
  );
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