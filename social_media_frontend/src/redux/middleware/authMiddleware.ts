import { Middleware } from 'redux';
import { RootState } from '../store';
import Cookies from 'js-cookie';

// Middleware to store auth state in cookies for persistence
export const authMiddleware: Middleware<{}, RootState> = store => next => action => {
  // First, let the action pass through to update the store
  const result = next(action);
  
  // Then, check if the action modified the auth state
  const state = store.getState();
  
  // Login or logout actions will trigger this
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/logout') {
    const { auth } = state;
    
    if (auth.token && auth.user) {
      // Store auth data in cookies (with expiration of 7 days)
      Cookies.set('token', auth.token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('user', JSON.stringify(auth.user), { expires: 7, secure: process.env.NODE_ENV === 'production' });
    } else {
      // Remove auth data from cookies on logout
      Cookies.remove('token');
      Cookies.remove('user');
    }
  }
  
  return result;
}; 