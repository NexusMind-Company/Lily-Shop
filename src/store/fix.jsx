/*import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Async thunk to create a shop
export const createShop = createAsyncThunk(
  "createShop/createShop",
  async (formData, { rejectWithValue }) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data")) || {};
      const token = userData?.token?.access || "";

      if (!token) {
        throw new Error("Unauthorized - No token found");
      }

      const response = await axios.post(`${API_BASE_URL}/shops/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; // Return created shop data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

// Slice for managing createShop state
const createShopSlice = createSlice({
  name: "createShop",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    success: false,
    shopData: null, // Stores created shop details
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
        state.shopData = action.payload; // Store response data
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


/**
 * import { configureStore } from "@reduxjs/toolkit";
 import authSlice from "./authSlice";
 import shopReducer from "./shopSlice";
 import createShopReducer from "./createShopSlice";
 
 export const store = configureStore({
   reducer: {
     auth: authSlice,
     shops: shopReducer,
     createShop: createShopReducer,
   },
 });
 
 */

/**
 * import { createSlice } from "@reduxjs/toolkit";
 
 const initialState = {
     user_data: null,
     isAuthenticated: false
 };
 
 const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers: {
         loginSuccess: (state, action) => {
             state.user_data = action.payload.user_data;
             state.isAuthenticated = true
             localStorage.setItem('user_data', JSON.stringify(action.payload.user_data))
 
             // console.log(localStorage);
         },
 
         logout: (state) => {
             state.user_data = null;
             state.isAuthenticated = false
             localStorage.removeItem('user_data')
             // console.log(localStorage)
         }
     }
 }
 )
 export const { loginSuccess, logout } = authSlice.actions
 export default authSlice.reducer */
