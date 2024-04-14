import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth';
import friendReducer from './friend';
import chatReducer from './chat';

export interface RootState {
    auth: ReturnType<typeof authReducer>;
    friend: ReturnType<typeof friendReducer>;
    chat: ReturnType<typeof chatReducer>;
}

const store = configureStore({
    reducer: {
        auth: authReducer,
        friend: friendReducer,
        chat: chatReducer,
    }
});

export default store;