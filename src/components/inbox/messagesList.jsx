import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "./bottomNav";
import { fetchInboxMessages } from "../../redux/messageSlice";

/* eslint-disable react/prop-types */
export default function MessagesList({ openChat }) {
  const [activePage, setActivePage] = useState("inbox");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { inbox, loading, error } = useSelector((state) => state.messages);

  // Fetch inbox messages on mount
  useEffect(() => {
    dispatch(fetchInboxMessages());
  }, [dispatch]);

  // Filter messages by search query
  const filteredMessages = inbox.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(search.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="relative p-4">
        <Link onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-[20px] font-semibold text-center">Messages</h1>
      </header>

      {/* Search bar */}
      <section className="p-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-5 border-2 rounded-full hover:border-lily outline-none transition"
        />
      </section>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-center text-red-500 mt-6">{error}</p>
      )}

      {/* Messages list */}
      {!loading && !error && (
        <section className="p-4">
          {filteredMessages.length > 0 ? (
            <div className="space-y-6">
              {filteredMessages.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between cursor-pointer w-full"
                  onClick={() => openChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400"></div>
                    <div>
                      <h3 className="font-semibold">
                        {chat.name || "Unknown Sender"}
                      </h3>
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
          ) : (
            <p className="text-center text-ash mt-8">No messages found</p>
          )}
        </section>
      )}

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}
