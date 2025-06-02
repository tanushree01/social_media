import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
  isFollowing?: boolean;
}

interface UsersState {
  allUsers: User[];
  following: User[];
  followers: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  allUsers: [],
  following: [],
  followers: [],
  isLoading: false,
  error: null,
};

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const allUsers = await response.json();
      
      // Get following list
      const followingResponse = await fetch('/api/follows/following', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!followingResponse.ok) {
        const errorData = await followingResponse.json();
        return rejectWithValue(errorData.message || 'Failed to fetch following list');
      }

      const followingData = await followingResponse.json();
      const followingIds = followingData.map((follow: any) => follow.Following._id);

      // Mark users as following
      const usersWithFollowingStatus = allUsers.map((user: User) => ({
        ...user,
        isFollowing: followingIds.includes(user._id),
      }));

      return usersWithFollowingStatus;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Follow a user
export const followUser = createAsyncThunk(
  'users/follow',
  async ({ userId, token }: { userId: number; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/follows/user/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to follow user');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Unfollow a user
export const unfollowUser = createAsyncThunk(
  'users/unfollow',
  async ({ userId, token }: { userId: number; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/follows/user/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to unfollow user');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Fetch following users
export const fetchFollowing = createAsyncThunk(
  'users/fetchFollowing',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/follows/following', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch following list');
      }

      const followingData = await response.json();
      // Extract actual user data from the following response
      const following = followingData.map((follow: any) => ({
        ...follow.Following,
        isFollowing: true,
      }));

      return following;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Fetch followers
export const fetchFollowers = createAsyncThunk(
  'users/fetchFollowers',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/follows/followers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch followers list');
      }

      const followersData = await response.json();
      // Extract actual user data from the followers response
      const followers = followersData.map((follow: any) => follow.Follower);

      return followers;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    filterUsers: (state, action) => {
      // Search is handled in the component, but could be moved here
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Follow user
      .addCase(followUser.fulfilled, (state, action) => {
        const userId = action.payload;
        const user = state.allUsers.find(u => u._id === userId);
        if (user) {
          user.isFollowing = true;
        }

        // Also update in the followers list
        const follower = state.followers.find(u => u._id === userId);
        if (follower) {
          follower.isFollowing = true;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Unfollow user
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const userId = action.payload;
        const user = state.allUsers.find(u => u._id === userId);
        if (user) {
          user.isFollowing = false;
        }

        // Also update in the followers list
        const follower = state.followers.find(u => u._id === userId);
        if (follower) {
          follower.isFollowing = false;
        }

        // Remove from following list
        state.following = state.following.filter(user => user._id !== userId);
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch following
      .addCase(fetchFollowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch followers
      .addCase(fetchFollowers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;

export default usersSlice.reducer; 