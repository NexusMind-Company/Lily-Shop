import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductComments,
  fetchContentComments,
  addProductComment,
  addContentComment,
} from "../services/api";
import { mockPosts } from "../components/feed/mockData";

//  set to true to use mockdata
const USE_MOCK_DATA = false;

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

    // This is the live API logic
    try {
      if (itemType === "product") {
        const data = await fetchProductComments(postId);
        return data.results || data;
      } else {
        const data = await fetchContentComments(postId);
        return data.results || data;
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
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
      return { ...commentData, id: `server_${Date.now()}` };
    }

    // This is the live API logic
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
        state.comments = action.payload;
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
