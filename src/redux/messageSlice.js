import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://lily-shop-backend.onrender.com";

// Fetch inbox messages
export const fetchInboxMessages = createAsyncThunk(
  "messages/fetchInboxMessages",
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user_data?.access;
      const response = await axios.get(`${BASE_URL}/messages/inbox/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to fetch inbox messages" }
      );
    }
  }
);

//  Fetch messages between logged-in user and specific recipient
export const fetchConversation = createAsyncThunk(
  "messages/fetchConversation",
  async (recipientId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user_data?.access;
      const response = await axios.get(`${BASE_URL}/messages/conversation/${recipientId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Expected: array of message objects
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to load conversation" }
      );
    }
  }
);

//  Send message
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ recipient, content, product_id = null }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user_data?.access;
      const response = await axios.post(
        `${BASE_URL}/messages/`,
        { recipient, content, product_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to send message" }
      );
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    inbox: [],
    conversation: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    clearMessages(state) {
      state.inbox = [];
      state.conversation = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Inbox
      .addCase(fetchInboxMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInboxMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.inbox = action.payload.results || [];
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchInboxMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Unable to load messages";
      })

      // Conversation
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversation = action.payload || [];
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Unable to load conversation";
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.conversation.push(action.payload); // add new msg instantly
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload?.detail || "Unable to send message";
      });
  },
});

export const { clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
