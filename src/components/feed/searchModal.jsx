// SearchModal.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// --- API PLACEHOLDERS ---
// You will need to implement these API fetching functions
// based on your backend.

// Fetches the default grid content for the "Top" tab
const fetchSearchTopContent = async () => {
  // const res = await fetch('/api/search/top');
  // if (!res.ok) throw new Error('Failed to fetch top content');
  // return res.json();
  
  // Mock data for example (REPLACE THIS)
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    {
      id: "p1",
      name: "iPhone 15 Pro",
      image: "https://via.placeholder.com/150/f9a8d4/8c3c10?text=Product",
      user: "Layo Gadgets",
    },
    {
      id: "p2",
      name: "iPhone 14",
      image: "https://via.placeholder.com/150/cccccc/333333?text=Product",
      user: "GadgetWorld",
    },
    {
      id: "p3",
      name: "Orange Phone",
      image: "https://via.placeholder.com/150/f9a8d4/8c3c10?text=Product",
      user: "Layo Gadgets",
    },
  ];
};

// Fetches the list of users for the "Users" tab
const fetchSearchUsersContent = async () => {
  // const res = await fetch('/api/search/users');
  // if (!res.ok) throw new Error('Failed to fetch users');
  // return res.json();
  
  // Mock data for example (REPLACE THIS)
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    { id: "u1", name: "Layo Gadgets", handle: "@layo", image: "https://via.placeholder.com/150/f9a8d4/8c3c10?text=User" },
    { id: "u2", name: "GadgetWorld", handle: "@gworld", image: "https://via.placeholder.com/150/cccccc/333333?text=User" },
  ];
};
// --- END API PLACEHOLDERS ---


// --- LOCALSTORAGE LOGIC ---
const RECENT_SEARCHES_KEY = "lily_recent_searches";

// Get recent searches from localStorage
const getRecentSearches = () => {
  try {
    const items = localStorage.getItem(RECENT_SEARCHES_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Failed to parse recent searches", error);
    return [];
  }
};

// Save recent searches to localStorage
const saveRecentSearches = (searches) => {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error("Failed to save recent searches", error);
  }
};
// --- END LOCALSTORAGE LOGIC ---


const SearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("Top");

  // State is now initialized from localStorage
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());

  // Your existing search logic (wired to Redux `shops` state)
  const shops = useSelector((state) => state.shops.shops);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    // This logic uses your Redux state, as you wrote
    let combinedShops = [];
    if (shops) {
      if (Array.isArray(shops)) {
        combinedShops = shops;
      } else if (typeof shops === "object") {
        combinedShops = [
          ...(Array.isArray(shops.sponsored_shops)
            ? shops.sponsored_shops
            : []),
          ...(Array.isArray(shops.for_you) ? shops.for_you : []),
        ];
      }
    }

    const filteredResults = combinedShops
      .filter(
        (shop) =>
          shop.name?.toLowerCase().includes(value.toLowerCase()) ||
          shop.description?.toLowerCase().includes(value.toLowerCase())
        // ... (keep your full filter logic here)
      )
      .slice(0, 5); // Show top 5 suggestions

    setSearchResults(filteredResults);
  };

  // Add to recent searches and navigate
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      // Add to recent searches
      const newSearches = [
        trimmedTerm,
        ...recentSearches.filter((term) => term !== trimmedTerm),
      ].slice(0, 10); // Keep only top 10

      setRecentSearches(newSearches);
      saveRecentSearches(newSearches); // Save to localStorage

      navigate(`/searchResults?q=${encodeURIComponent(trimmedTerm)}`);
      onClose(); // Close the modal
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  // Remove from recent searches state and localStorage
  const removeRecent = (termToRemove) => {
    const newSearches = recentSearches.filter((term) => term !== termToRemove);
    setRecentSearches(newSearches);
    saveRecentSearches(newSearches); // Update localStorage
  };

  // --- Data Fetching for Tabs ---
  const {
    data: topContent,
    isLoading: isLoadingTop,
    error: topError,
  } = useQuery({
    queryKey: ["searchTopContent"],
    queryFn: fetchSearchTopContent,
    enabled: activeTab === "Top" && !searchTerm, // Only fetch if tab is active and not searching
  });

  const {
    data: usersContent,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["searchUsersContent"],
    queryFn: fetchSearchUsersContent,
    enabled: activeTab === "Users" && !searchTerm, // Only fetch if tab is active and not searching
  });

  // Helper to render the tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "Top":
        if (isLoadingTop) return <Loader2 className="animate-spin mx-auto mt-4" />;
        if (topError) return <p className="text-red-500 text-center">Failed to load content.</p>;
        return (
          <div className="grid grid-cols-2 gap-4">
            {topContent?.map((product) => (
              <div key={product.id} className="cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg bg-gray-200"
                />
                <p className="mt-1 font-medium">{product.user}</p>
              </div>
            ))}
          </div>
        );
      case "Recent":
        // This tab can just re-use the recent searches
        return <p className="text-center text-gray-500">Recent view not yet implemented.</p>;
      case "Users":
        if (isLoadingUsers) return <Loader2 className="animate-spin mx-auto mt-4" />;
        if (usersError) return <p className="text-red-500 text-center">Failed to load users.</p>;
        return (
           <div className="space-y-3">
            {usersContent?.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
                <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full bg-gray-200" />
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
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 ml-2"
        >
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
        {/* If user is typing, show live suggestions (from Redux) */}
        {searchTerm && searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Suggestions</h3>
            {searchResults.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate(`/shop/${shop.id}`);
                  onClose();
                }}
              >
                {/* You can customize this suggestion UI */}
                <span className="font-medium">{shop.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* If user is NOT typing, show Recent/Top view */}
        {!searchTerm && (
          <div className="space-y-6">
            {/* Recent Searches List (from localStorage) */}
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

            {/* Tabs for Top/Users (from Figma & API) */}
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
              
              {/* Render content from API based on active tab */}
              {renderTabContent()}

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchModal;