import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FriendState {
    friendName: string;//userName
    friendNickname:string;//nickname
    friendAvatar: string;
}

const initialState: FriendState = {
    friendName: "",
    friendNickname:"",
    friendAvatar:"",
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
        setFriendAvatar: (state, action: PayloadAction<string>) => {
            state.friendAvatar = action.payload;
        },
        resetFriend: (state) => {
            state.friendName = "";
            state.friendNickname = "";
            state.friendAvatar = "";
        },
    }
});

export const { setFriendName, setFriendNickname, setFriendAvatar } = friendSlice.actions;
export default friendSlice.reducer;