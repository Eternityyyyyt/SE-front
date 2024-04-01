import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string;
    name: string;
    nickname: string;
    phoneNumber: string;
    email: string;
}

const initialState: AuthState = {
    token: "",
    name: "",
    nickname: "",
    phoneNumber: "",
    email: "",
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        setNickname: (state, action: PayloadAction<string>) => {
            state.nickname = action.payload;
        },
        setPhoneNumber: (state, action: PayloadAction<string>) => {
            state.phoneNumber = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        resetAuth: (state) => {
            state.token = "";
            state.name = "";
            state.phoneNumber = "";
            state.email= "";
        },
    },
});

export const { setToken, setName, setNickname, setPhoneNumber, setEmail, resetAuth } = authSlice.actions;
export default authSlice.reducer;
