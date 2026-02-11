# Messaging and Notification System Design

## 1. System Overview

This system provides robust real-time-like communication (Messaging) and system alerts (Notifications) for the Lily Shop platform. It utilizes the existing Django Backend (REST API) and React Frontend.

### Architecture Choice: REST + Polling (Phase 1)
To ensure immediate stability without requiring complex infrastructure changes (like Redis Channel Layers for WebSockets), we implement a **Smart Polling** strategy.
- **Messaging**: Periodic polling (every 5s) when chat window is open.
- **Notifications**: Periodic polling (every 30-60s) globally.

*Note: The system is designed to be "WebSocket-ready" for a future upgrade.*

---

## 2. Implementation Status

### ✅ Backend (Django) - COMPLETE

#### A. Notifications Module
| Feature | Status | File |
|---------|--------|------|
| Notification Model | ✅ Existing | `notifications/models.py` |
| List Notifications (Paginated) | ✅ Complete | `notifications/views.py` |
| Mark Single as Read | ✅ Complete | `notifications/views.py` |
| **Mark All as Read** | ✅ Added | `notifications/views.py` |
| Notify New Message Task | ✅ Added | `notifications/tasks.py` |

**API Endpoints:**
- `GET /notifications/` - List notifications (supports `?read=true/false`)
- `GET /notifications/<id>/` - Get single notification (auto-marks as read)
- `POST /notifications/<id>/read/` - Mark as read
- `POST /notifications/mark-all-read/` - Mark all as read ✨ NEW

#### B. Messaging Module
| Feature | Status | File |
|---------|--------|------|
| Conversation Model | ✅ Existing | `chat/models.py` |
| Message Model | ✅ Existing | `chat/models.py` |
| List Conversations | ✅ Complete | `chat/views.py` |
| Start Conversation | ✅ Complete | `chat/views.py` |
| Send Message | ✅ Enhanced | `chat/views.py` |
| Messages with User | ✅ Added | `chat/views.py` |
| Unread Count | ✅ Complete | `chat/views.py` |

**API Endpoints:**
- `GET /messages/conversations/` - List all conversations
- `POST /messages/conversations/start/` - Start from product
- `GET /messages/conversations/<id>/` - Conversation detail with messages
- `POST /messages/conversations/<id>/send/` - Send to conversation
- `POST /messages/` - Unified send (supports `recipient` for direct messages)
- `GET /messages/user/<user_id>/` - Messages between current user and target ✨ NEW
- `GET /messages/unread-count/` - Unread message count

---

### ✅ Frontend (React + Redux) - COMPLETE

#### A. Redux State Management

| Slice | Status | Features |
|-------|--------|----------|
| `notificationSlice.js` | ✅ Created | `fetchNotifications`, `markNotificationRead`, `markAllNotificationsRead` |
| `messageConversationSlice.js` | ✅ Enhanced | `fetchConversations`, `fetchConversationMessages`, `sendMessageToUser`, `startConversation` |
| `store.js` | ✅ Updated | Both slices registered |

#### B. UI Components

| Component | Status | Features |
|-----------|--------|----------|
| `header.jsx` | ✅ Updated | Notification bell with badge, polling every 60s |
| `notifications.jsx` | ✅ Rewritten | Full list view, filters (All/Unread), mark all read, type icons |
| `messagesList.jsx` | ✅ Rewritten | Conversation list, search, polling every 30s, unread indicators |
| `chatPage.jsx` | ✅ Updated | Message polling every 5s, auto-scroll |
| `feedItem.jsx` | ✅ Working | "Message" button navigates to `/chat/<userId>` |

---

## 3. User Workflows

### Workflow 1: Direct Messaging from Feed
1. **Trigger**: User views product in feed, clicks "Message" button
2. **Action**: Navigates to `/chat/<seller_user_id>`
3. **Result**: Opens chat page, messages polled every 5 seconds

### Workflow 2: Viewing Notifications
1. **Trigger**: User sees red badge on bell icon in header
2. **Action**: Clicks bell → navigates to `/notifications`
3. **Features**: 
   - Filter by All/Unread
   - Click notification → navigates to URL
   - "Mark all read" button

### Workflow 3: Conversation List
1. **Trigger**: User navigates to `/messages`
2. **View**: List of all conversations with:
   - Other user's name and avatar
   - Last message preview
   - Time ago
   - Product context (if applicable)
   - Unread indicator
3. **Action**: Click conversation → opens chat with that user

### Workflow 4: Real-time Message Receipt
1. **Context**: User is on chat page
2. **Mechanism**: Poll every 5 seconds
3. **Update**: New messages appear, auto-scroll to bottom

---

## 4. File Changes Summary

### Backend Files Modified/Created:
```
Lily-Shop-Backend/
├── notifications/
│   ├── views.py          # Added MarkAllNotificationReadView
│   ├── urls.py           # Added mark-all-read endpoint
│   └── tasks.py          # Added notify_new_message task
└── chat/
    ├── views.py          # Added MessagesWithUserView, enhanced SendMessageView
    └── urls.py           # Added user/<user_id>/ endpoint
```

### Frontend Files Modified/Created:
```
Lily-Shop/src/
├── redux/
│   ├── store.js                    # Added notifications reducer
│   ├── notificationSlice.js        # NEW - Full notification state
│   └── messageConversationSlice.js # Enhanced with conversations
├── components/
│   ├── common/
│   │   └── header.jsx              # Added notification bell with badge
│   ├── notifications/
│   │   └── notifications.jsx       # Rewritten - Full notifications page
│   └── inbox/
│       ├── messagesList.jsx        # Rewritten - Conversation list
│       └── chatPage.jsx            # Added 5s polling
```

---

## 5. Testing Checklist

- [ ] Login with User A, send message from product feed → Seller receives notification
- [ ] Notification badge shows count in header
- [ ] Click notification bell → goes to notifications page
- [ ] Click individual notification → marks as read, navigates to URL
- [ ] "Mark all read" clears all notifications
- [ ] Messages page shows all conversations
- [ ] Clicking conversation opens chat
- [ ] Sending message appears immediately
- [ ] New messages appear via polling (no page refresh)

---

## 6. Future Improvements (Phase 2)

1. **WebSocket Integration**: Replace polling with Django Channels for true real-time
2. **Push Notifications**: Firebase Cloud Messaging for mobile
3. **Message Reactions**: Emoji reactions to messages
4. **Typing Indicators**: Show when other user is typing
5. **Read Receipts**: Double checkmarks for seen messages
6. **Media Messages**: Image/video sharing in chat
