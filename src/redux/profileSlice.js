
import { createSlice } from "@reduxjs/toolkit";
import { getAuthProfile } from "../services/api";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    fetchProfileFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} = profileSlice.actions;

export default profileSlice.reducer;

// Async thunk
export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(fetchProfileStart());
    const data = await getAuthProfile();
    dispatch(fetchProfileSuccess(data));
  } catch (error) {
    const message =
      error.response?.data?.detail || error.message || "Failed to fetch profile";
    dispatch(fetchProfileFailure(message));
  }
};
