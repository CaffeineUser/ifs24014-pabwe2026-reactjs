import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/states/authSlice';
import usersReducer from './features/users/states/usersSlice';
import lostFoundReducer from './features/lost-founds/states/lostFoundSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    lostFounds: lostFoundReducer,
  },
});

export default store;
