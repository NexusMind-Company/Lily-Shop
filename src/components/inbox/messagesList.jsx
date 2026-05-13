import { ChevronLeft, MessageCircle } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "./bottomNav";
import { fetchConversations } from "../../redux/messageConversationSlice";

function MessagesList() {
  const [activePage, setActivePage] = useState("inbox");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { conversations, conversationsLoading, error } = useSelector(
    (state) => state.messages,
  );
  const { user_data } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations());

    // Polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchConversations());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

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
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      <header className="relative p-4 bg-white shadow-sm">
        <RouterLink onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </RouterLink>
        <h1 className="text-[20px] font-semibold text-center">Messages</h1>
      </header>

      <section className="p-4">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-5 border-2 rounded-full hover:border-lily outline-none transition"
        />
      </section>

      {conversationsLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

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

      {!conversationsLoading && !error && filteredConversations.length > 0 && (
        <section className="px-4 pb-24 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="space-y-3">
            {filteredConversations.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between cursor-pointer w-full p-3 rounded-xl transition-colors ${
                  chat.unread ? "bg-purple-50" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => navigate(`/chat/${chat.otherUserId}`)}
              >
                <div className="flex items-center gap-3">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold truncate ${chat.unread ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {chat.displayName}
                      </h3>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {chat.otherRole}
                      </span>
                      {chat.productName && (
                        <span className="text-[10px] bg-lily/10 text-lily px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                          {chat.productName}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate max-w-[200px] ${chat.unread ? "font-medium text-gray-800" : "text-gray-500"}`}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-xs text-gray-400">{chat.time}</p>
                  {chat.unread && (
                    <span className="w-2.5 h-2.5 bg-lily rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

export default MessagesList;
