import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/**
 * FUN POST FORMAT
 * caption: string or null
 * hashtags: string or null
 * media: File | Blob | string | null
 * location: string or null
 */

export const createFunContent = createAsyncThunk(
  "content/createFunContent",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const formData = new FormData();

      formData.append("caption", payload.caption?.trim() || "");
      formData.append("hashtags", payload.hashtags?.trim() || "");
      formData.append("location", payload.location?.trim() || "");

      // media
      if (payload.media instanceof File || payload.media instanceof Blob) {
        formData.append("media", payload.media);
      } else if (typeof payload.media === "string" && payload.media.trim() !== "") {
        formData.append("media_url", payload.media);
      } else {
        formData.append("media_url", "");
      }

      console.log("sending FUN content to backend:", Object.fromEntries(formData.entries()));

      const response = await api.post("/shops/contents/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("Fun content failed:", error.response || error);
      return rejectWithValue(error.response?.data || "Failed to create fun content.");
    }
  }
);

const funContentSlice = createSlice({
  name: "funContent",
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
      .addCase(createFunContent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.createdItem = null;
      })
      .addCase(createFunContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdItem = action.payload;
      })
      .addCase(createFunContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetContentState } = funContentSlice.actions;
export default funContentSlice.reducer;
