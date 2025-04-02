import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import shopReducer from "./shopSlice";
import createShopReducer from "./createShopSlice";
import profileReducer from "./profileSlice";
import addProductReducer from "./addProductSlice";
import deleteShopReducer from "./deleteShopSlice";
import adsReducer from "./adsSlice";
import passwordReducer from "./passwordSlice";
import { setAuthToken } from "../services/api";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    shops: shopReducer,
    createShop: createShopReducer,
    profile: profileReducer,
    addProduct: addProductReducer,
    deleteShop: deleteShopReducer,
    ads: adsReducer,
    password: passwordReducer,
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
