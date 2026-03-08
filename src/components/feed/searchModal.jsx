import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllFeed, fetchProducts } from "../../services/api";
import {
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
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

const SearchModal = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Top");
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: productResults, isLoading: isSearchingProducts } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm],
    queryFn: () => fetchProducts({ search: debouncedSearchTerm }),
    select: (data) => data.results || [],
    enabled: !!debouncedSearchTerm,
  });

  const {
    data: topContent,
    isLoading: isLoadingTop,
    error: topError,
  } = useQuery({
    queryKey: ["feed", "forYou"],
    queryFn: fetchAllFeed,
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

  const renderSearchResults = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Products</h3>
      {productResults?.length === 0 && (
        <p className="text-gray-500 text-center">
          No products found for "{debouncedSearchTerm}"
        </p>
      )}
      {productResults?.slice(0, 5).map((product) => (
        <div
          key={product.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => {
            navigate(`/product-details/${product.id}`);
            onClose();
          }}
        >
          <img
            src={
              Array.isArray(product.media)
                ? product.media[0]?.src
                : product.image_url || product.media || "/shop.png"
            }
            alt={product.name}
            className="w-12 h-12 rounded-lg bg-gray-200 object-cover border border-gray-100"
            onError={(e) => {
              e.target.src = "/shop.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 block truncate">
              {product.name}
            </span>
            <p className="text-xs text-gray-500 truncate">
              {product.description || "No description"}
            </p>
          </div>
        </div>
      ))}

      <div
        className="pt-2 border-t border-gray-100 mt-2 cursor-pointer text-lily font-medium flex items-center gap-2"
        onClick={handleSearchSubmit}
      >
        <Search size={16} />
        See all results for "{debouncedSearchTerm}"
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
            <p className="text-red-500 text-center py-4">
              Failed to load content.
            </p>
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
                    <img
                      src={
                        Array.isArray(post.media)
                          ? post.media[0]?.src
                          : post.media || post.image_url
                      }
                      alt={post.name || "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                  {post.username || "Vendor"}
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
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
            <p className="text-sm">User search coming soon.</p>
            <p className="text-xs mt-1">Try searching for products instead.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-white md:bg-black/50 flex justify-center items-end md:left-64 md:w-[calc(100%-16rem)] md:justify-start md:items-center md:p-6 cursor-pointer pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            key="search-panel"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full h-full md:max-w-xl bg-white md:rounded-3xl shadow-none md:shadow-2xl flex flex-col md:h-[90vh] cursor-default relative overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center p-4 border-b border-gray-200 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isSearchingProducts ? (
                <div className="space-y-3">
                  <SearchSuggestionSkeleton />
                  <SearchSuggestionSkeleton />
                  <SearchSuggestionSkeleton />
                </div>
              ) : debouncedSearchTerm ? (
                renderSearchResults()
              ) : (
                <div className="space-y-6">
                  <div className="flex space-x-6 border-b border-gray-200">
                    {["Top", "Recent", "Users"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
                          activeTab === tab
                            ? "text-lily"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-lily"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="animate-fadeIn">{renderTabContent()}</div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default SearchModal;
