import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import shopReducer from "./shopSlice";
import createShopReducer from "./createShopSlice";
import profileReducer from "./profileSlice";
import addProductReducer from "./addProductSlice";
import deleteShopReducer from "./deleteShopSlice";
import adsReducer from "./adsSlice";
import passwordResetReducer from "./passwordResetSlice";
import cartReducer from "./cartSlice";
import createUserReducer from "./createUserSlice";
import verifyEmailReducer from "./verifyEmailSlice";
import walletReducer from "./walletSlice";
import messageReducer from "./messageConversationSlice";
import orderReducer from "./orderSlice";
import activitiesReducer from "./activitySlice";
import contentReducer from "./contentSlice";
import feedReducer from "./feedCommentSlice";

import { setAuthTokens } from "../services/api";

// --- Configure Redux Store ---
export const store = configureStore({
  reducer: {
    auth: authReducer,
    shops: shopReducer,
    createShop: createShopReducer,
    profile: profileReducer,
    addProduct: addProductReducer,
    deleteShop: deleteShopReducer,
    feedComments: feedReducer,
    ads: adsReducer,
    messages: messageReducer,
    passwordReset: passwordResetReducer,
    cart: cartReducer,
    content: contentReducer,
    createUser: createUserReducer,
    verifyEmail: verifyEmailReducer,
    wallet: walletReducer,
    orders: orderReducer,
    activities: activitiesReducer,
  },
});

// --- Initialize Auth Tokens Safely ---
const initializeTokens = () => {
  try {
    const state = store.getState();
    const tokenData = state.auth?.user_data?.token;

    if (tokenData?.access || tokenData?.refresh) {
      setAuthTokens({
        access: tokenData.access,
        refresh: tokenData.refresh,
      });
    }
  } catch (err) {
    console.error("Failed to initialize auth tokens:", err);
  }
};

initializeTokens();

// --- Listen for Auth State Changes ---
store.subscribe(() => {
  try {
    const state = store.getState();
    const newTokenData = state.auth?.user_data?.token;

    if (newTokenData?.access || newTokenData?.refresh) {
      setAuthTokens({
        access: newTokenData.access,
        refresh: newTokenData.refresh,
      });
    }
  } catch (err) {
    console.error("Error updating tokens:", err);
  }
});

export default store;
