import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

// Fetch paginated messages but flatten into one list
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/messages/user/${userId}/?page=${page}`);

      return {
        messages: res.data.results || res.data, // Handle paginated or non-paginated response
        nextPage: res.data.next,
        page,
        userId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch messages");
    }
  }
);

// Fetch all conversations for showing inbox list
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/messages/conversations/");
      // Handle paginated or non-paginated response
      const data = res.data.results ? res.data.results : res.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch conversations");
    }
  }
);

// Send Message API
export const sendMessageToUser = createAsyncThunk(
  "messages/sendMessageToUser",
  async ({ userId, content, product_id = null }, { rejectWithValue }) => {
    try {
      const payload = { recipient: userId, content };
      if (product_id) payload.product_id = product_id;

      const res = await api.post(`/messages/`, payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send message");
    }
  }
);

// Start or get existing conversation from a product
export const startConversation = createAsyncThunk(
  "messages/startConversation",
  async ({ productId, message = "" }, { rejectWithValue }) => {
    try {
      const payload = { product_id: productId };
      if (message) payload.message = message;

      const res = await api.post("/messages/conversations/start/", payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to start conversation");
    }
  }
);

const messageConversationSlice = createSlice({
  name: "messageConversation",
  initialState: {
    messages: [],
    conversations: [], // List of all user conversations
    conversationsLoading: false,
    loading: false,
    sending: false,
    error: null,
    nextPage: null,
    currentPage: 1,
    activeChatUser: null,
  },
  reducers: {
    clearConversation: (state) => {
      state.messages = [];
      state.nextPage = null;
      state.currentPage = 1;
      state.activeChatUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations (Inbox List)
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload;
      })

      // Loading conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading = false;

        // Detect new chat user and reset list
        if (state.activeChatUser !== action.payload.userId) {
          state.messages = [];
          state.activeChatUser = action.payload.userId;
        }

        // First page loads normally
        if (action.payload.page === 1) {
          state.messages = action.payload.messages;
        }
        // Next pages prepend older messages (infinite scroll UX)
        else {
          state.messages = [...action.payload.messages, ...state.messages];
        }

        state.nextPage = action.payload.nextPage;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Start Conversation
      .addCase(startConversation.pending, (state) => {
        state.sending = true;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.sending = false;
        // Add to conversations list if not already present
        const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
        if (existingIndex === -1) {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      // Sending message
      .addCase(sendMessageToUser.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessageToUser.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessageToUser.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { clearConversation } = messageConversationSlice.actions;
export default messageConversationSlice.reducer;
