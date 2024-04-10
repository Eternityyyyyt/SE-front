import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FriendState {
    friendName: string;
}

const initialState: FriendState = {
    friendName: "",
};

export const friendSlice = createSlice({
    name: "friend",
    initialState,
    reducers: {
        setFriendName: (state, action: PayloadAction<string>) => {
            state.friendName = action.payload;
        },
        resetFriend: (state) => {
            state.friendName = "";
        },
    }
});

export const { setFriendName } = friendSlice.actions;
export default friendSlice.reducer;