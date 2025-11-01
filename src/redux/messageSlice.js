import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchInboxMessages = createAsyncThunk(
  "messages/fetchInbox",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      //  Call without page
      const res = await api.get("/messages/inbox/");

      //  If backend still returns paginated data, flatten it
      const data = res.data.results ? res.data.results : res.data;

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load inbox");
    }
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    inbox: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInboxMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.inbox = action.payload;
      })
      .addCase(fetchInboxMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default messageSlice.reducer;
