import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth';
import friendReducer from './friend';
import activeChatReducer from './activeChat';
export interface RootState {
    auth: ReturnType<typeof authReducer>;
    friend: ReturnType<typeof friendReducer>;
    activeChat: ReturnType<typeof activeChatReducer>;
}

const store = configureStore({
    reducer: {
        auth: authReducer,
        friend: friendReducer,
        activeChat: activeChatReducer,
    }
});

export default store;