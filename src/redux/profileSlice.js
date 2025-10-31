import { createSlice } from "@reduxjs/toolkit";
import { getUserProfile } from "../services/api"; 

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
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;

/**
 * Fetch the authenticated user's profile only
 */
export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(fetchProfileStart());

    const data = await getUserProfile(); // token-based call

    const normalized = {
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        phone_number: data.phone_number,
        profile_pic: data.profile_pic,
        full_name: data.username || data.email?.split("@")[0] || "Unnamed User",
        followers_count: data.follower_count || 0,
        following_count: data.following_count || 0,
        bio: data.bio || null,
      },
      products: data.products || [],
      product_count: data.product_count || (data.products?.length ?? 0),
      shop_count: data.shop_count || 0,
      last_seen: data.last_seen,
    };

    dispatch(fetchProfileSuccess(normalized));
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch profile";

    dispatch(fetchProfileFailure(message));
  }
};

/**
 * Reset profile on logout
 */
export const resetProfile = () => (dispatch) => {
  dispatch(clearProfile());
};
