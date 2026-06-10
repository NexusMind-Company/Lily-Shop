import { ChevronLeft, MessageCircle, Send, Check } from "lucide-react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import BottomNav from "./bottomNav";
import { MessageListSkeleton } from "../common/skeletons";
import { fetchConversations } from "../../redux/messageConversationSlice";
import { shareProductToChat, sendMessage } from "../../services/api";

function MessagesList() {
  const [activePage, setActivePage] = useState("inbox");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const shareData = location.state?.sharePost;
  const isProductShare = location.state?.isProduct;
  const isShareMode = !!shareData;

  const { conversations, conversationsLoading, error } = useSelector(
    (state) => state.messages,
  );

  useEffect(() => {
    dispatch(fetchConversations());

    // Polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchConversations());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      if (selectedUsers.length >= 10) {
        toast.error("You can select up to 10 people");
        return;
      }
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;
    setIsSending(true);

    try {
      const sharePromises = selectedUsers.map(async (userId) => {
        if (isProductShare) {
          return shareProductToChat(shareData.id, userId);
        } else {
          // For content, we send a structured message that the chat page can parse
          // We'll use a specific prefix to identify it as a shared content card
          const contentPayload = {
            type: "shared_content",
            id: shareData.id,
            caption: shareData.caption || "",
            media:
              shareData.media_url ||
              shareData.media?.[0]?.file ||
              shareData.image_url,
            is_video: shareData.is_video || !!shareData.video_url,
            likes: shareData.like_count || 0,
            views: shareData.view_count || 0,
          };
          return sendMessage({
            recipientId: userId,
            content: `LILY_SHARE:${JSON.stringify(contentPayload)}`,
          });
        }
      });

      await Promise.all(sharePromises);
      toast.success(`Shared with ${selectedUsers.length} people`);
      navigate(-1);
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share with some users");
    } finally {
      setIsSending(false);
    }
  };

  // Format conversations into a displayable list
  const formattedConversations = Array.isArray(conversations)
    ? conversations.map((conv) => {
        // Determine the other user (not the current user)
        const otherUser =
          conv.other_user || (conv.is_buyer ? conv.seller : conv.buyer);

        // Roles
        const otherRole = conv.is_buyer ? "Vendor" : "Customer";

        // Get the last message
        const lastMsgObj = conv.last_message;
        const lastMessageText =
          typeof lastMsgObj === "object"
            ? lastMsgObj?.content || "No messages yet"
            : lastMsgObj || "No messages yet";

        return {
          id: conv.id,
          otherUserId: otherUser?.id,
          displayName:
            otherUser?.name ||
            otherUser?.full_name ||
            otherUser?.username ||
            "Unknown User",
          username: otherUser?.username || "",
          profilePic: otherUser?.profile_pic || null,
          lastMessage: lastMessageText,
          time: conv.last_message_at ? getTimeAgo(conv.last_message_at) : "",
          unread: conv.unread_count > 0,
          productName: conv.product?.name || null,
          otherRole,
          isFollowing: otherUser?.is_following_back,
        };
      })
    : [];

  const filteredConversations = formattedConversations.filter(
    (chat) =>
      chat.displayName.toLowerCase().includes(search.toLowerCase()) ||
      chat.username.toLowerCase().includes(search.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      (chat.productName &&
        chat.productName.toLowerCase().includes(search.toLowerCase())),
  );

  const noConversations =
    !conversationsLoading && !error && formattedConversations.length === 0;

  const noSearchResults =
    !conversationsLoading &&
    !error &&
    formattedConversations.length > 0 &&
    filteredConversations.length === 0;

  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  }

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto flex flex-col">
      <header className="relative p-4 bg-white shadow-sm flex items-center shrink-0">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-[20px] font-semibold flex-1 text-center">
          {isShareMode ? "Share to..." : "Messages"}
        </h1>
        {isShareMode && <div className="w-8 h-8" /> /* Spacer for alignment */}
      </header>

      <section className="p-4 shrink-0">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-5 border-2 rounded-full hover:border-lily outline-none transition"
        />
      </section>

      <div className="flex-1 overflow-hidden relative">
        {conversationsLoading && <MessageListSkeleton />}

        {!conversationsLoading && error && (
          <p className="text-red-700 py-3 border border-red-300 bg-red-100 text-center my-5 mx-4 rounded-lg">
            {typeof error === "string" ? error : "Failed to load conversations"}
          </p>
        )}

        {!conversationsLoading && !error && noConversations && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a conversation from a product page
            </p>
          </div>
        )}

        {!conversationsLoading && !error && noSearchResults && (
          <p className="text-center text-ash mt-8">No results found</p>
        )}

        {!conversationsLoading &&
          !error &&
          filteredConversations.length > 0 && (
            <section className="px-4 pb-24 overflow-y-auto h-full">
              <div className="space-y-3 pb-20">
                {filteredConversations.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center justify-between cursor-pointer w-full p-3 rounded-xl transition-colors ${
                      isShareMode
                        ? selectedUsers.includes(chat.otherUserId)
                          ? "bg-pink-50 border border-lily"
                          : "bg-white border border-transparent"
                        : chat.unread
                          ? "bg-purple-50"
                          : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      isShareMode
                        ? handleUserSelect(chat.otherUserId)
                        : navigate(`/chat/${chat.otherUserId}`)
                    }
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-lily flex items-center justify-center overflow-hidden">
                          {chat.profilePic ? (
                            <img
                              src={chat.profilePic}
                              alt={chat.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {chat.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {isShareMode &&
                          selectedUsers.includes(chat.otherUserId) && (
                            <div className="absolute -right-1 -top-1 w-5 h-5 bg-lily rounded-full border-2 border-white flex items-center justify-center">
                              <Check
                                className="w-3 h-3 text-white"
                                strokeWidth={4}
                              />
                            </div>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-semibold truncate ${
                              isShareMode
                                ? "text-gray-900"
                                : chat.unread
                                  ? "text-gray-900"
                                  : "text-gray-700"
                            }`}
                          >
                            {chat.displayName}
                          </h3>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {chat.otherRole}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate max-w-50 ${
                            !isShareMode && chat.unread
                              ? "font-medium text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    {!isShareMode && (
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-xs text-gray-400">{chat.time}</p>
                        {chat.unread && (
                          <span className="w-2.5 h-2.5 bg-lily rounded-full"></span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>

      {isShareMode && selectedUsers.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full px-8 z-50">
          <button
            onClick={handleShare}
            disabled={isSending}
            className="w-full bg-lily text-white py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} />
                Send to {selectedUsers.length}{" "}
                {selectedUsers.length === 1 ? "person" : "people"}
              </>
            )}
          </button>
        </div>
      )}

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

export default MessagesList;
