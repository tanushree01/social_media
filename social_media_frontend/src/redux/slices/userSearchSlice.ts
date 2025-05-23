import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
  bio?: string;
}

interface UserSearchState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserSearchState = {
  users: [],
  isLoading: false,
  error: null,
};

export const searchUsers = createAsyncThunk(
  'users/search',
  async ({ query, token }: { query: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to search users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const userSearchSlice = createSlice({
  name: 'userSearch',
  initialState,
  reducers: {
    clearUserSearch: (state) => {
      state.users = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserSearch } = userSearchSlice.actions;

export default userSearchSlice.reducer; 