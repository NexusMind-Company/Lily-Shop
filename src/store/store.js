import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import shopReducer from "./shopSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        shops: shopReducer,
    }
})