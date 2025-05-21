import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

// Enhanced dispatch that properly handles thunks
type ThunkAppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<ThunkAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 