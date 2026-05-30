import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductComments,
  fetchContentComments,
  addProductComment,
  addContentComment,
  likeProductComment,
  likeContentComment,
} from "../services/api";
import { mockPosts } from "../components/feed/mockData";

const USE_MOCK_DATA = false;

// Helper to transform flat comment list into nested tree
const nestComments = (comments) => {
  if (!Array.isArray(comments)) {
    return [];
  }

  // Deduplicate comments based on ID first
  const uniqueComments = Array.from(
    new Map(comments.map((item) => [item.id, item])).values(),
  );

  const commentMap = {};
  const roots = [];

  // 1. Initialize map and explicitly ENFORCE replies as a new array
  uniqueComments.forEach((c) => {
    commentMap[c.id] = {
      ...c,
      replies: Array.isArray(c.replies) ? [...c.replies] : [],
    };
  });

  // 2. Build tree using strictly 'parent' (API standard) or fallback 'parentId'
  uniqueComments.forEach((c) => {
    const parentId = c.parent || c.parentId;
    if (parentId && commentMap[parentId]) {
      const parent = commentMap[parentId];
      // Prevent adding the same reply multiple times
      if (!parent.replies.some((r) => r.id === c.id)) {
        parent.replies.push(commentMap[c.id]);
      }
    } else {
      roots.push(commentMap[c.id]);
    }
  });

  return roots;
};

const findCommentAndAddReply = (comments, newComment) => {
  const targetId = newComment.parent || newComment.parentId;
  for (const comment of comments) {
    if (comment.id === targetId) {
      if (!Array.isArray(comment.replies)) {
        comment.replies = [];
      }
      // CHECK: Prevent duplicates before pushing
      const exists = comment.replies.some((r) => r.id === newComment.id);
      if (!exists) {
        comment.replies.push(newComment);
      }
      return true;
    }
    if (
      Array.isArray(comment.replies) &&
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
      comments[i] = {
        ...serverComment,
        replies: Array.isArray(comment.replies) ? comment.replies : [],
      };
      return true;
    }
    if (
      Array.isArray(comment.replies) &&
      findCommentAndReplace(comment.replies, localId, serverComment)
    ) {
      return true;
    }
  }
  return false;
};

const findCommentAndToggleLike = (comments, commentId) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.id === commentId) {
      const isCurrentlyLiked = comment.is_liked;
      comment.is_liked = !isCurrentlyLiked;
      comment.like_count = isCurrentlyLiked
        ? Math.max(0, (comment.like_count || 1) - 1)
        : (comment.like_count || 0) + 1;
      return true;
    }
    if (
      Array.isArray(comment.replies) &&
      findCommentAndToggleLike(comment.replies, commentId)
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

      // Aggressively hunt for the array in the response payload
      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.results)) {
        results = data.results;
      } else if (data && data.data && Array.isArray(data.data.results)) {
        results = data.data.results;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const postComment = createAsyncThunk(
  "feed/postComment",
  async (commentData, { rejectWithValue }) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...commentData, id: `server_${Date.now()}` };
    }

    const { postId, itemType } = commentData;
    const text = commentData.comment_text;
    const parentId = commentData.parent;

    try {
      let data;
      if (itemType === "product") {
        data = await addProductComment(postId, text, parentId);
      } else {
        data = await addContentComment(postId, text, parentId);
      }

      // CRITICAL FIX: The Lily Shop API returns no response body on success.
      if (!data || Object.keys(data).length === 0 || typeof data === "string") {
        return commentData;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const toggleCommentLike = createAsyncThunk(
  "feed/toggleCommentLike",
  async ({ commentId, _postId, itemType }, { dispatch, rejectWithValue }) => {
    // Optimistically update the UI before the server responds
    dispatch(toggleLocalCommentLike(commentId));

    try {
      if (itemType === "product") {
        await likeProductComment(commentId);
      } else {
        await likeContentComment(commentId);
      }
      return { commentId, success: true };
    } catch (error) {
      // Revert the optimistic update if the API call fails
      dispatch(toggleLocalCommentLike(commentId));
      return rejectWithValue(error.message);
    }
  },
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
      const targetId = newComment.parent || newComment.parentId;

      if (targetId) {
        findCommentAndAddReply(state.comments, newComment);
      } else {
        // CHECK: Prevent duplicates at root level
        const exists = state.comments.some((c) => c.id === newComment.id);
        if (!exists) {
          state.comments.unshift(newComment);
        }
      }
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentsStatus = "idle";
      state.commentsError = null;
    },
    toggleLocalCommentLike: (state, action) => {
      findCommentAndToggleLike(state.comments, action.payload);
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
      .addCase(postComment.rejected, (_state, _action) => {
        // Silent failure in Redux state, handled by component if necessary
      })
      .addCase(toggleCommentLike.rejected, (_state, _action) => {
        // Silent failure, optimistic update was already reverted in the thunk
      });
  },
});

export const { addLocalComment, clearComments, toggleLocalCommentLike } =
  feedSlice.actions;
export default feedSlice.reducer;
