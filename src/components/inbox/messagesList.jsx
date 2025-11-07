import { ChevronLeft } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "./bottomNav";
import { fetchInboxMessages } from "../../redux/messageSlice";

export default function MessagesList() {
  const [activePage, setActivePage] = useState("inbox");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { inbox, loading, error } = useSelector((state) => state.messages);

  useEffect(() => {
    dispatch(fetchInboxMessages());
  }, [dispatch]);

  const rawMessages = Array.isArray(inbox)
    ? inbox
    : Array.isArray(inbox?.results)
    ? inbox.results
    : [];

  const formattedMessages = rawMessages.map((msg) => ({
    id: msg.other_user_id,
    name: msg.sender_name || msg.sender?.username || "Unknown",
    lastMessage: msg.content || msg.message || "",
    time: msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: !msg.read,
  }));

  const filteredMessages = formattedMessages.filter(
    (chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const noMessages = !loading && !error && rawMessages.length === 0;

  const noSearchResults =
    !loading &&
    !error &&
    rawMessages.length > 0 &&
    filteredMessages.length === 0;

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      <header className="relative p-4">
        <RouterLink onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </RouterLink>
        <h1 className="text-[20px] font-semibold text-center">Messages</h1>
      </header>

      <section className="p-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-5 border-2 rounded-full hover:border-lily outline-none transition"
        />
      </section>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && error && (
        <p className="text-red-700 py-3 border border-red-300 bg-red-100 text-center my-5 rounded-lg">
          {error}
        </p>
      )}

      {!loading && !error && noMessages && (
        <p className="text-center text-ash mt-5 text-lg">No messages</p>
      )}

      {!loading && !error && noSearchResults && (
        <p className="text-center text-ash mt-8">No results found</p>
      )}

      {!loading && !error && filteredMessages.length > 0 && (
        <section className="p-4">
          <div className="space-y-6">
            {filteredMessages.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between cursor-pointer w-full"
                // Navigate to the chat page with the user's ID
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-400"></div>
                  <div>
                    <h3 className="font-semibold">{chat.name}</h3>
                    <p className="text-ash text-sm truncate max-w-[180px]">
                      {chat.lastMessage || "No message"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-ash text-sm">{chat.time || "--"}</p>
                  {chat.unread && (
                    <span className="text-red-500 text-xs">🔴</span>
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
