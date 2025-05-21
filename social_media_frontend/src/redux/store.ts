import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import usersReducer from './slices/usersSlice';
import { authMiddleware } from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(authMiddleware),
  // This ensures Redux state persists during SSR/SSG with Next.js
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 