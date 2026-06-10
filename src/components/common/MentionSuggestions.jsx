import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchMentionableUsers } from "../../services/api";
import { SearchSuggestionSkeleton } from "./skeletons";

const MentionSuggestions = ({
  onSelect,
  inputValue,
  cursorPosition,
  isOpen,
}) => {
  const [filteredList, setFilteredList] = useState([]);

  const auth = useSelector((state) => state.auth);
  const profile = useSelector((state) => state.profile);

  const loggedInUserId =
    profile?.data?.user?.id ||
    auth?.user_data?.id ||
    auth?.user_data?.user?.id ||
    JSON.parse(localStorage.getItem("user_data") || "{}").id;

  const { data: usersList = [], isLoading } = useQuery({
    queryKey: ["mentionableUsers", loggedInUserId],
    queryFn: () => fetchMentionableUsers(loggedInUserId),
    enabled: isOpen && !!loggedInUserId,
  });

  useEffect(() => {
    if (!isOpen) return;

    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
      const filtered = usersList.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query),
      );
      setFilteredList(filtered);
    }
  }, [inputValue, cursorPosition, usersList, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 w-full max-h-64 overflow-y-auto bg-white border-2 border-black rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-999 mb-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="divide-y divide-gray-50">
        {isLoading ? (
          <div className="p-2 space-y-1">
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
          </div>
        ) : filteredList.length > 0 ? (
          filteredList.map((user) => (
            <div
              key={user.id || user.username}
              className="flex items-center gap-3 p-3 hover:bg-lily/10 cursor-pointer transition-all group active:bg-lily/20"
              onClick={() => onSelect(user.username)}
            >
              <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shrink-0 bg-gray-100 group-hover:border-lily transition-colors">
                <img
                  src={user.profile_pic || user.img || "/profile-icon.svg"}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/profile-icon.svg";
                  }}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-black truncate group-hover:text-lily transition-colors">
                  {user.name || user.full_name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate group-hover:text-lily/70 transition-colors">
                  @{user.username}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <div className="bg-lily text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm">
                  Select
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl">@</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No followers or following found
            </p>
            <p className="text-gray-400 text-xs">
              Try typing the exact username
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentionSuggestions;
