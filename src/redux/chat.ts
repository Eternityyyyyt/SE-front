import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
    chatId: number[];
    messages: string[];

}

const initialState: ChatState = {
    chatId: [],
    messages: [],
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addChatId: (state, action: PayloadAction<number>) => {
            state.chatId.push(action.payload);
        },
        removeChatId: (state, action: PayloadAction<number>) => {
            state.chatId = state.chatId.filter(id => id !== action.payload);
        },
        setMessages: (state, action: PayloadAction<string[]>) => {
            state.messages = action.payload;
        },
        resetChat: (state) => {
            state.chatId = [];
            state.messages = [];
        }
    }

});

export const {addChatId, removeChatId, setMessages} = chatSlice.actions;
export default chatSlice.reducer;