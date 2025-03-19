import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Async thunk to create a shop
export const createShop = createAsyncThunk(
  "createShop/createShop",
  async (formData, { rejectWithValue }) => {
    try {
      const userData = localStorage.getItem("user_data");
      if (!userData) {
        throw new Error("No user data found in localStorage. Please log in.");
      }

      const parsedUserData = JSON.parse(userData);
      const token = parsedUserData?.token?.access;

      if (!token) {
        throw new Error("No access token found in user data.");
      }

      const response = await axios.post(`${API_BASE_URL}/shops/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

const createShopSlice = createSlice({
  name: "createShop",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    shopData: null,
  },
  reducers: {
    resetCreateShopState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.shopData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.shopData = action.payload;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetCreateShopState } = createShopSlice.actions;
export default createShopSlice.reducer;
