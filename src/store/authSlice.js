import { createSlice } from "@reduxjs/toolkit";

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

      // Ensure the data isn't already stringified
      if (typeof userData === "string") {
        try {
          userData = JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing userData:", error);
        }
      }

      state.user_data = userData;
      state.isAuthenticated = true;

      // Store correctly in localStorage
      localStorage.setItem("user_data", JSON.stringify(userData));

      /*console.log(
        "Stored data in localStorage:",
        localStorage.getItem("user_data")
      );*/
    },

    logout: (state) => {
      state.user_data = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user_data");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
