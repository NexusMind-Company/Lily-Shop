import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Camera,
  SendHorizontal,
  EllipsisVertical,
  Phone,
  ChevronLeft,
  Heart,
  Eye,
  Play,
  ShoppingCart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchConversationMessages,
  sendMessageToUser,
  clearConversation,
  fetchConversations,
} from "../../redux/messageConversationSlice";
import { fetchPublicProfile } from "../../services/api";
import { addToCart } from "../../redux/cartSlice";

const SharedProductCard = ({ product, isMine }) => {
  const dispatch = useDispatch();
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product_id: product.id, quantity: 1 }));
    toast.success("Added to cart");
  };

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden max-w-[280px] shadow-lg ${isMine ? "bg-pink-50" : "bg-pink-100"}`}
    >
      <div className="relative aspect-square w-full">
        <img
          src={
            product.image_url || product.media?.[0]?.file || "/lily-logo.jpg"
          }
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-lily font-bold text-sm shadow-sm">
          ₦{Number(product.price || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {product.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {product.view_count || 0}
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-white text-lily text-center py-2 rounded-xl text-xs font-bold border border-pink-200 hover:bg-pink-50 transition-colors"
          >
            Buy Now
          </Link>
          <button
            onClick={handleAddToCart}
            className="bg-lily text-white p-2 rounded-xl hover:bg-lily/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SharedContentCard = ({ content, isMine }) => {
  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden max-w-[280px] shadow-lg ${isMine ? "bg-pink-50" : "bg-pink-100"}`}
    >
      <div className="relative aspect-square w-full group">
        <img
          src={content.media || "/lily-logo.jpg"}
          alt="Shared content"
          className="w-full h-full object-cover"
        />
        {content.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        {content.caption && (
          <p className="text-sm text-gray-800 line-clamp-2">
            {content.caption}
          </p>
        )}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {content.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {content.views || 0}
          </span>
        </div>
        <Link
          to={`/product/${content.id}`}
          className="block w-full bg-white text-lily text-center py-2 rounded-xl text-xs font-bold border border-pink-200 hover:bg-pink-50 transition-colors"
        >
          View Post
        </Link>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const menuRef = useRef(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: fetchedUserProfile } = useQuery({
    queryKey: ["public-profile", conversationId],
    queryFn: () => fetchPublicProfile(conversationId),
    enabled: !!conversationId,
  });

  // Helper to format last seen or show online
  const formatUserStatus = (lastSeen) => {
    if (!lastSeen) return { text: "Online", isOnline: true };

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeenDate) / 60000);

    // If active within last 5 minutes, show as Online
    if (diffInMinutes < 5) {
      return { text: "Online", isOnline: true };
    }

    // Format last seen time
    if (diffInMinutes < 60) {
      return { text: `Last seen ${diffInMinutes}m ago`, isOnline: false };
    }

    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) {
      return { text: `Last seen ${hours}h ago`, isOnline: false };
    }

    return {
      text: `Last seen ${lastSeenDate.toLocaleDateString()}`,
      isOnline: false,
    };
  };

  // Find recipient data from fetched profile, conversations list, or messages
  const recipientData = useMemo(() => {
    // 1. Prioritize freshly fetched profile data
    if (fetchedUserProfile) {
      const statusInfo = formatUserStatus(fetchedUserProfile.last_seen);
      return {
        name: fetchedUserProfile.username || fetchedUserProfile.name || "User",
        role: fetchedUserProfile.vendor_id ? "Vendor" : "Customer",
        profilePic: fetchedUserProfile.profile_pic,
        statusText: statusInfo.text,
        isOnline: statusInfo.isOnline,
      };
    }

    // 2. Fallback to conversations list (from metadata)
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
          otherUser?.username ||
          otherUser?.name ||
          otherUser?.full_name ||
          "Chat",
        role,
        profilePic: otherUser?.profile_pic,
        statusText: "Online", // Default fallback
        isOnline: true,
      };
    }

    // 3. Fallback to messages
    if (conversation && conversation.length > 0) {
      const otherMessage = conversation.find(
        (msg) => String(msg.sender_id) === String(conversationId),
      );
      if (otherMessage) {
        return {
          name:
            otherMessage.sender_username || otherMessage.sender_name || "Chat",
          role: null,
          statusText: "Online",
          isOnline: true,
        };
      }
    }

    return { name: "Chat", role: null, statusText: "Online", isOnline: true };
  }, [
    fetchedUserProfile,
    conversations,
    conversation,
    conversationId,
    currentUserId,
  ]);

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
      <div className="shrink-0 flex items-center justify-between p-4 bg-white shadow-sm z-20 relative">
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
            <p
              className={`text-[10px] font-semibold flex items-center gap-1 ${
                recipientData.isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {recipientData.isOnline && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              )}
              {recipientData.statusText}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() =>
              toast("Voice call coming soon", {
                icon: "📞",
              })
            }
          >
            <Phone className="h-7 w-7 text-gray-600" />
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)}>
              <EllipsisVertical className="h-7 w-7 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    navigate(`/profile/${conversationId}`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    toast.success("User reported successfully");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
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
          displayMessages.map((msg) => {
            const isMine = String(msg.sender_id) === String(currentUserId);

            // Check for shared product from backend
            if (msg.product) {
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <SharedProductCard product={msg.product} isMine={isMine} />
                </div>
              );
            }

            // Check for shared content (custom prefix)
            if (
              typeof msg.content === "string" &&
              msg.content.startsWith("LILY_SHARE:")
            ) {
              try {
                const sharedData = JSON.parse(
                  msg.content.replace("LILY_SHARE:", ""),
                );
                if (sharedData.type === "shared_content") {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <SharedContentCard content={sharedData} isMine={isMine} />
                    </div>
                  );
                }
              } catch (e) {
                console.error("Failed to parse shared content", e);
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    isMine
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
            );
          })
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
