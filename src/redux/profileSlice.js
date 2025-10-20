import { createSlice } from "@reduxjs/toolkit";

export const profileSlice = createSlice({
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

export const { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } = profileSlice.actions;
export default profileSlice.reducer;

export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(fetchProfileStart());
    const response = await fetch("/api/profile");
    const data = await response.json();
    dispatch(fetchProfileSuccess(data));
  } catch (error) {
    dispatch(fetchProfileFailure(error.toString()));
  }
};
