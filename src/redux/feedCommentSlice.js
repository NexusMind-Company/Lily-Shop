import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Assuming you have an API service and mock data configured
// import api from "../services/api";
import { mockPosts } from "../components/feed/mockData";

const USE_MOCK_DATA = true;

// Helper to recursively find a parent comment and add a reply
const findCommentAndAddReply = (comments, newComment) => {
  for (const comment of comments) {
    if (comment.id === newComment.parentId) {
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.replies.push(newComment);
      return true;
    }
    if (
      comment.replies &&
      findCommentAndAddReply(comment.replies, newComment)
    ) {
      return true;
    }
  }
  return false;
};

// Async thunk to fetch comments
export const fetchComments = createAsyncThunk(
  "feed/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        const post = mockPosts.find((p) => p.id === postId);
        return post?.commentsData || [];
      }
      // const response = await api.get(`/posts/${postId}/comments`);
      // return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to post a new comment or reply
export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
        // In a real API, the backend would return the complete, saved comment object
        return { ...commentData, id: `server_${Date.now()}` }; // Return a "server-confirmed" ID
      }
      // const response = await api.post(`/posts/${commentData.postId}/comments`, commentData);
      // return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    comments: [],
    commentsStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    commentsError: null,
  },
  reducers: {
    addLocalComment: (state, action) => {
      const newComment = action.payload;
      if (newComment.parentId) {
        findCommentAndAddReply(state.comments, newComment);
      } else {
        state.comments.unshift(newComment); // Add top-level comments to the top
      }
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentsStatus = "idle";
      state.commentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.commentsStatus = "loading";
        state.commentsError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsStatus = "succeeded";
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsStatus = "failed";
        state.commentsError = action.payload;
      })
      // Post Comment
      .addCase(postComment.fulfilled, (state, action) => {
        // The optimistic update is already done by `addLocalComment`.
        // You could optionally replace the local comment with the server-returned one if IDs differ.
        console.log("Comment posted successfully:", action.payload);
      })
      .addCase(postComment.rejected, (state, action) => {
        console.error("Failed to post comment:", action.payload);
        // Here you would add logic to handle the UI feedback for the failure.
        // For example, finding the optimistic comment and marking it as "failed to send".
      });
  },
});

export const { addLocalComment, clearComments } = feedSlice.actions;
export default feedSlice.reducer;
