import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllFeed,
  fetchProducts,
  searchShops,
  searchContents,
} from "../../services/api";
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

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.feed)) return data.feed;
  return [];
};

const extractProducts = (data) => {
  const arr = extractArray(data);
  return arr.filter(
    (item) =>
      item.type?.toLowerCase() === "product" ||
      item.price_in_naira !== undefined ||
      item.price !== undefined ||
      item.name !== undefined ||
      item.productName !== undefined,
  );
};

const extractContents = (data) => {
  const arr = extractArray(data);
  return arr.filter(
    (item) =>
      !(
        item.type?.toLowerCase() === "product" ||
        item.price_in_naira !== undefined ||
        item.price !== undefined ||
        item.name !== undefined ||
        item.productName !== undefined
      ),
  );
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
    select: extractProducts,
    enabled:
      (activeTab === "Top" || activeTab === "Products") &&
      !!debouncedSearchTerm,
  });

  const { data: shopResults, isLoading: isSearchingShops } = useQuery({
    queryKey: ["searchShops", debouncedSearchTerm],
    queryFn: () => searchShops(debouncedSearchTerm),
    select: extractArray,
    enabled:
      (activeTab === "Top" || activeTab === "Shops") && !!debouncedSearchTerm,
  });

  const { data: contentResults, isLoading: isSearchingContents } = useQuery({
    queryKey: ["searchContents", debouncedSearchTerm],
    queryFn: () => searchContents(debouncedSearchTerm),
    select: extractContents,
    enabled:
      (activeTab === "Top" || activeTab === "Contents") &&
      !!debouncedSearchTerm,
  });

  const {
    data: topContent,
    isLoading: isLoadingTop,
    error: topError,
  } = useQuery({
    queryKey: ["feed", "forYou"],
    queryFn: fetchAllFeed,
    select: extractArray,
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

      navigate(
        `/searchResults?q=${encodeURIComponent(trimmedTerm)}&tab=${activeTab}`,
      );
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

  const renderProductList = (products, limit = 5, showHeader = true) => {
    if (!Array.isArray(products) || products.length === 0) {
      return showHeader ? (
        <p className="text-gray-500 text-center py-4 text-sm">
          No products found for "{debouncedSearchTerm}"
        </p>
      ) : null;
    }

    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-semibold text-gray-800">Products</h3>
        )}
        {products.slice(0, limit).map((product) => (
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
                  ? product.media[0]?.src || product.media[0]
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
                {product.price_in_naira
                  ? `₦${product.price_in_naira}`
                  : "Price unavailable"}{" "}
                • {product.shop_name || "Shop"}
              </p>
            </div>
          </div>
        ))}
        {showHeader && products.length > limit && (
          <div
            className="pt-2 border-t border-gray-100 mt-2 cursor-pointer text-lily font-medium flex items-center gap-2"
            onClick={() => setActiveTab("Products")}
          >
            <Search size={16} />
            See all product results
          </div>
        )}
      </div>
    );
  };

  const renderShopList = (shops, limit = 5, showHeader = true) => {
    if (!Array.isArray(shops) || shops.length === 0) {
      return showHeader ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            No shops found for "{debouncedSearchTerm}"
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hint: Try searching by Shop Name instead of username.
          </p>
        </div>
      ) : null;
    }

    return (
      <div className="space-y-4">
        {showHeader && <h3 className="font-semibold text-gray-800">Shops</h3>}
        {shops.slice(0, limit).map((shop) => (
          <div
            key={shop.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => {
              navigate(`/shop/${shop.id}`);
              onClose();
            }}
          >
            <img
              src={shop.image_url || shop.image || "/user.png"}
              alt={shop.name}
              className="w-12 h-12 rounded-full bg-gray-200 object-cover border border-gray-100"
              onError={(e) => {
                e.target.src = "/user.png";
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 block truncate">
                {shop.name}
              </span>
              <p className="text-xs text-gray-500 truncate">
                {shop.owner && shop.owner.username
                  ? `@${shop.owner.username} • `
                  : ""}
                {shop.category || "Vendor"} • {shop.follower_count || 0}{" "}
                followers
              </p>
            </div>
          </div>
        ))}
        {showHeader && shops.length > limit && (
          <div
            className="pt-2 border-t border-gray-100 mt-2 cursor-pointer text-lily font-medium flex items-center gap-2"
            onClick={() => setActiveTab("Shops")}
          >
            <Search size={16} />
            See all shop results
          </div>
        )}
      </div>
    );
  };

  const renderContentList = (contents, limit = 6, showHeader = true) => {
    if (!Array.isArray(contents) || contents.length === 0) {
      return showHeader ? (
        <p className="text-gray-500 text-center py-4 text-sm">
          No contents found for "{debouncedSearchTerm}"
        </p>
      ) : null;
    }

    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-semibold text-gray-800">Contents</h3>
        )}
        <div className="grid grid-cols-2 gap-4">
          {contents.slice(0, limit).map((content) => (
            <div
              key={content.id}
              className="cursor-pointer group"
              onClick={() => {
                navigate(`/contents/${content.id}`);
                onClose();
              }}
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                {content.media || content.image_url ? (
                  <img
                    src={
                      Array.isArray(content.media)
                        ? content.media[0]?.src || content.media[0]
                        : content.media || content.image_url
                    }
                    alt={content.caption || "Content"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    No Image
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm font-medium truncate text-gray-800">
                {content.caption || "Untitled"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{content.user?.username || content.user_name || "user"}
              </p>
            </div>
          ))}
        </div>
        {showHeader && contents.length > limit && (
          <div
            className="pt-2 border-t border-gray-100 mt-2 cursor-pointer text-lily font-medium flex items-center gap-2"
            onClick={() => setActiveTab("Contents")}
          >
            <Search size={16} />
            See all content results
          </div>
        )}
      </div>
    );
  };

  const renderTopFeed = () => {
    if (isLoadingTop) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <SearchGridItemSkeleton />
          <SearchGridItemSkeleton />
        </div>
      );
    }
    if (topError) {
      return (
        <p className="text-red-500 text-center py-4">
          Failed to load top feed.
        </p>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-4">
        {topContent?.slice(0, 10).map((post) => (
          <div
            key={post.id}
            className="cursor-pointer group"
            onClick={() => {
              navigate(
                post.price !== undefined || post.price_in_naira !== undefined
                  ? `/product-details/${post.id}`
                  : `/contents/${post.id}`,
              );
              onClose();
            }}
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
              {post.media || post.image_url ? (
                <img
                  src={
                    Array.isArray(post.media)
                      ? post.media[0]?.src || post.media[0]
                      : post.media || post.image_url
                  }
                  alt={post.name || post.caption || "Post"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  No Image
                </div>
              )}
            </div>
            <p className="mt-1 text-sm font-medium truncate text-gray-800">
              {post.name || post.caption || "Untitled"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {post.shop_name || post.user?.username || "Vendor"}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderTopSearchResults = () => {
    if (isSearchingProducts || isSearchingShops || isSearchingContents) {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <SearchSuggestionSkeleton />
            <SearchSuggestionSkeleton />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchGridItemSkeleton />
            <SearchGridItemSkeleton />
          </div>
        </div>
      );
    }

    const hasAnyResults =
      (Array.isArray(productResults) && productResults.length > 0) ||
      (Array.isArray(shopResults) && shopResults.length > 0) ||
      (Array.isArray(contentResults) && contentResults.length > 0);

    if (!hasAnyResults) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 px-4 text-center">
          <Search size={40} className="mb-2 opacity-50" />
          <p className="text-sm font-medium text-gray-600">
            No results found for "{debouncedSearchTerm}"
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Hint: Usernames are currently not searchable. Try searching by the
            exact Shop Name or Product Name.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-4">
        {Array.isArray(shopResults) &&
          shopResults.length > 0 &&
          renderShopList(shopResults, 3, true)}
        {Array.isArray(productResults) &&
          productResults.length > 0 &&
          renderProductList(productResults, 3, true)}
        {Array.isArray(contentResults) &&
          contentResults.length > 0 &&
          renderContentList(contentResults, 4, true)}
      </div>
    );
  };

  const renderRecentTab = () => {
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
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Top":
        return debouncedSearchTerm ? renderTopSearchResults() : renderTopFeed();
      case "Products":
        return debouncedSearchTerm ? (
          isSearchingProducts ? (
            <div className="space-y-3">
              <SearchSuggestionSkeleton />
              <SearchSuggestionSkeleton />
              <SearchSuggestionSkeleton />
            </div>
          ) : (
            renderProductList(productResults, 20, false)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
            <p className="text-sm">Search for products.</p>
            <p className="text-xs mt-1">Start typing to find products.</p>
          </div>
        );
      case "Contents":
        return debouncedSearchTerm ? (
          isSearchingContents ? (
            <div className="grid grid-cols-2 gap-4">
              <SearchGridItemSkeleton />
              <SearchGridItemSkeleton />
            </div>
          ) : (
            renderContentList(contentResults, 20, false)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
            <p className="text-sm">Search for contents and posts.</p>
            <p className="text-xs mt-1">Start typing to find contents.</p>
          </div>
        );
      case "Shops":
        return debouncedSearchTerm ? (
          isSearchingShops ? (
            <div className="space-y-3">
              <SearchSuggestionSkeleton />
              <SearchSuggestionSkeleton />
            </div>
          ) : (
            renderShopList(shopResults, 20, false)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
            <p className="text-sm">Search for shops and vendors.</p>
            <p className="text-xs mt-1">Start typing to find shops.</p>
          </div>
        );
      case "Recent":
        return renderRecentTab();
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
          className="fixed inset-0 z-9999 bg-white md:bg-black/50 flex justify-center items-end md:left-64 md:w-[calc(100%-16rem)] md:justify-start md:items-center md:p-6 cursor-pointer pointer-events-auto"
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
            <div className="shrink-0 flex items-center p-4 border-b border-gray-200 gap-2">
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
                  placeholder="Search products, contents, or shops"
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
              <div className="space-y-6">
                <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
                  {["Top", "Products", "Contents", "Shops", "Recent"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer whitespace-nowrap ${
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
                    ),
                  )}
                </div>

                <div className="animate-fadeIn">{renderTabContent()}</div>
              </div>
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
