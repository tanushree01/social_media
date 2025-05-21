import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Try to get initial state from cookies (client-side only)
let user = null;
let token = null;

if (typeof window !== 'undefined') {
  const storedToken = Cookies.get('token');
  const storedUser = Cookies.get('user');
  
  if (storedToken) {
    token = storedToken;
  }
  
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      Cookies.remove('user');
    }
  }
}

const initialState: AuthState = {
  user,
  token,
  isLoading: false,
  error: null,
  isAuthenticated: !!token,
};

// Async thunks for login, register, and other auth actions
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    {
      userId, 
      profileData, 
      token
    }: { 
      userId: number; 
      profileData: { name?: string; bio?: string }; 
      token: string 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'auth/updateProfilePicture',
  async (
    {
      userId, 
      imageFile, 
      token
    }: { 
      userId: number; 
      imageFile: File; 
      token: string 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await fetch(`/api/users/profile/${userId}/picture`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Profile picture update failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile Picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload.profilePicture) {
          state.user.profilePicture = action.payload.profilePicture;
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export default authSlice.reducer; 