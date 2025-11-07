import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchShops, fetchFeed } from "../../services/api";
import {
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
  SearchUserSkeleton,
} from "../common/skeletons";

const RECENT_SEARCHES_KEY = "lily_recent_searches";

const getRecentSearches = () => {
  try {
    const items = localStorage.getItem(RECENT_SEARCHES_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Failed to parse recent searches", error);
    return [];
  }
};

const saveRecentSearches = (searches) => {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error("Failed to save recent searches", error);
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const SearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Top");
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: () => searchShops(debouncedSearchTerm),
    select: (data) => data.results || [],
    enabled: !!debouncedSearchTerm,
  });

  // API-Driven "Top" Tab
  const {
    data: topContent,
    isLoading: isLoadingTop,
    error: topError,
  } = useQuery({
    queryKey: ["feed", "forYou"],
    queryFn: fetchFeed,
    select: (data) => data.results || [],
    enabled: activeTab === "Top" && !debouncedSearchTerm,
  });

  // "Users" Tab
  // !! NOTE: the API documentation does not have an endpoint for searching users.
  // This uses MOCK DATA until i get the real endpoint from the backend developer.
  const {
    data: usersContent,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["searchUsersContent"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: "u1",
          name: "Layo Gadgets",
          handle: "@layo",
          image: "https://via.placeholder.com/150/f9a8d4/8c3c10?text=User",
        },
        {
          id: "u2",
          name: "GadgetWorld",
          handle: "@gworld",
          image: "https://via.placeholder.com/150/cccccc/333333?text=User",
        },
      ];
    },
    enabled: activeTab === "Users" && !debouncedSearchTerm,
  });

  // Event Handlers

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      const newSearches = [
        trimmedTerm,
        ...recentSearches.filter((term) => term !== trimmedTerm),
      ].slice(0, 10);

      setRecentSearches(newSearches);
      saveRecentSearches(newSearches);

      navigate(`/searchResults?q=${encodeURIComponent(trimmedTerm)}`);
      onClose();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const removeRecent = (termToRemove) => {
    const newSearches = recentSearches.filter((term) => term !== termToRemove);
    setRecentSearches(newSearches);
    saveRecentSearches(newSearches);
  };

  // Renders skeleton loaders for search suggestions
  const renderSearchSkeletons = () => (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-800">Searching...</h3>
      <SearchSuggestionSkeleton />
      <SearchSuggestionSkeleton />
      <SearchSuggestionSkeleton />
    </div>
  );

  // Renders the API-driven search results
  const renderSearchResults = () => (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-800">Results</h3>
      {searchResults.length === 0 && (
        <p className="text-gray-500 text-center">
          No results found for "{debouncedSearchTerm}"
        </p>
      )}
      {searchResults.map((shop) => (
        <div
          key={shop.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            navigate(`/shop/${shop.id}`);
            onClose();
          }}
        >
          <img
            src={
              shop.image_url || "https://placehold.co/40x40/eee/ccc?text=Shop"
            }
            alt={shop.name}
            className="w-10 h-10 rounded-full bg-gray-200 object-cover"
          />
          <div>
            <span className="font-medium">{shop.name}</span>
            <p className="text-sm text-gray-500 line-clamp-1">
              {shop.description || "No description"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Renders the content for the "Top", "Recent", and "Users" tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "Top":
        if (isLoadingTop) {
          return (
            <div className="grid grid-cols-2 gap-4">
              <SearchGridItemSkeleton />
              <SearchGridItemSkeleton />
              <SearchGridItemSkeleton />
              <SearchGridItemSkeleton />
            </div>
          );
        }
        if (topError)
          return (
            <p className="text-red-500 text-center">Failed to load content.</p>
          );
        return (
          <div className="grid grid-cols-2 gap-4">
            {topContent?.map((post) => (
              <div
                key={post.id}
                className="cursor-pointer"
                onClick={() => {
                  navigate(`/product/${post.id}`); // Or wherever posts link to
                  onClose();
                }}
              >
                <img
                  src={
                    post.image_url ||
                    "https://placehold.co/150/eee/ccc?text=Post"
                  }
                  alt={post.caption}
                  className="w-full h-48 object-cover rounded-lg bg-gray-200"
                />
                <p className="mt-1 font-medium truncate">
                  {post.shop_name || post.username}
                </p>
              </div>
            ))}
          </div>
        );
      case "Recent":
        if (recentSearches.length === 0) {
          return (
            <p className="text-center text-gray-500">No recent searches.</p>
          );
        }
        return (
          <div className="flex flex-col">
            {recentSearches.map((term) => (
              <div
                key={term}
                className="flex items-center justify-between py-2 text-gray-700"
              >
                <span
                  className="cursor-pointer"
                  onClick={() => setSearchTerm(term)}
                >
                  {term}
                </span>
                <button
                  onClick={() => removeRecent(term)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        );
      case "Users":
        if (isLoadingUsers) {
          return (
            <div className="space-y-3">
              <SearchUserSkeleton />
              <SearchUserSkeleton />
            </div>
          );
        }
        if (usersError)
          return (
            <p className="text-red-500 text-center">Failed to load users.</p>
          );
        return (
          <div className="space-y-3">
            <p className="text-xs text-center text-blue-500 bg-blue-50 p-2 rounded-lg">
              Note: User search is using mock data.
            </p>
            {usersContent?.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              >
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.handle}</p>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Renders the default view (Recent Searches + Tabs)
  const renderDefaultContent = () => (
    <div className="space-y-6">
      {recentSearches.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Recent</h3>
          <div className="flex flex-col">
            {recentSearches.map((term) => (
              <div
                key={term}
                className="flex items-center justify-between py-2 text-gray-700"
              >
                <span
                  className="cursor-pointer"
                  onClick={() => setSearchTerm(term)}
                >
                  {term}
                </span>
                <button
                  onClick={() => removeRecent(term)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("Top")}
            className={`py-2 font-semibold ${
              activeTab === "Top"
                ? "text-lily border-b-2 border-lily"
                : "text-gray-500"
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setActiveTab("Recent")}
            className={`py-2 font-semibold ${
              activeTab === "Recent"
                ? "text-lily border-b-2 border-lily"
                : "text-gray-500"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveTab("Users")}
            className={`py-2 font-semibold ${
              activeTab === "Users"
                ? "text-lily border-b-2 border-lily"
                : "text-gray-500"
            }`}
          >
            Users
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header with Search Bar */}
      <div className="flex-shrink-0 flex items-center p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 ml-2">
          <input
            type="text"
            placeholder="Search products or users"
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-100 border-gray-100 focus:outline-none focus:border-lily focus:ring-1 focus:ring-lily"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={20} />
            </button>
          )}
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* This is the main conditional rendering logic:
          1. If searching, show search skeletons.
          2. If a search term is present and we're NOT searching, show results.
          3. If no search term, show the default Recent + Tabs view.
        */}
        {isSearching
          ? renderSearchSkeletons()
          : debouncedSearchTerm
          ? renderSearchResults()
          : renderDefaultContent()}
      </div>
    </motion.div>
  );
};

export default SearchModal;
