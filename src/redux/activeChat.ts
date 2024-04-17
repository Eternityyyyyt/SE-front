import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface activeChatId {
    chat_id: number | null;//chat id displaying in chatbox
}

const initialState: activeChatId = {
    chat_id: null,
};

export const activeChatSlice = createSlice({
    name: "activeChat",
    initialState,
    reducers: {
        setActiveChat:(state, action: PayloadAction<number | null>) =>{
            state.chat_id= action.payload;
        },
    }
});

export const { setActiveChat } = activeChatSlice.actions;
export default activeChatSlice.reducer;