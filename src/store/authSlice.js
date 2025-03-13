import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    isAuthenticated: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.isAuthenticated = true
            localStorage.setItem('token', JSON.stringify(action.payload.token))

            // console.log(localStorage);
        },

        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false
            localStorage.removeItem('token')
            // console.log(localStorage)
        }
    }
}
)
export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer