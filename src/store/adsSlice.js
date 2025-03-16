import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create async thunk for creating an ad
export const createAd = createAsyncThunk(
  "ads/createAd",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ads/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ad");
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
