import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useSelector } from "react-redux";
import { SearchSuggestionSkeleton } from "./skeletons";

const MentionSuggestions = ({
  onSelect,
  inputValue,
  cursorPosition,
  isOpen,
}) => {
  const [usersList, setUsersList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = useSelector((state) => state.auth);
  const profile = useSelector((state) => state.profile);

  // Exhaustive search for ID
  const loggedInUserId =
    profile?.data?.user?.id ||
    auth?.user_data?.id ||
    auth?.user_data?.user?.id ||
    JSON.parse(localStorage.getItem("user_data") || "{}").id;

  console.log("Mentions - Component State:", {
    isOpen,
    loggedInUserId,
    hasUsers: usersList.length > 0,
    authData: auth?.user_data,
    profileData: profile?.data?.user,
  });

  // Fetch following and followers list once
  useEffect(() => {
    const fetchUsers = async () => {
      console.log("Mentions - fetchUsers() called with ID:", loggedInUserId);
      if (!loggedInUserId) {
        console.warn("Mentions - No loggedInUserId found, skipping fetch.");
        return;
      }

      try {
        setLoading(true);
        console.log("Mentions - Initiating network requests...");
        const [followingRes, followersRes] = await Promise.all([
          api.get(`/auth/following/${loggedInUserId}/`),
          api.get(`/auth/followers/${loggedInUserId}/`),
        ]);

        console.log("Mentions - Network Responses Received");
        const followingData = Array.isArray(followingRes.data)
          ? followingRes.data
          : followingRes.data?.following || followingRes.data?.results || [];

        const followersData = Array.isArray(followersRes.data)
          ? followersRes.data
          : followersRes.data?.followers || followersRes.data?.results || [];

        console.log("Mentions - Data Parsed:", {
          followingCount: followingData.length,
          followersCount: followersData.length,
        });

        // Combine and de-duplicate by username or id
        const combined = [...followingData, ...followersData];
        const uniqueUsers = Array.from(
          new Map(
            combined.map((user) => [user.id || user.username, user]),
          ).values(),
        );

        console.log(
          "Mentions - Merged Unique Users Count:",
          uniqueUsers.length,
        );

        // Fetch profile pictures for each user if not present
        const usersWithPics = await Promise.all(
          uniqueUsers.map(async (user) => {
            try {
              const profileRes = await api.get(
                `/auth/profile/${user.id || user.username}/`,
              );
              return {
                ...user,
                profile_pic:
                  profileRes.data.profile_pic ||
                  profileRes.data.user?.profile_pic,
              };
            } catch (err) {
              console.warn(
                `Mentions - Could not fetch pic for ${user.username}`,
                err,
              );
              return user;
            }
          }),
        );

        console.log(
          "Mentions - Final Users List with Pics:",
          usersWithPics.length,
        );
        setUsersList(usersWithPics);
      } catch (err) {
        console.error("Mentions - Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && usersList.length === 0 && !loading) {
      fetchUsers();
    }
  }, [loggedInUserId, isOpen, usersList.length, loading]);

  // Filter list based on typed search after @
  useEffect(() => {
    if (!isOpen) return;

    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
      // Only filter if we're actually typing after an @
      const filtered = usersList.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query),
      );
      console.log(`Mentions - Filtered list for query "@${query}":`, filtered);
      setFilteredList(filtered);
    }
  }, [inputValue, cursorPosition, usersList, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 w-full max-h-64 overflow-y-auto bg-white border-2 border-black rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[9999] mb-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="divide-y divide-gray-50">
        {loading ? (
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
                  onError={(e) => (e.target.src = "/profile-icon.svg")}
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
