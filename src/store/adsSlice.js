import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const createAd = createAsyncThunk(
  "ads/createAd",
  async ({ formData, token }, thunkAPI) => {
    try {
      const response = await fetch(
        "https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/ads/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ad");
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAd.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ads.push(action.payload);
      })
      .addCase(createAd.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default adsSlice.reducer;
