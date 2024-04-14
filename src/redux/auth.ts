import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string;
    name: string;
    nickname: string;
    phoneNumber: string;
    email: string;
    // 存储在前端的聊天记录
    chatId: number[];
    messages: Record<number, string[]>;
}

const initialState: AuthState = {
    token: "",
    name: "",
    nickname: "",
    phoneNumber: "",
    email: "",

    chatId: [],
    messages: {},
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

        // 增加chat相关的功能
        addChatId: (state, action: PayloadAction<number>) => {
            state.chatId.push(action.payload);
            state.messages[action.payload] = []; // 添加一个空的消息列表
        },
        removeChatId: (state, action: PayloadAction<number>) => {
            state.chatId = state.chatId.filter(id => id !== action.payload);
            delete state.messages[action.payload]; // 移除对应的消息列表
        },
        addMessage: (state, action: PayloadAction<{ chatId: number; message: string }>) => {
            const { chatId, message } = action.payload;
            state.messages[chatId].push(message); // 添加消息到对应的消息列表中
        },
        resetChat: (state) => {
            state.chatId = [];
            state.messages = {};
        }
    },
});

export const { setToken, setName, setNickname, setPhoneNumber, setEmail, resetAuth, addChatId, removeChatId, addMessage, resetChat } = authSlice.actions;
export default authSlice.reducer;
