import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  SendHorizontal,
  EllipsisVertical,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

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
  const location = useLocation();
  const { conversationId } = useParams();

  const { messages: conversation, loading, sending, currentPage, nextPage } =
    useSelector((state) => state.messages);
  const { user_data } = useSelector((state) => state.auth);

  const currentUserId = user_data?.id || user_data?.user?.id;
  const chatMeta = location.state?.chat || null;

  useEffect(() => {
    dispatch(clearConversation());

    if (!conversationId) {
      return;
    }

    dispatch(fetchConversationMessages({ userId: conversationId, page: 1 }))
      .catch((error) => {
        console.error("Error fetching conversation messages:", error);
      });

    const interval = setInterval(() => {
      dispatch(fetchConversationMessages({ userId: conversationId, page: 1 }))
        .catch((error) => {
          console.error("Error fetching conversation messages:", error);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleScroll = () => {
    const top = chatBoxRef.current?.scrollTop ?? 0;

    if (top === 0 && nextPage && !isFetchingMore) {
      setIsFetchingMore(true);

      dispatch(
        fetchConversationMessages({
          userId: conversationId,
          page: currentPage + 1,
        }),
      ).then(() => {
        setTimeout(() => {
          if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = 10;
          }
          setIsFetchingMore(false);
        }, 100);
      });
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || sending) return;

    dispatch(sendMessageToUser({ userId: conversationId, content: newMessage }))
      .then(() => {
        setNewMessage("");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        toast.error("Couldn't send your message. Please try again.");
      });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      toast("Attachment sharing is coming soon.");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = newMessage.trim().length > 0 && !sending;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <div className="flex-shrink-0 flex items-center justify-between bg-white p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-pink-200 text-sm font-bold text-white">
            {chatMeta?.profilePic ? (
              <img
                src={chatMeta.profilePic}
                alt={chatMeta?.name || "Chat user"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{"\u{1F4AC}"}</span>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              {chatMeta?.name ||
                conversation[conversation.length - 1]?.sender_name ||
                conversation[conversation.length - 1]?.sender_username ||
                "Chat"}
            </h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Phone className="h-7 w-7" />
          <EllipsisVertical className="h-7 w-7" />
        </div>
      </div>

      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isFetchingMore && (
          <p className="text-center text-xs font-medium text-gray-400">
            Loading earlier messages...
          </p>
        )}

        {loading && conversation.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : conversation.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet.</p>
        ) : (
          conversation.map((msg) => {
            const isOwnMessage =
              String(msg.sender_id || msg.sender) === String(currentUserId);

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                    isOwnMessage
                      ? "rounded-br-none bg-green-100 text-gray-800"
                      : "rounded-bl-none bg-pink-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                  <p className="mt-1 text-right text-[10px] opacity-70">
                    {new Date(
                      msg.timestamp || msg.created_at,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative flex-shrink-0 items-center space-x-2 border-t bg-white p-3 flex">
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
          onKeyDown={handleComposerKeyDown}
          className="flex-1 rounded-full bg-gray-200 px-4 py-2 focus:outline-none"
        />

        <button
          className="absolute right-[15%] text-gray-500"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-8 w-8" />
        </button>

        <button onClick={handleSend} disabled={!canSend}>
          <SendHorizontal
            className={`h-8 w-8 transition-all ${
              canSend ? "text-lily" : "text-gray-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
