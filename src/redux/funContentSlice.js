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

      // Ensure fields aren't just empty strings if you want to avoid blank posts
      formData.append("caption", payload.caption || "");
      formData.append("hashtags", payload.hashtags || "");
      formData.append("location", payload.location || "");
      formData.append("post_type", "FUN");

      // Handle the media array from CreatePost.jsx state
      if (Array.isArray(payload.media)) {
        payload.media.forEach((item) => {
          // In CreatePost.jsx, media items are stored as { file, url, type }
          if (item.file instanceof File) {
            formData.append("media", item.file);
          }
        });
      }
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
