import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProducts } from "../services/api";

// Async thunk to search products
export const searchProducts = createAsyncThunk(
  "search/searchProducts",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await fetchProducts({ search: searchTerm });
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.feed)) return response.feed;
      if (Array.isArray(response?.results)) return response.results;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data)) return response.data;
      const keys = Object.keys(response || {});
      for (const key of keys) {
        if (Array.isArray(response[key]) && response[key].length > 0) {
          return response[key];
        }
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data || "Search failed");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    results: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.results = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = searchSlice.actions;

export default searchSlice.reducer;