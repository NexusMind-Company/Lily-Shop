import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// ✅ Fetch all user-created content (posts/products)
export const fetchUserContent = createAsyncThunk(
  "content/fetchUserContent",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.get("/shops/products/create/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user content."
      );
    }
  }
);

// ✅ Create new content (post or product)
export const createContent = createAsyncThunk(
  "content/createContent",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.post("/shops/products/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    items: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetContentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch user content ---
      .addCase(fetchUserContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchUserContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create new content ---
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetContentState } = contentSlice.actions;
export default contentSlice.reducer;
