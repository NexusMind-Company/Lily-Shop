import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async ({ page = 1, read = null }, { rejectWithValue }) => {
        try {
            let url = `/notifications/?page=${page}`;
            if (read !== null) {
                url += `&read=${read}`;
            }
            const response = await api.get(url);
            return {
                notifications: response.data.results,
                next: response.data.next,
                count: response.data.count,
                page,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch notifications");
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    "notifications/markRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            await api.post(`/notifications/${notificationId}/read/`);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to mark as read");
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/notifications/mark-all-read/");
            return;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to mark all as read");
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        next: null,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        resetNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.next = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.page === 1) {
                    state.notifications = action.payload.notifications;
                } else {
                    state.notifications = [...state.notifications, ...action.payload.notifications];
                }
                state.next = action.payload.next;
                // Calculate unread count roughly from the first page or maintain separate endpoint
                // For now, we rely on the `unread_count` endpoint if we add it, or count locally
                const unreadInBatch = action.payload.notifications.filter(n => !n.read).length;
                if (action.payload.page === 1) {
                    // This is an approximation. Ideally we have a separate `/notifications/unread-count/` endpoint
                    state.unreadCount = unreadInBatch;
                }
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Mark Read
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const notification = state.notifications.find((n) => n.id === action.payload);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark All Read
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.notifications.forEach((n) => (n.read = true));
                state.unreadCount = 0;
            });
    },
});

export const { addNotification, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
