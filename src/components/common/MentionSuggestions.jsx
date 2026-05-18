import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useSelector } from "react-redux";

const MentionSuggestions = ({
  onSelect,
  inputValue,
  cursorPosition,
  isOpen,
}) => {
  const [following, setFollowing] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = useSelector((state) => state.auth);
  const loggedInUserId = auth?.user_data?.id;

  // Fetch following list once
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!loggedInUserId) return;
      try {
        setLoading(true);
        const res = await api.get(`/auth/following/${loggedInUserId}/`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.following || res.data?.results || [];
        setFollowing(data);
      } catch (err) {
        console.error("Failed to fetch following for mentions", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchFollowing();
    }
  }, [loggedInUserId, isOpen]);

  // Filter list based on typed search after @
  useEffect(() => {
    if (!isOpen) return;

    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
      // Only filter if we're actually typing after an @
      const filtered = following.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query),
      );
      setFilteredList(filtered);
    }
  }, [inputValue, cursorPosition, following, isOpen]);

  if (!isOpen || (filteredList.length === 0 && !loading)) return null;

  return (
    <div className="absolute bottom-full left-0 w-full max-h-60 overflow-y-auto bg-white border-2 border-black rounded-t-xl shadow-2xl z-110 mb-1">
      <div className="p-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Mention Someone
        </span>
        {loading && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-lily" />
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {filteredList.map((user) => (
          <div
            key={user.id || user.username}
            className="flex items-center gap-3 p-3 hover:bg-lily/5 cursor-pointer transition-colors group"
            onClick={() => onSelect(user.username)}
          >
            <div className="w-10 h-10 rounded-full border border-black overflow-hidden shrink-0 bg-gray-100">
              <img
                src={user.profile_pic || user.img || "/profile-icon.svg"}
                alt={user.username}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/profile-icon.svg")}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm text-black truncate group-hover:text-lily">
                {user.name || user.full_name || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] bg-lily text-white px-2 py-1 rounded-full font-bold">
                Select
              </span>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredList.length === 0 && (
        <div className="p-4 text-center text-gray-400 text-sm italic">
          No matches found
        </div>
      )}
    </div>
  );
};

export default MentionSuggestions;
