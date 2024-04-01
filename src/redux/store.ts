import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth';

export interface RootState {
    auth: ReturnType<typeof authReducer>;
}

const store = configureStore({
    reducer: {
        auth: authReducer,
    }
});

export default store;