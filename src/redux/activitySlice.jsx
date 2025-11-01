import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

//  Async thunk: Fetch *all* user activities (flattened, all pages)
export const fetchActivities = createAsyncThunk(
  "activity/fetchActivities",
  async (_, { rejectWithValue }) => {
    try {
      //  Attach Authorization header
      const token = localStorage.getItem("access_token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No access token found");
      }

      let allActivities = [];
      let nextUrl = "/activities/";

      // Keep fetching until no more pages
      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;
        allActivities = [...allActivities, ...(data.results || [])];

        nextUrl = data.next
          ? new URL(data.next).pathname + new URL(data.next).search
          : null;
      }

      return allActivities; // Flattened list
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to load activities"
      );
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearActivities: (state) => {
      state.activities = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload || [];
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearActivities } = activitySlice.actions;

export default activitySlice.reducer;
