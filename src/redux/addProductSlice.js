import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async action to add a product to a shop
export const addProduct = createAsyncThunk(
  "addProduct/addProduct",
  async ({ shop_id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/shops/${shop_id}/products/batch-create/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

// Async action to fetch products for a shop
export const fetchProducts = createAsyncThunk(
  "addProduct/fetchProducts",
  async (shop_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/shops/${shop_id}/products`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to fetch products"
      );
    }
  }
);

// Async action to update a product
export const updateProduct = createAsyncThunk(
  "addProduct/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/shops/products/${id}/update/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to update product"
      );
    }
  }
);

// Async thunk to delete a product
export const deleteProduct = createAsyncThunk(
  "addProduct/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/shops/products/${id}/delete/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

const addProductSlice = createSlice({
  name: "addProduct",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    productData: null,
    products: [],
  },
  reducers: {
    resetAddProductState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.productData = null;
    },
  },
  resetDeleteProductState: (state) => {
    state.deleteStatus = "idle";
    state.error = null;
  },
  extraReducers: (builder) => {
    builder
      // Handle delete product actions
      .addCase(deleteProduct.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.products = state.products.filter(
          (product) => product.id !== action.meta.arg
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      })

      // Handle add product actions
      .addCase(addProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.productData = action.payload;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      })

      // Handle fetch products actions
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Failed to fetch products";
      })

      // Handle update product actions
      .addCase(updateProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.productData = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Failed to update product";
      });
  },
});

export const { resetAddProductState, resetDeleteProductState } =
  addProductSlice.actions;
export default addProductSlice.reducer;
