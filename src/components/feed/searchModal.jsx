import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  searchShops,
  searchContents,
  searchFoodVendors,
  searchMealPlans,
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

const extractContents = (data) => {
  const arr = extractArray(data);
  return arr.filter(
    (item) =>
      item.post_type === "FUN" ||
      (!(
        item.post_type === "PRODUCT" ||
        item.type?.toLowerCase() === "product" ||
        item.price_in_naira !== undefined ||
        item.price !== undefined ||
        item.name !== undefined ||
        item.productName !== undefined
      ) &&
        item.feed_item_category !== "product"),
  );
};

const SearchModal = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Top");
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [userLocation, setUserLocation] = useState(null);
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
    const params = { search: term };
    if (userLocation) {
      params.lat = userLocation.lat;
      params.lon = userLocation.lon;
    }
    return params;
  };

  // Immediate reactive queries for each category
  const { data: productResults, isLoading: isSearchingProducts } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm, userLocation],
    queryFn: () => fetchProducts(buildParams()),
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Products"),
    select: (data) =>
      extractArray(data).filter(
        (item) =>
          item.post_type === "PRODUCT" || item.feed_item_category === "product",
      ),
  });

  const { data: contentResults, isLoading: isSearchingContents } = useQuery({
    queryKey: ["searchContents", debouncedSearchTerm, userLocation],
    queryFn: async () => {
      const contentRaw = await searchContents(buildParams());
      const shopRaw = await searchShops(buildParams());
      return [
        ...extractArray(shopRaw),
        ...extractContents({ results: extractArray(contentRaw) }),
      ];
    },
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Contents"),
  });

  const { data: foodVendorResults, isLoading: isSearchingFoodVendors } =
    useQuery({
      queryKey: ["searchFoodVendors", debouncedSearchTerm, userLocation],
      queryFn: () => searchFoodVendors(buildParams()),
      enabled:
        !!debouncedSearchTerm &&
        (activeTab === "Top" || activeTab === "Food Vendors"),
      select: extractArray,
    });

  const { data: mealPlanResults, isLoading: isSearchingMealPlans } = useQuery({
    queryKey: ["searchMealPlans", debouncedSearchTerm, userLocation],
    queryFn: () => searchMealPlans(buildParams()),
    enabled:
      !!debouncedSearchTerm &&
      (activeTab === "Top" || activeTab === "Meal Plans"),
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
            Contents
          </h3>
        )}
        <div className="grid grid-cols-2 gap-4">
          {contents.slice(0, limit).map((content) => (
            <div
              key={content.id}
              className="cursor-pointer group flex flex-col"
              onClick={() => {
                navigate(
                  content.owner
                    ? `/shop/${content.id}`
                    : `/contents/${content.id}`,
                );
                onClose();
              }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square border border-gray-100 shadow-sm">
                <img
                  src={
                    content.image_url ||
                    content.image ||
                    (Array.isArray(content.media)
                      ? content.media[0]
                      : content.media) ||
                    "/shop.png"
                  }
                  alt={content.name || "Content"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-2 px-1 space-y-0.5">
                <p className="text-xs font-bold truncate text-gray-900">
                  {content.caption || content.name || "Untitled"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium truncate">
                  <span>{content.user || "User"}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span>{content.post_type}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span>{content.like_count || 0} Likes</span>
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
                navigate(`/food-vendor/${vendor.id}`);
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
          {plans.slice(0, limit).map((plan) => (
            <div
              key={plan.id}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => {
                navigate(`/meal-plan/${plan.id}`);
                onClose();
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-lily/10 flex items-center justify-center text-lily font-bold text-xs">
                MP
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 block truncate text-sm">
                  {plan.plan_name}
                </span>
                <p className="text-xs text-lily font-bold">
                  {plan.price || "Price N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTopSearchResults = () => {
    const hasAny =
      productResults?.length > 0 ||
      contentResults?.length > 0 ||
      foodVendorResults?.length > 0 ||
      mealPlanResults?.length > 0;

    if (
      !hasAny &&
      !isSearchingProducts &&
      !isSearchingContents &&
      !isSearchingFoodVendors &&
      !isSearchingMealPlans
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

    if (
      isSearchingProducts ||
      isSearchingContents ||
      isSearchingFoodVendors ||
      isSearchingMealPlans
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
      case "Products":
        return (
          renderProductList(productResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No products found</p>
          )
        );
      case "Contents":
        return (
          renderContentList(contentResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No contents found</p>
          )
        );
      case "Food Vendors":
        return (
          renderVendorList(foodVendorResults, 20, false) || (
            <p className="text-center py-10 text-gray-400">No vendors found</p>
          )
        );
      case "Meal Plans":
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
                  "Products",
                  "Contents",
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
