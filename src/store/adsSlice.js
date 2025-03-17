import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create async thunk for creating an ad
export const createAd = createAsyncThunk(
  "ads/createAd",
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

      const response = await fetch(`${API_BASE_URL}/ads/create`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create ad");
        } else {
          throw new Error("Unexpected response from the server");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.push(action.payload);
        state.success = true;
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSuccess } = adsSlice.actions;
export default adsSlice.reducer;