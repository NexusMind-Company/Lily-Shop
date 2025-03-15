import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user_data: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user_data = action.payload.user_data;
      state.isAuthenticated = true;
      localStorage.setItem(
        "user_data",
        JSON.stringify(action.payload.user_data)
      );

      // console.log(localStorage);
    },

    logout: (state) => {
      state.user_data = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user_data");
      // console.log(localStorage)
    },
  },
});
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
