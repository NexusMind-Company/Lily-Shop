import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async action to add products to a shop
export const addProduct = createAsyncThunk(
  "addProduct/addProduct",
  async ({ shop_id, products }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      products.forEach((product, index) => {
        formData.append(`products[${index}][name]`, product.name);
        formData.append(`products[${index}][price]`, product.price);
        formData.append(`products[${index}][image]`, product.image); // Image must be a File object
      });

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

const addProductSlice = createSlice({
  name: "addProduct",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    productData: null,
  },
  reducers: {
    resetAddProductState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.productData = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { resetAddProductState } = addProductSlice.actions;
export default addProductSlice.reducer;
