import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import shopReducer from "./shopSlice";
import createShopReducer from "./createShopSlice";
import profileReducer from "./profileSlice";
import addProductReducer from "./addProductSlice";
import deleteShopReducer from "./deleteShopSlice";
import adsReducer from "./adsSlice";
import passwordReducer from "./passwordSlice";
import cartReducer from "./cartSlice";
import contentReducer from "./contentSlice";
import createUserReducer from "./createUserSlice";
import verifyEmailReducer from "./verifyEmailSlice";
import walletReducer from "./walletSlice";
import messagesReducer from "./messageSlice";
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
    cart: cartReducer,
    content: contentReducer,
    createUser: createUserReducer,
    verifyEmail: verifyEmailReducer,
    wallet: walletReducer,
    messages: messagesReducer,
  },
});

//  Set the token initially when the app loads
const initialState = store.getState();
const token = initialState.auth?.user_data?.token?.access;
setAuthToken(token);

//  Listen for changes to auth state and update token dynamically
store.subscribe(() => {
  const state = store.getState();
  const newToken = state.auth?.user_data?.token?.access;
  setAuthToken(newToken);
});
