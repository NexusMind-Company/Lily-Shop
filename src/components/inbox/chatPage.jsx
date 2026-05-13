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
  fetchConversations,
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
    conversations,
    loading,
    sending,
    currentPage,
    nextPage,
  } = useSelector((state) => state.messages);
  const { user_data } = useSelector((state) => state.auth);
  const currentUserId = user_data?.id || user_data?.user?.id;

  // Find recipient data from conversations list or messages
  const recipientData = useMemo(() => {
    // 1. Try to find in conversations list (more reliable for metadata)
    const convFromList = conversations.find(
      (c) =>
        String(c.other_user?.id) === String(conversationId) ||
        String(c.buyer?.id) === String(conversationId) ||
        String(c.seller?.id) === String(conversationId),
    );

    if (convFromList) {
      const otherUser =
        convFromList.other_user ||
        (String(convFromList.buyer?.id) === String(currentUserId)
          ? convFromList.seller
          : convFromList.buyer);
      const role =
        String(convFromList.buyer?.id) === String(currentUserId)
          ? "Vendor"
          : "Customer";

      return {
        name:
          otherUser?.name ||
          otherUser?.full_name ||
          otherUser?.username ||
          "Chat",
        role,
        profilePic: otherUser?.profile_pic,
      };
    }

    // 2. Fallback to messages
    if (conversation && conversation.length > 0) {
      const otherMessage = conversation.find(
        (msg) => String(msg.sender_id) === String(conversationId),
      );
      if (otherMessage) {
        return {
          name:
            otherMessage.sender_name || otherMessage.sender_username || "Chat",
          role: null,
        };
      }
    }

    return { name: "Chat", role: null };
  }, [conversations, conversation, conversationId, currentUserId]);

  // Reverse messages for display (since backend returns newest first)
  const displayMessages = useMemo(() => {
    return [...conversation].reverse();
  }, [conversation]);

  // Ensure conversations list is loaded for metadata
  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(fetchConversations());
    }
  }, [conversations.length, dispatch]);

  // Handle message fetching and polling
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
      <div className="shrink-0 flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden border border-pink-200">
            {recipientData.profilePic ? (
              <img
                src={recipientData.profilePic}
                alt={recipientData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-pink-600 font-bold">
                {recipientData.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 leading-tight">
                {recipientData.name}
              </h2>
              {recipientData.role && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                  {recipientData.role}
                </span>
              )}
            </div>
            <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
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
      <div className="shrink-0 relative bg-white p-3 flex items-center space-x-2 border-t">
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
