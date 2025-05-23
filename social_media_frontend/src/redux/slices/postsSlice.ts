import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: number;
  User: User;
  comments?: Comment[];
  likes?: { userId: number }[];
  Comments?: Comment[];
  Likes?: { userId: number }[];
  likeCount: number;
  commentCount: number;
}

interface PostsState {
  feedPosts: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  feedPosts: [],
  userPosts: [],
  currentPost: null,
  isLoading: false,
  error: null,
};

// Fetch all posts for feed
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch posts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Fetch user's posts
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/posts/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch user posts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (
    { content, image, token }: { content: string; image: File | null; token: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Delete a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async ({ postId, token }: { postId: number; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete post');
      }

      return postId;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Like or unlike a post
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, token, userId }: { postId: number; token: string; userId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/likes/post/${postId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to toggle like');
      }

      const data = await response.json();
      // Return the data from API which includes postId, userId, liked status, and likeCount
      return { 
        postId, 
        userId, 
        likeCount: data.likeCount || 0 
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Add a comment to a post
export const addComment = createAsyncThunk(
  'posts/addComment',
  async (
    { postId, content, token, user }: { postId: number; content: string; token: string; user: User },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/comments/post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to add comment');
      }

      const data = await response.json();
      
      // Create a comment object to add to the UI
      const newComment: Comment = {
        id: data.comment.id,
        content,
        createdAt: new Date().toISOString(),
        user,
      };

      // Return including commentCount from API response
      return { 
        postId, 
        comment: newComment,
        commentCount: data.commentCount || 0
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = action.payload;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts.unshift({...action.payload?.post,User:action.payload?.User});
        state.userPosts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = state.feedPosts.filter((post) => post.id !== action.payload);
        state.userPosts = state.userPosts.filter((post) => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, userId, likeCount } = action.payload;

        [state.feedPosts, state.userPosts].forEach(posts => {
          const post = posts.find(p => p.id === postId);
          if (post) {
            if (!post.likes) {
              post.likes = [];
            }

            const isLiked = post.likes.some(like => like.userId === userId);

            if (isLiked) {
              post.likes = post.likes.filter(like => like.userId !== userId);
            } else {
              post.likes.push({ userId });
            }

            // Update the likeCount from API response
            post.likeCount = likeCount;
          }
        });
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment, commentCount } = action.payload;
        
        // Update both feed and user posts
        [state.feedPosts, state.userPosts].forEach(posts => {
          const post = posts.find(p => p.id === postId);
          if (post) {
            if (!post.comments) {
              post.comments = [];
            }
            post.comments.unshift(comment);
            
            // Update the commentCount from API response
            post.commentCount = commentCount;
          }
        });
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearPostsError } = postsSlice.actions;

export default postsSlice.reducer; 