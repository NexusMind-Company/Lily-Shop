import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const createShop = createAsyncThunk(
  "createShop/createShop",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/shops/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const createShopSlice = createSlice({
  name: "createShop",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    success: false,
  },
  reducers: {
    resetCreateShopState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createShop.fulfilled, (state) => {
        state.status = "succeeded";
        state.success = true;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetCreateShopState } = createShopSlice.actions;
export default createShopSlice.reducer;
