import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth';
import friendReducer from './friend';

export interface RootState {
    auth: ReturnType<typeof authReducer>;
    friend: ReturnType<typeof friendReducer>;
}

const store = configureStore({
    reducer: {
        auth: authReducer,
        friend: friendReducer,
    }
});

export default store;