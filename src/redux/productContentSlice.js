import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const createProductContent = createAsyncThunk(
  "content/createProductContent",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }


      const response = await api.post("/shops/products/create/", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Product post failed:", error.response || error);
      return rejectWithValue(
        error.response?.data || "Failed to create product content.",
      );
    }
  },
);

const productContentSlice = createSlice({
  name: "productContent",
  initialState: {
    loading: false,
    error: null,
    success: false,
    createdItem: null,
  },
  reducers: {
    resetContentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.createdItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductContent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.createdItem = null;
      })
      .addCase(createProductContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdItem = action.payload;
      })
      .addCase(createProductContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetContentState } = productContentSlice.actions;
export default productContentSlice.reducer;
