import { Middleware, Action, AnyAction } from 'redux';
import { RootState } from '../store';

// Middleware to store auth state in localStorage for persistence
export const authMiddleware: Middleware = store => next => action => {
  // First, let the action pass through to update the store
  const result = next(action);
  
  // Then, check if the action modified the auth state
  const state = store.getState() as RootState;
  
  // Login or logout actions will trigger this
  if (
    typeof action === 'object' && 
    action !== null && 
    'type' in action && 
    (action.type === 'auth/login/fulfilled' || action.type === 'auth/logout')
  ) {
    const { auth } = state;
    
    if (auth.token && auth.user) {
      // Store auth data in localStorage
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    } else {
      // Remove auth data from localStorage on logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  return result;
}; 