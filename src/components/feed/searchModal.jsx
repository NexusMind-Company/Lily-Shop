import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  searchShops,
  searchFoodVendors,
  searchMealPlans,
  searchUsers,
} from "../../services/api";
import {
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
} from "../common/skeletons";
import { getVendorImageUrl } from "../../utils/vendorUtils";

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
  if (Array.isArray(data.items)) return data.items;
  return [];
};

const getInitials = (value = "") => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "MP";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getMealPlanImageUrl = (plan) => {
  if (Array.isArray(plan?.all_media_urls) && plan.all_media_urls[0]) {
    return plan.all_media_urls[0];
  }
  if (Array.isArray(plan?.media) && plan.media[0]) {
    return plan.media[0]?.src || plan.media[0];
  }
  return plan?.image_url || plan?.image || "";
};

const SearchModal = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Top");
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [_userLocation, setUserLocation] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {},
      );
    }
  }, []);

  const buildParams = () => {
    const term = debouncedSearchTerm.trim();
    if (!term) return null;
    return { search: term };
  };

  const buildUserParams = () => {
    const term = debouncedSearchTerm.trim();
    if (!term) return null;
    return { username: term };
  };

  const buildMealPlanParams = () => {
    const term = debouncedSearchTerm.trim();
    if (!term) return null;
    return { vendor__name: term };
  };

  // Immediate reactive queries for each category
  const { data: productResults, isLoading: isSearchingProducts } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm],
    queryFn: () => fetchProducts(buildParams()),
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Products"),
    select: extractArray,
  });

  const { data: contentResults, isLoading: isSearchingContents } = useQuery({
    queryKey: ["searchContents", debouncedSearchTerm],
    queryFn: async () => {
      const shopRaw = await searchShops(buildParams());
      return extractArray(shopRaw);
    },
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Shops"),
  });

  const { data: foodVendorResults, isLoading: isSearchingFoodVendors } =
    useQuery({
      queryKey: ["searchFoodVendors", debouncedSearchTerm],
      queryFn: () => searchFoodVendors(buildParams()),
      enabled:
        !!debouncedSearchTerm &&
        (activeTab === "Top" || activeTab === "Food Vendors"),
      select: extractArray,
    });

  const { data: mealPlanResults, isLoading: isSearchingMealPlans } = useQuery({
    queryKey: ["searchMealPlans", debouncedSearchTerm],
    queryFn: () => searchMealPlans(buildMealPlanParams()),
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Meal Plans"),
    select: extractArray,
    retry: 1,
  });

  const { data: userResults, isLoading: isSearchingUsers } = useQuery({
    queryKey: ["searchUsers", debouncedSearchTerm],
    queryFn: () => searchUsers(buildUserParams()),
    enabled:
      !!debouncedSearchTerm && (activeTab === "Top" || activeTab === "Users"),
    select: extractArray,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      const newSearches = [
        trimmedTerm,
        ...recentSearches.filter((term) => term !== trimmedTerm),
      ].slice(0, 10);
      setRecentSearches(newSearches);
      saveRecentSearches(newSearches);
      // We don't navigate anymore. We stay in the modal.
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

  const renderUserList = (users, limit = 5, showHeader = true) => {
    if (!Array.isArray(users) || users.length === 0) return null;
    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest px-2">
            Users
          </h3>
        )}
        <div className="space-y-3">
          {users.slice(0, limit).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 hover:shadow-sm hover:bg-gray-50/50 transition-all cursor-pointer group"
              onClick={() => {
                navigate(`/profile/${user.id}`);
                onClose();
              }}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.profile_pic || "/user.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full bg-gray-50 object-cover border border-gray-100 group-hover:border-lily/30 transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 truncate text-sm">
                      @{user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">
                        {user.follower_count || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Followers
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">
                        {user.following_count || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Following
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  user.is_following
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-lily text-white hover:bg-lily/90 shadow-sm hover:shadow"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${user.id}`);
                  onClose();
                }}
              >
                {user.is_following ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProductList = (products, limit = 5, showHeader = true) => {
    if (!Array.isArray(products) || products.length === 0) return null;
    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest px-2">
            Products
          </h3>
        )}
        <div className="space-y-2">
          {products.slice(0, limit).map((product) => (
            <div
              key={product.id}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => {
                navigate(`/product-details/${product.id}`);
                onClose();
              }}
            >
              <img
                src={
                  Array.isArray(product.media)
                    ? product.media[0]?.src || product.media[0]
                    : product.image_url || "/shop.png"
                }
                alt={product.name}
                className="w-12 h-12 rounded-xl bg-gray-50 object-cover border border-gray-100"
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 block truncate text-sm">
                  {product.caption || product.name || "Untitled"}
                </span>
                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                  By {product.user || "Unknown"} • {product.post_type} •{" "}
                  {product.like_count || 0} Likes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContentList = (contents, limit = 6, showHeader = true) => {
    if (!Array.isArray(contents) || contents.length === 0) return null;
    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest px-2">
            Shops
          </h3>
        )}
        <div className="grid grid-cols-2 gap-4">
          {contents.slice(0, limit).map((content) => (
            <div
              key={content.id}
              className="cursor-pointer group flex flex-col"
              onClick={() => {
                navigate(`/shop/${content.id}`);
                onClose();
              }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square border border-gray-100 shadow-sm">
                <img
                  src={content.image_url || "/shop.png"}
                  alt={content.name || "Shop"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-2 px-1 space-y-0.5">
                <p className="text-xs font-bold truncate text-gray-900">
                  {content.name || "Untitled"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium truncate">
                  <span>{content.category || "Shop"}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span>{content.avg_rating || 0} Rating</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVendorList = (vendors, limit = 5, showHeader = true) => {
    if (!Array.isArray(vendors) || vendors.length === 0) return null;
    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest px-2">
            Food Vendors
          </h3>
        )}
        <div className="space-y-2">
          {vendors.slice(0, limit).map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => {
                navigate(`/vendor-subscription/${vendor.id}`);
                onClose();
              }}
            >
              <img
                src={getVendorImageUrl(vendor) || "/user.png"}
                alt={vendor.name}
                className="w-12 h-12 rounded-full bg-gray-50 object-cover border border-gray-100"
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 block truncate text-sm">
                  {vendor.name}
                </span>
                <p className="text-xs text-gray-500 truncate">
                  {vendor.cuisine || "Food Vendor"}
                </p>
              </div>
              {vendor.verified && <Check size={16} className="text-lily" />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMealPlanList = (plans, limit = 5, showHeader = true) => {
    if (!Array.isArray(plans) || plans.length === 0) return null;
    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest px-2">
            Meal Plans
          </h3>
        )}
        <div className="space-y-2">
          {plans.slice(0, limit).map((plan) => {
            const planName = plan.plan_name || "Meal Plan";
            const imageUrl = getMealPlanImageUrl(plan);
            const initials = getInitials(planName);

            return (
              <div
                key={plan.id}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                onClick={() => {
                  navigate(`/meal-plan/${plan.id}`);
                  onClose();
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={planName}
                    className="w-12 h-12 rounded-xl bg-gray-50 object-cover border border-gray-100"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 rounded-xl bg-lily/10 flex items-center justify-center text-lily font-bold text-xs border border-lily/10 ${
                    imageUrl ? "hidden" : ""
                  }`}
                  aria-hidden={imageUrl ? "true" : undefined}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-gray-900 block truncate text-sm">
                    {planName}
                  </span>
                  <p className="text-xs text-lily font-bold">
                    {plan.price || "Price N/A"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTopSearchResults = () => {
    const hasAny =
      productResults?.length > 0 ||
      contentResults?.length > 0 ||
      foodVendorResults?.length > 0 ||
      mealPlanResults?.length > 0 ||
      userResults?.length > 0;

    if (
      !hasAny &&
      !isSearchingProducts &&
      !isSearchingContents &&
      !isSearchingFoodVendors &&
      !isSearchingMealPlans &&
      !isSearchingUsers
    ) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search size={40} className="mb-2 opacity-20" />
          <p className="text-sm font-medium">
            No results found for "{debouncedSearchTerm}"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {renderUserList(userResults, 3)}
        {renderProductList(productResults, 3)}
        {renderVendorList(foodVendorResults, 3)}
        {renderContentList(contentResults, 4)}
      </div>
    );
  };

  const renderTabContent = () => {
    if (!debouncedSearchTerm) {
      if (activeTab === "Top") {
        return (
          <div className="space-y-8">
            {recentSearches.length > 0 && (
              <div className="px-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Recent
                  </h3>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      saveRecentSearches([]);
                    }}
                    className="text-xs text-lily font-bold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <span
                        onClick={() => setSearchTerm(term)}
                        className="text-sm font-medium text-gray-700"
                      >
                        {term}
                      </span>
                      <X
                        size={14}
                        className="text-gray-400"
                        onClick={() => removeRecent(term)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="text-center py-20 text-gray-400 text-sm">
          Start typing to search {activeTab}...
        </div>
      );
    }

    const isSearchingAll =
      isSearchingProducts ||
      isSearchingContents ||
      isSearchingFoodVendors ||
      isSearchingUsers; // We exclude meal plans here to let others show if they finish first

    // Skeleton only if everything is still loading
    if (
      isSearchingAll &&
      !productResults &&
      !contentResults &&
      !foodVendorResults &&
      !userResults
    ) {
      return (
        <div className="space-y-6">
          <SearchSuggestionSkeleton />
          <SearchSuggestionSkeleton />
          <div className="grid grid-cols-2 gap-4">
            <SearchGridItemSkeleton />
            <SearchGridItemSkeleton />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Top":
        return renderTopSearchResults();
      case "Users":
        if (isSearchingUsers) return <SearchSuggestionSkeleton />;
        return (
          renderUserList(userResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No users found</p>
          )
        );
      case "Products":
        if (isSearchingProducts) return <SearchSuggestionSkeleton />;
        return (
          renderProductList(productResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No products found</p>
          )
        );
      case "Shops":
        if (isSearchingContents) return <SearchGridItemSkeleton />;
        return (
          renderContentList(contentResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No shops found</p>
          )
        );
      case "Food Vendors":
        if (isSearchingFoodVendors) return <SearchSuggestionSkeleton />;
        return (
          renderVendorList(foodVendorResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No vendors found</p>
          )
        );
      case "Meal Plans":
        if (isSearchingMealPlans) return <SearchSuggestionSkeleton />;
        return (
          renderMealPlanList(mealPlanResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">
              No meal plans found
            </p>
          )
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
          className="fixed inset-0 z-9999 bg-white md:bg-black/40 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-6"
          onClick={onClose}
        >
          <motion.div
            key="search-panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full h-full md:max-w-2xl bg-[#FFFBF9] md:rounded-[2.5rem] flex flex-col md:h-[85vh] shadow-none md:shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 p-4 md:p-6 flex items-center gap-3 border-b border-gray-100 bg-white">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Lily Shop..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-lily/30 text-gray-900 placeholder:text-gray-400 font-bold transition-all"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  autoFocus
                />
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={22}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white">
              {/* Tabs */}
              <div className="flex space-x-6 px-6 pt-4 border-b border-gray-50 overflow-x-auto no-scrollbar shrink-0">
                {[
                  "Top",
                  "Users",
                  "Products",
                  "Shops",
                  "Food Vendors",
                  "Meal Plans",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-black text-sm transition-colors relative cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? "text-lily"
                        : "text-gray-300 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-lily"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Content */}
              <div className="p-4 md:p-6 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + searchTerm}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
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
