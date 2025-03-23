import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import shopReducer from "./shopSlice";
import createShopReducer from "./createShopSlice";
import { setAuthToken } from "../services/api";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    shops: shopReducer,
    createShop: createShopReducer,
  },
});

//Set the token initially when the app loads
const initialState = store.getState();
const token = initialState.auth?.user_data?.token?.access;
setAuthToken(token);

//Listen for changes to auth state
store.subscribe(() => {
  const state = store.getState();
  const newToken = state.auth?.user_data?.token?.access;
  setAuthToken(newToken);
});
