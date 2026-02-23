import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProducts } from "../services/api";

// Async thunk to search products
export const searchProducts = createAsyncThunk(
  "search/searchProducts",
  async (searchTerm, { rejectWithValue }) => {
    try {
      // Passes the search term to the API as a query parameter
      const response = await fetchProducts({ search: searchTerm });
      
      // FIX: The feed endpoint returns data in 'feed', fallback to 'results' or empty array
      return response.feed || response.results || [];
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