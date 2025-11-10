import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/**
 * ✅ Create new product/post (multipart/form-data)
 * Matches EXACT API schema:
 * name, caption, price, media, in_stock, quantity_available,
 * delivery_info, promotable, hashtags
 */
export const createContent = createAsyncThunk(
  "content/createContent",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const formData = new FormData();

      //  Required
      formData.append("name", payload.name);

      //  Optional (only append if value is not empty)
      if (payload.caption?.trim())
        formData.append("caption", payload.caption);

      if (payload.price !== undefined && payload.price !== "")
        formData.append("price", Number(payload.price));

      //  media (File OR URL string)
      if (payload.media) formData.append("media", payload.media);

      if (payload.in_stock !== undefined)
        formData.append("in_stock", payload.in_stock === true || payload.in_stock === "true");

      if (payload.quantity_available !== undefined && payload.quantity_available !== "")
        formData.append("quantity_available", Number(payload.quantity_available));

      if (payload.delivery_info?.trim())
        formData.append("delivery_info", payload.delivery_info);

      if (payload.promotable !== undefined)
        formData.append("promotable", payload.promotable === true || payload.promotable === "true");

      if (payload.hashtags?.trim())
        formData.append("hashtags", payload.hashtags);

      if (payload.shop_id) formData.append("shop_id", payload.shop_id);



      const response = await api.post("/shops/products/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create content."
      );
    }
  }
);

const contentSlice = createSlice({
  name: "content",
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
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.createdItem = null;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdItem = action.payload;
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetContentState } = contentSlice.actions;
export default contentSlice.reducer;
