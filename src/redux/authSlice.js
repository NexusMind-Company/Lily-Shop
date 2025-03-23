import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "./profileSlice";

const initialState = {
  user_data: (() => {
    const storedData = localStorage.getItem("user_data");
    try {
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Error parsing stored user_data:", error);
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem("user_data"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      let userData = action.payload.user_data;

      if (typeof userData === "string") {
        try {
          userData = JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing userData:", error);
        }
      }

      state.user_data = userData;
      state.isAuthenticated = true;
      localStorage.setItem("user_data", JSON.stringify(userData));
    },

    logout: (state) => {
      state.user_data = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user_data");
    },
  },
});

// Thunk to handle login and trigger profile fetch
export const handleLogin = (userData) => (dispatch) => {
  dispatch(loginSuccess({ user_data: userData }));
  dispatch(fetchProfile());
};

// Thunk to handle logout and reset profile
export const handleLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(fetchProfile());
};

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
