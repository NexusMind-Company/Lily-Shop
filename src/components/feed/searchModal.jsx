import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllFeed,
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

const RECENT_SEARCHES_KEY = "lily_recent_searches";
const ENABLE_INLINE_FILTERS = true; // Set to false to push ALL filtering to the dedicated search results page

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
  if (Array.isArray(data.data)) return data.data;
  const arrayProp = Object.keys(data).find(
    (key) => Array.isArray(data[key]) && data[key].length > 0,
  );
  if (arrayProp) return data[arrayProp];
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
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    state: "",
    lga: "",
    verified: false,
    min_price: "",
    max_price: "",
    frequency: "",
    ordering: "",
  });

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
    const params = {};
    if (term) params.search = term;

    if (userLocation) {
      params.lat = userLocation.lat;
      params.lon = userLocation.lon;
    }

    if (activeTab === "Contents" && filters.ordering) {
      params.ordering = filters.ordering;
    }

    if (activeTab === "Food Vendors") {
      if (filters.state) params.state = filters.state;
      if (filters.lga) params.lga = filters.lga;
      if (filters.verified) params.verified = true;
    }

    if (activeTab === "Meal Plans") {
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.frequency) params.frequency = filters.frequency;
    }

    return Object.keys(params).length > 0 ? params : null;
  };

  const { data: productResults, isLoading: isSearchingProducts } = useQuery({
    queryKey: ["searchProducts", debouncedSearchTerm, userLocation],
    queryFn: async () => {
      const raw = await fetchProducts(buildParams());
      return extractArray(raw);
    },
    enabled:
      (activeTab === "Top" || activeTab === "Products") &&
      !!debouncedSearchTerm,
  });

  const { data: contentResults, isLoading: isSearchingContents } = useQuery({
    queryKey: [
      "searchContents",
      debouncedSearchTerm,
      userLocation,
      filters.ordering,
    ],
    queryFn: async () => {
      const contentRaw = await searchContents(buildParams());
      const contents = extractContents({ results: extractArray(contentRaw) });

      let shops = [];
      if (!filters.ordering || activeTab === "Contents") {
        const shopRaw = await searchShops(buildParams());
        shops = extractArray(shopRaw);
      }

      return [...shops, ...contents];
    },
    enabled:
      (activeTab === "Top" || activeTab === "Contents") &&
      !!debouncedSearchTerm,
  });

  const { data: foodVendorResults, isLoading: isSearchingFoodVendors } =
    useQuery({
      queryKey: [
        "searchFoodVendors",
        debouncedSearchTerm,
        filters.state,
        filters.lga,
        filters.verified,
      ],
      queryFn: async () => {
        const raw = await searchFoodVendors(buildParams());
        return extractArray(raw);
      },
      enabled: activeTab === "Food Vendors" && !!debouncedSearchTerm,
    });

  const { data: mealPlanResults, isLoading: isSearchingMealPlans } = useQuery({
    queryKey: [
      "searchMealPlans",
      debouncedSearchTerm,
      filters.min_price,
      filters.max_price,
      filters.frequency,
    ],
    queryFn: async () => {
      const raw = await searchMealPlans(buildParams());
      return extractArray(raw);
    },
    enabled: activeTab === "Meal Plans" && !!debouncedSearchTerm,
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      state: "",
      lga: "",
      verified: false,
      min_price: "",
      max_price: "",
      frequency: "",
      ordering: "",
    });
  };

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

      const queryParams = new URLSearchParams({
        q: trimmedTerm,
        tab: activeTab,
      });
      if (filters.ordering) queryParams.append("ordering", filters.ordering);
      if (filters.state) queryParams.append("state", filters.state);
      if (filters.verified) queryParams.append("verified", filters.verified);
      if (filters.min_price) queryParams.append("min_price", filters.min_price);
      if (filters.max_price) queryParams.append("max_price", filters.max_price);
      if (filters.frequency) queryParams.append("frequency", filters.frequency);

      navigate(`/searchResults?${queryParams.toString()}`);
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

  const renderFoodVendorList = (vendors, limit = 5, showHeader = true) => {
    if (!Array.isArray(vendors) || vendors.length === 0) {
      return showHeader ? (
        <p className="text-gray-500 text-center py-4 text-sm">
          No food vendors found for "{debouncedSearchTerm}"
        </p>
      ) : null;
    }

    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-semibold text-gray-800">Food Vendors</h3>
        )}
        {vendors.slice(0, limit).map((vendor) => (
          <div
            key={vendor.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => {
              navigate(`/food-vendor/${vendor.id}`);
              onClose();
            }}
          >
            <img
              src={vendor.image_url || "/user.png"}
              alt={vendor.name}
              className="w-12 h-12 rounded-full bg-gray-200 object-cover border border-gray-100"
              onError={(e) => {
                e.target.src = "/user.png";
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 block truncate">
                {vendor.name}
              </span>
              <p className="text-xs text-gray-500 truncate">
                {vendor.cuisine || "Food Vendor"} •{" "}
                {vendor.location || "Nigeria"}
              </p>
            </div>
            {vendor.verified && (
              <Check size={16} className="text-lily shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMealPlanList = (plans, limit = 5, showHeader = true) => {
    if (!Array.isArray(plans) || plans.length === 0) {
      return showHeader ? (
        <p className="text-gray-500 text-center py-4 text-sm">
          No meal plans found for "{debouncedSearchTerm}"
        </p>
      ) : null;
    }

    return (
      <div className="space-y-4">
        {showHeader && (
          <h3 className="font-semibold text-gray-800">Meal Plans</h3>
        )}
        {plans.slice(0, limit).map((plan) => (
          <div
            key={plan.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => {
              navigate(`/meal-plan/${plan.id}`);
              onClose();
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-lily/10 flex items-center justify-center text-lily font-bold">
              MP
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 block truncate">
                {plan.plan_name}
              </span>
              <p className="text-xs text-gray-500 truncate">
                {plan.price || "Price unavailable"} •{" "}
                {plan.frequency || "Monthly"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInlineFilters = () => {
    if (!ENABLE_INLINE_FILTERS) return null;

    const renderContentFilters = () => (
      <>
        {["Newest", "Popular", "Rating"].map((opt) => (
          <button
            key={opt}
            onClick={() =>
              handleFilterChange(
                "ordering",
                filters.ordering === opt.toLowerCase() ? "" : opt.toLowerCase(),
              )
            }
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.ordering === opt.toLowerCase()
                ? "bg-lily text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </>
    );

    const renderVendorFilters = () => (
      <>
        <button
          onClick={() => handleFilterChange("verified", !filters.verified)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            filters.verified
              ? "bg-lily text-white border-lily"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Verified Only
        </button>
        {["Lagos", "Abuja", "Rivers", "Oyo", "Enugu"].map((state) => (
          <button
            key={state}
            onClick={() =>
              handleFilterChange("state", filters.state === state ? "" : state)
            }
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.state === state
                ? "bg-lily text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {state}
          </button>
        ))}
      </>
    );

    const renderMealFilters = () => (
      <>
        {[
          { label: "Under ₦5k", min: "0", max: "5000" },
          { label: "₦5k - ₦15k", min: "5000", max: "15000" },
          { label: "₦15k - ₦30k", min: "15000", max: "30000" },
          { label: "Above ₦30k", min: "30000", max: "1000000" },
        ].map((range) => (
          <button
            key={range.label}
            onClick={() => {
              if (
                filters.min_price === range.min &&
                filters.max_price === range.max
              ) {
                handleFilterChange("min_price", "");
                handleFilterChange("max_price", "");
              } else {
                handleFilterChange("min_price", range.min);
                handleFilterChange("max_price", range.max);
              }
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.min_price === range.min && filters.max_price === range.max
                ? "bg-lily text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {range.label}
          </button>
        ))}
        {["Daily", "Weekly", "Monthly"].map((freq) => (
          <button
            key={freq}
            onClick={() =>
              handleFilterChange(
                "frequency",
                filters.frequency === freq.toLowerCase()
                  ? ""
                  : freq.toLowerCase(),
              )
            }
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.frequency === freq.toLowerCase()
                ? "bg-lily text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {freq}
          </button>
        ))}
      </>
    );

    let items = null;
    if (activeTab === "Contents") items = renderContentFilters();
    if (activeTab === "Food Vendors") items = renderVendorFilters();
    if (activeTab === "Meal Plans") items = renderMealFilters();

    if (!items) return null;

    return (
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-3 border-b border-gray-100">
        {items}
      </div>
    );
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
                navigate(
                  content.owner
                    ? `/shop/${content.id}`
                    : `/contents/${content.id}`,
                );
                onClose();
              }}
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                {content.media || content.image_url || content.image ? (
                  <img
                    src={
                      Array.isArray(content.media)
                        ? content.media[0]?.src || content.media[0]
                        : content.media || content.image_url || content.image
                    }
                    alt={content.caption || content.name || "Content"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    No Image
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm font-medium truncate text-gray-800">
                {content.caption || content.name || "Untitled"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {content.user?.username || content.owner?.username
                  ? `@${content.user?.username || content.owner?.username}`
                  : "vendor"}
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
    if (
      isSearchingProducts ||
      isSearchingContents ||
      isSearchingFoodVendors ||
      isSearchingMealPlans
    ) {
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
      (Array.isArray(contentResults) && contentResults.length > 0) ||
      (Array.isArray(foodVendorResults) && foodVendorResults.length > 0) ||
      (Array.isArray(mealPlanResults) && mealPlanResults.length > 0);

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
        {Array.isArray(productResults) &&
          productResults.length > 0 &&
          renderProductList(productResults, 3, true)}
        {Array.isArray(contentResults) &&
          contentResults.length > 0 &&
          renderContentList(contentResults, 4, true)}
        {Array.isArray(foodVendorResults) &&
          foodVendorResults.length > 0 &&
          renderFoodVendorList(foodVendorResults, 3, true)}
        {Array.isArray(mealPlanResults) &&
          mealPlanResults.length > 0 &&
          renderMealPlanList(mealPlanResults, 3, true)}
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
            <p className="text-sm">Search for contents, posts, and shops.</p>
            <p className="text-xs mt-1">Start typing to find contents.</p>
          </div>
        );
      case "Food Vendors":
        return debouncedSearchTerm ? (
          isSearchingFoodVendors ? (
            <div className="space-y-3">
              <SearchSuggestionSkeleton />
              <SearchSuggestionSkeleton />
            </div>
          ) : (
            renderFoodVendorList(foodVendorResults, 20, false)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
            <p className="text-sm">Search for food vendors.</p>
            <p className="text-xs mt-1">Start typing to find food vendors.</p>
          </div>
        );
      case "Meal Plans":
        return debouncedSearchTerm ? (
          isSearchingMealPlans ? (
            <div className="space-y-3">
              <SearchSuggestionSkeleton />
              <SearchSuggestionSkeleton />
            </div>
          ) : (
            renderMealPlanList(mealPlanResults, 20, false)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
            <p className="text-sm">Search for subscription meal plans.</p>
            <p className="text-xs mt-1">Start typing to find meal plans.</p>
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
                  placeholder="Search Lily Shop"
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex space-x-6 px-4 pt-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
                {[
                  "Top",
                  "Products",
                  "Contents",
                  "Food Vendors",
                  "Meal Plans",
                  "Recent",
                ].map((tab) => (
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
                ))}
              </div>

              {renderInlineFilters()}

              <div className="p-4 space-y-6 animate-fadeIn">
                {renderTabContent()}
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
