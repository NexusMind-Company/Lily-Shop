import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import shopReducer from "./shopSlice";
import createShopReducer from "./createShopSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        shops: shopReducer,
        createShop: createShopReducer,
    }
})
