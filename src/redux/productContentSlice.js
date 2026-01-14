import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/**
 * PRODUCT POST FORMAT
 * name: string
 * caption: string or null
 * price: integer or null
 * media: File | Blob | string | null
 * in_stock: boolean
 * quantity_available: integer
 * delivery_info: string or null
 * promotable: boolean
 * hashtags: string or null
 */

export const createProductContent = createAsyncThunk(
  "content/createProductContent",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      console.log("token:", token);

      const formData = new FormData();

      // required
      formData.append("name", payload.name?.trim() || "Untitled Product");

      // optional strings
      formData.append("caption", payload.caption?.trim() || "");
      formData.append("delivery_info", payload.delivery_info?.trim() || "");
      formData.append("hashtags", payload.hashtags?.trim() || "");

      // price
      const priceValue =
        payload.price !== undefined && payload.price !== ""
          ? String(Number(payload.price))
          : "";
      formData.append("price", priceValue);

      // media
      if (payload.media instanceof File || payload.media instanceof Blob) {
        formData.append("media", payload.media);
      } else if (typeof payload.media === "string" && payload.media.trim() !== "") {
        formData.append("media_url", payload.media);
      } else {
        formData.append("media_url", "");
      }

      // booleans
      formData.append("in_stock", String(Boolean(payload.in_stock)));
      formData.append("promotable", String(Boolean(payload.promotable)));

      // quantity
      const quantityValue =
        payload.quantity_available !== undefined && payload.quantity_available !== ""
          ? String(Number(payload.quantity_available))
          : "0";
      formData.append("quantity_available", quantityValue);

      console.log(
        "sending PRODUCT to backend:",
        Object.fromEntries(formData.entries())
      );

      const response = await api.post("/shops/products/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("Product post failed:", error.response || error);
      return rejectWithValue(
        error.response?.data || "Failed to create product content."
      );
    }
  }
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
