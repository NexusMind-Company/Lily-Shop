import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductComments,
  fetchContentComments,
  addProductComment,
  addContentComment,
} from "../services/api";
import { mockPosts } from "../components/feed/mockData";

// Set to true to use mockdata
const USE_MOCK_DATA = false;

// Helper to transform flat comment list into nested tree
const nestComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  
  const commentMap = {};
  const roots = [];

  // 1. Initialize map with all comments and empty replies array
  comments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: c.replies || [] };
  });

  // 2. Build tree by moving children into parents
  comments.forEach((c) => {
    // Check if it has a parent and that parent exists in our map
    if (c.parent && commentMap[c.parent]) {
      commentMap[c.parent].replies.push(commentMap[c.id]);
    } else {
      // If no parent (or parent not found in this batch), it's a root
      roots.push(commentMap[c.id]);
    }
  });

  // Optional: Sort roots/replies by date if needed, though API usually handles basic sort order
  return roots;
};

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

const findCommentAndReplace = (comments, localId, serverComment) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.id === localId) {
      // Preserve existing replies when replacing the temporary local comment
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
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
      const post = mockPosts.find((p) => p.id === postId);
      return post?.commentsData || [];
    }

    // Live API logic
    try {
      let data;
      if (itemType === "product") {
        data = await fetchProductComments(postId);
      } else {
        data = await fetchContentComments(postId);
      }
      // Return the results array (typically paginated 'results')
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to post a new comment or reply
export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
      return { ...commentData, id: `server_${Date.now()}` };
    }

    // Live API logic
    const { postId, itemType, text } = commentData;
    try {
      if (itemType === "product") {
        const data = await addProductComment(postId, text);
        return data;
      } else {
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
    commentsStatus: "idle",
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
      .addCase(fetchComments.pending, (state) => {
        state.commentsStatus = "loading";
        state.commentsError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsStatus = "succeeded";
        // Apply nesting logic here before saving to state
        const rawComments = action.payload;
        state.comments = nestComments(rawComments);
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsStatus = "failed";
        state.commentsError = action.payload;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const serverComment = action.payload;
        const localId = action.meta.arg.id;
        findCommentAndReplace(state.comments, localId, serverComment);
      })
      .addCase(postComment.rejected, (state, action) => {
        console.error("Failed to post comment:", action.payload);
      });
  },
});

export const { addLocalComment, clearComments } = feedSlice.actions;
export default feedSlice.reducer;