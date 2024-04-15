import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FriendState {
    friendName: string;//userName
    friendNickname:string;//nickname
}

const initialState: FriendState = {
    friendName: "",
    friendNickname:"",
};

export const friendSlice = createSlice({
    name: "friend",
    initialState,
    reducers: {
        setFriendNickname:(state, action: PayloadAction<string>) =>{
            state.friendNickname = action.payload;
        },
        setFriendName: (state, action: PayloadAction<string>) => {
            state.friendName = action.payload;
        },
        resetFriend: (state) => {
            state.friendName = "";
            state.friendNickname = "";
        },
    }
});

export const { setFriendName } = friendSlice.actions;
export const { setFriendNickname } = friendSlice.actions;
export default friendSlice.reducer;