import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductComments,
  fetchContentComments,
  addProductComment,
  addContentComment,
} from "../services/api";
import { mockPosts } from "../components/feed/mockData";

const USE_MOCK_DATA = false;

// Helper to transform flat comment list into nested tree
const nestComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  
  // Deduplicate comments based on ID first
  const uniqueComments = Array.from(new Map(comments.map(item => [item.id, item])).values());

  const commentMap = {};
  const roots = [];

  // 1. Initialize map
  uniqueComments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: c.replies || [] };
  });

  // 2. Build tree
  uniqueComments.forEach((c) => {
    if (c.parent && commentMap[c.parent]) {
      // Prevent adding the same reply multiple times
      const parent = commentMap[c.parent];
      if (!parent.replies.find(r => r.id === c.id)) {
        parent.replies.push(commentMap[c.id]);
      }
    } else {
      roots.push(commentMap[c.id]);
    }
  });

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

export const fetchComments = createAsyncThunk(
  "feed/fetchComments",
  async ({ postId, itemType }, { rejectWithValue }) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const post = mockPosts.find((p) => p.id === postId);
      return post?.commentsData || [];
    }

    try {
      let data;
      if (itemType === "product") {
        data = await fetchProductComments(postId);
      } else {
        data = await fetchContentComments(postId);
      }
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...commentData, id: `server_${Date.now()}` };
    }

    const { postId, itemType, text, parentId } = commentData;
    try {
      if (itemType === "product") {
        const data = await addProductComment(postId, text, parentId);
        return data;
      } else {
        const data = await addContentComment(postId, text, parentId);
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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