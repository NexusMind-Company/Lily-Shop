import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Base API URL – change this to your actual backend base URL
const BASE_URL = "https://lily-shop-backend.onrender.com";

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

// ✅ Fetch comments for a specific product
export const fetchComments = createAsyncThunk(
  "feed/fetchComments",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/shops/products/${productId}/comments/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      return data; // Must be an array of comments
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Post a new comment or reply
export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    try {
      const { postId, parentId, text } = commentData;

      const payload = {
        text,
        parent: parentId || null,
      };

      const response = await fetch(
        `${BASE_URL}/shops/products/${postId}/comment-create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.status}`);
      }

      const data = await response.json();
      return data; // Should return the created comment from backend
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
        state.comments.unshift(newComment);
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
        const newComment = action.payload;
        if (newComment.parentId) {
          findCommentAndAddReply(state.comments, newComment);
        } else {
          state.comments.unshift(newComment);
        }
      })
      .addCase(postComment.rejected, (state, action) => {
        console.error("Failed to post comment:", action.payload);
      });
  },
});

export const { addLocalComment, clearComments } = feedSlice.actions;
export default feedSlice.reducer;
