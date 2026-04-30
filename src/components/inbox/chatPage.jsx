import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  SendHorizontal,
  EllipsisVertical,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchConversationMessages,
  sendMessageToUser,
  clearConversation,
} from "../../redux/messageConversationSlice";

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const {
    messages: conversation,
    loading,
    sending,
    currentPage,
    nextPage,
  } = useSelector((state) => state.messages);
  const { user_data } = useSelector((state) => state.auth);
  const currentUserId = user_data?.id || user_data?.user?.id;

  // Find recipient name from messages
  const recipientName = useMemo(() => {
    if (!conversation || conversation.length === 0) return "Chat";

    // Find the message from the other user (matching conversationId)
    const otherMessage = conversation.find(
      (msg) => String(msg.sender_id) === String(conversationId),
    );
    if (otherMessage) {
      return otherMessage.sender_name || otherMessage.sender_username || "Chat";
    }

    // Fallback: any message that isn't from me
    const anyOtherMessage = conversation.find(
      (msg) => String(msg.sender_id) !== String(currentUserId),
    );
    if (anyOtherMessage) {
      return (
        anyOtherMessage.sender_name || anyOtherMessage.sender_username || "Chat"
      );
    }

    return "Chat";
  }, [conversation, conversationId, currentUserId]);

  // Reverse messages for display (since backend returns newest first)
  const displayMessages = useMemo(() => {
    return [...conversation].reverse();
  }, [conversation]);

  //  On mount & user change
  useEffect(() => {
    dispatch(clearConversation());

    if (conversationId) {
      dispatch(
        fetchConversationMessages({ userId: conversationId, page: 1 }),
      ).catch((error) => {
        console.error("Error fetching conversation messages:", error);
      });

      // Polling for new messages every 5 seconds
      const interval = setInterval(() => {
        try {
          dispatch(
            fetchConversationMessages({ userId: conversationId, page: 1 }),
          );
        } catch (error) {
          console.error("Error fetching conversation messages:", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [conversationId, dispatch]);

  //  Auto scroll bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  //  Load more messages on scroll top
  const handleScroll = () => {
    const top = chatBoxRef.current.scrollTop;
    if (top === 0 && nextPage && !isFetchingMore) {
      setIsFetchingMore(true);

      dispatch(
        fetchConversationMessages({
          userId: conversationId,
          page: currentPage + 1,
        }),
      ).then(() => {
        setTimeout(() => {
          chatBoxRef.current.scrollTop = 10;
          setIsFetchingMore(false);
        }, 100);
      });
    }
  };

  //  Send Message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    dispatch(sendMessageToUser({ userId: conversationId, content: newMessage }))
      .then(() => {
        setNewMessage("");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  const handleFileSelect = (e) => {
    console.log("Selected files:", Array.from(e.target.files));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-bold">
            💬
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">{recipientName}</h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Phone className="h-7 w-7" />
          <EllipsisVertical className="h-7 w-7" />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && displayMessages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet.</p>
        ) : (
          displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                String(msg.sender_id) === String(currentUserId)
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                  String(msg.sender_id) === String(currentUserId)
                    ? "bg-green-100 text-gray-800 rounded-br-none"
                    : "bg-pink-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.content}
                <p className="text-[10px] mt-1 opacity-70 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 relative bg-white p-3 flex items-center space-x-2 border-t">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-200 rounded-full px-4 py-2 focus:outline-none"
        />

        <button
          className="absolute right-[15%] text-gray-500"
          onClick={() => fileInputRef.current.click()}
        >
          <Camera className="h-8 w-8" />
        </button>

        <button onClick={handleSend} disabled={sending}>
          <SendHorizontal
            className={`h-8 w-8 ${
              sending ? "text-gray-400" : "text-lily"
            } transition-all`}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
