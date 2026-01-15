import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { searchShops, fetchFeed } from "../../services/api";
import {
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
  SearchUserSkeleton,
=======
import { fetchFeed, fetchProducts } from "../../services/api"; // Changed to fetchProducts
import {
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
>>>>>>> origin/master
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

<<<<<<< HEAD
  // 1. Search Shops via API
  const { data: shopResults, isLoading: isSearchingShops } = useQuery({
    queryKey: ["searchShops", debouncedSearchTerm],
    queryFn: () => searchShops(debouncedSearchTerm),
=======
  // 1. Search Products via API (Replaced shops logic)
  const { data: productResults, isLoading: isSearchingProducts } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm],
    queryFn: () => fetchProducts({ search: debouncedSearchTerm }),
>>>>>>> origin/master
    select: (data) => data.results || [],
    enabled: !!debouncedSearchTerm,
  });

<<<<<<< HEAD
  // 2. Fetch Feed for "Top" suggestions
=======
  // 2. Fetch Feed for "Top" suggestions (Default view)
>>>>>>> origin/master
  const {
    data: topContent,
    isLoading: isLoadingTop,
    error: topError,
  } = useQuery({
    queryKey: ["feed", "forYou"],
    queryFn: fetchFeed,
    select: (data) => (Array.isArray(data) ? data : data.results || []),
    enabled: activeTab === "Top" && !debouncedSearchTerm,
  });

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

  // --- Renderers ---

  const renderSearchResults = () => (
    <div className="space-y-4">
<<<<<<< HEAD
      <h3 className="font-semibold text-gray-800">Shops</h3>
      {shopResults?.length === 0 && (
        <p className="text-gray-500 text-center">
          No shops found for "{debouncedSearchTerm}"
        </p>
      )}
      {shopResults?.map((shop) => (
        <div
          key={shop.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => {
            navigate(`/shop/${shop.id}`);
=======
      <h3 className="font-semibold text-gray-800">Products</h3>
      {productResults?.length === 0 && (
        <p className="text-gray-500 text-center">
          No products found for "{debouncedSearchTerm}"
        </p>
      )}
      {/* Updated to display Product items instead of Shop items */}
      {productResults?.slice(0, 5).map((product) => (
        <div
          key={product.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => {
            navigate(`/product-details/${product.id}`);
>>>>>>> origin/master
            onClose();
          }}
        >
          <img
<<<<<<< HEAD
            src={shop.image_url || "/shop.png"}
            alt={shop.name}
            className="w-12 h-12 rounded-full bg-gray-200 object-cover border border-gray-100"
=======
            src={
              Array.isArray(product.media)
                ? product.media[0]?.src
                : product.image_url || product.media || "/shop.png"
            }
            alt={product.name}
            className="w-12 h-12 rounded-lg bg-gray-200 object-cover border border-gray-100"
>>>>>>> origin/master
            onError={(e) => {
              e.target.src = "/shop.png";
            }}
          />
<<<<<<< HEAD
          <div>
            <span className="font-medium text-gray-900 block">{shop.name}</span>
            <p className="text-xs text-gray-500 line-clamp-1">
              {shop.category || "Shop"} • {shop.address || "Online"}
=======
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 block truncate">
              {product.name}
            </span>
            <p className="text-xs text-gray-500 truncate">
              {product.description || "No description"}
>>>>>>> origin/master
            </p>
          </div>
        </div>
      ))}
<<<<<<< HEAD
      
      <div 
=======

      <div
>>>>>>> origin/master
        className="pt-2 border-t border-gray-100 mt-2 cursor-pointer text-lily font-medium flex items-center gap-2"
        onClick={handleSearchSubmit}
      >
        <Search size={16} />
<<<<<<< HEAD
        See product results for "{debouncedSearchTerm}"
=======
        See all results for "{debouncedSearchTerm}"
>>>>>>> origin/master
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Top":
        if (isLoadingTop) {
          return (
            <div className="grid grid-cols-2 gap-4">
              <SearchGridItemSkeleton />
              <SearchGridItemSkeleton />
            </div>
          );
        }
        if (topError)
          return (
<<<<<<< HEAD
            <p className="text-red-500 text-center py-4">Failed to load content.</p>
=======
            <p className="text-red-500 text-center py-4">
              Failed to load content.
            </p>
>>>>>>> origin/master
          );
        return (
          <div className="grid grid-cols-2 gap-4">
            {topContent?.slice(0, 6).map((post) => (
              <div
                key={post.id}
                className="cursor-pointer group"
                onClick={() => {
                  navigate(`/product-details/${post.id}`);
                  onClose();
                }}
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                  {post.media || post.image_url ? (
<<<<<<< HEAD
                     <img
                     src={
                       Array.isArray(post.media) 
                         ? post.media[0]?.src 
                         : post.media || post.image_url
                     }
                     alt={post.name || "Post"}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   />
=======
                    <img
                      src={
                        Array.isArray(post.media)
                          ? post.media[0]?.src
                          : post.media || post.image_url
                      }
                      alt={post.name || "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
>>>>>>> origin/master
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium truncate text-gray-800">
                  {post.name || post.caption || "Untitled"}
                </p>
                <p className="text-xs text-gray-500 truncate">
<<<<<<< HEAD
                   {post.username || "Vendor"}
=======
                  {post.username || "Vendor"}
>>>>>>> origin/master
                </p>
              </div>
            ))}
          </div>
        );
      case "Recent":
        if (recentSearches.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search size={40} className="mb-2 opacity-50" />
              <p>No recent searches</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col">
            {recentSearches.map((term) => (
              <div
                key={term}
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg group"
              >
                <span
                  className="cursor-pointer flex-1 flex items-center gap-3 text-gray-700"
                  onClick={() => setSearchTerm(term)}
                >
                  <Search size={16} className="text-gray-400" />
                  {term}
                </span>
                <button
                  onClick={() => removeRecent(term)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        );
      case "Users":
        return (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
<<<<<<< HEAD
             <p className="text-sm">User search coming soon.</p>
             <p className="text-xs mt-1">Try searching for shops instead.</p>
=======
            <p className="text-sm">User search coming soon.</p>
            <p className="text-xs mt-1">Try searching for products instead.</p>
>>>>>>> origin/master
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
      <div className="flex-shrink-0 flex items-center p-4 border-b border-gray-200 gap-2">
<<<<<<< HEAD
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
=======
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
>>>>>>> origin/master
          <ChevronLeft size={24} />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
<<<<<<< HEAD
            placeholder="Search shops & products"
=======
            placeholder="Search products"
>>>>>>> origin/master
            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-lily/50 text-gray-800 placeholder:text-gray-400 transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
<<<<<<< HEAD
        {isSearchingShops ? (
           <div className="space-y-3">
             <SearchSuggestionSkeleton />
             <SearchSuggestionSkeleton />
             <SearchSuggestionSkeleton />
           </div>
=======
        {isSearchingProducts ? (
          <div className="space-y-3">
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
          </div>
>>>>>>> origin/master
        ) : debouncedSearchTerm ? (
          renderSearchResults()
        ) : (
          <div className="space-y-6">
            <div className="flex space-x-6 border-b border-gray-200">
              {["Top", "Recent", "Users"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${
                    activeTab === tab
                      ? "text-lily"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
<<<<<<< HEAD
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-lily" 
=======
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-lily"
>>>>>>> origin/master
                    />
                  )}
                </button>
              ))}
            </div>

<<<<<<< HEAD
            <div className="animate-fadeIn">
              {renderTabContent()}
            </div>
=======
            <div className="animate-fadeIn">{renderTabContent()}</div>
>>>>>>> origin/master
          </div>
        )}
      </div>
    </motion.div>
  );
};

<<<<<<< HEAD
export default SearchModal;
=======
export default SearchModal;
>>>>>>> origin/master
