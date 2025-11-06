import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductComments,
  fetchContentComments,
  addProductComment,
  addContentComment,
} from "../services/api";

// Set this to false to use your live API
const USE_MOCK_DATA = false;

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
// Helper to recursively find a comment by its local ID and replace it
const findCommentAndReplace = (comments, localId, serverComment) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.id === localId) {
      comments[i] = { ...serverComment, replies: comment.replies || [] };
      return true;
    }
    if (
      comment.replies &&
      findCommentAndReplace(comment.replies, localId, serverComment)
    ) {
      return true;
    }
  }
  return false;
};

// Async thunk to fetch comments
export const fetchComments = createAsyncThunk(
  "feed/fetchComments",
  async ({ postId, itemType }, { rejectWithValue }) => {
    // This payload matches what we dispatched from CommentsModal.jsx

    if (USE_MOCK_DATA) {
      console.log("Using mock comments");
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Mock data logic just in case you need it
      // const post = mockPosts.find((p) => p.id === postId);
      // return post?.commentsData || [];
      return []; // Return empty for now if mock
    }

    try {
      if (itemType === "product") {
        const data = await fetchProductComments(postId);
        return data;
      } else {
        // Assumes any other type is 'content'.
        const data = await fetchContentComments(postId);
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to post a new comment or reply
export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    // commentData contains { postId, itemType, text, ... }

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...commentData, id: `server_${Date.now()}` };
    }

    // Destructure the data your API functions need
    const { postId, itemType, text } = commentData;

    try {
      if (itemType === "product") {
        const data = await addProductComment(postId, text);
        return data;
      } else {
        // addContentComment needs the 'contentId' (which is postId) and the comment text
        const data = await addContentComment(postId, text);
        return data;
      }
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
        // action.payload is the REAL comment from the server
        // action.meta.arg is the TEMPORARY comment we sent
        const serverComment = action.payload;
        const localId = action.meta.arg.id; // Get the local ID (e.g., "local_12345")

        // Find and replace the temporary comment with the real one
        findCommentAndReplace(state.comments, localId, serverComment);
      })
      .addCase(postComment.rejected, (state, action) => {
        console.error("Failed to post comment:", action.payload);
        // You could add logic to find the local comment and mark it as 'failed'
      });
  },
});

export const { addLocalComment, clearComments } = feedSlice.actions;
export default feedSlice.reducer;
