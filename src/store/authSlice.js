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
            localStorage.setItem('token', action.payload.token)
            localStorage.setItem('username', action.payload.username)

            // console.log(localStorage);
        },

        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('username')

            // console.log(localStorage)
        }
    }
}
)
export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer