import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInterests,
  fetchAvailableInterests,
  updateUserInterests,
} from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Sparkles,
  Check,
  Search,
  Heart,
  Tag,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

const InterestsSelector = ({ mode = "settings", onComplete, onSkip }) => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Live endpoint call for searched interests
  const {
    data: searchResultsData,
    isLoading: isSearching,
  } = useQuery({
    queryKey: ["interestsSearch", debouncedQuery],
    queryFn: () => fetchInterests({ search: debouncedQuery, q: debouncedQuery, name: debouncedQuery, page_size: 50 }),
    enabled: debouncedQuery.length > 0,
    staleTime: 60 * 1000,
  });

  const searchResults = useMemo(() => {
    if (!searchResultsData) return [];
    return Array.isArray(searchResultsData)
      ? searchResultsData
      : searchResultsData.results || [];
  }, [searchResultsData]);

  // 1. Fetch all available interests in the system
  const {
    data: allInterestsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["interests"],
    queryFn: () => fetchInterests({ page_size: 100 }),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  // 2. Fetch available (unselected) interests for the current user
  const {
    data: availableInterestsData,
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = useQuery({
    queryKey: ["availableInterests"],
    queryFn: () => fetchAvailableInterests({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Safe parsing of paginated API results & merging live endpoint search results
  const allInterests = useMemo(() => {
    const baseList = !allInterestsData ? [] : (Array.isArray(allInterestsData)
      ? allInterestsData
      : allInterestsData.results || []);
    const searchList = !searchResultsData ? [] : (Array.isArray(searchResultsData)
      ? searchResultsData
      : searchResultsData.results || []);
    const map = new Map();
    baseList.forEach((item) => map.set(item.id, item));
    searchList.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [allInterestsData, searchResultsData]);

  const availableInterests = useMemo(() => {
    if (!availableInterestsData) return [];
    return Array.isArray(availableInterestsData)
      ? availableInterestsData
      : availableInterestsData.results || [];
  }, [availableInterestsData]);

  // Determine currently selected interests by computing difference: All - Available
  useEffect(() => {
    if (allInterests.length > 0 && availableInterests && !hasInitialized) {
      const availableIdsSet = new Set(availableInterests.map((item) => item.id));
      const currentlySelected = allInterests
        .filter((item) => !availableIdsSet.has(item.id))
        .map((item) => item.id);

      setSelectedIds(currentlySelected);
      setHasInitialized(true);
    }
  }, [allInterests, availableInterests, hasInitialized]);

  // Extract unique categories for tabs
  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    allInterests.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [allInterests]);

  // Filter items by category and search query
  const filteredInterests = useMemo(() => {
    return allInterests.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allInterests, activeCategory, searchQuery]);

  // Toggle selection state with tactile feedback
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Save mutation complying with React Query v5 user rule & profile caching strategy
  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    mutationFn: async (interests) => {
      const response = await updateUserInterests(interests);
      return response.data || response;
    },
    onSuccess: async () => {
      toast.success(
        mode === "onboarding"
          ? "Interests saved! Tailoring your feed..."
          : "Your content interests have been updated!"
      );
      // React Query v5 require object syntax for invalidateQueries
      await queryClient.invalidateQueries({ queryKey: ["availableInterests"] });
      await queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
    onError: (err) => {
      console.error("Failed to update interests:", err);
      toast.error("Failed to save preferences. Please try again.");
    },
  });

  const handleSubmit = async () => {
    if (selectedIds.length === 0 && mode === "onboarding") {
      toast.error("Please pick at least 2 interests to customize your feed!");
      return;
    }
    await saveInterests(selectedIds);
    if (onComplete) onComplete(selectedIds);
  };

  const isLoading = isLoadingAll || isLoadingAvailable;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 font-poppins">
      {/* Header section with rich gradient & aesthetic typography */}
      <div className="text-center sm:text-left mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lily/10 text-lily font-semibold text-sm mb-3 shadow-sm border border-lily/20">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Personalize Your Experience</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          {mode === "onboarding" ? "Welcome! What are your passions?" : "Manage Your Content Interests"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          {mode === "onboarding"
            ? "Choose topics you enjoy so we can curate a lively, personalized TikTok-style For You Page full of small creators and trending meals."
            : "Tailor your For You Page by adding or removing content categories. Your selections instantly adjust our TikTok-style viral recommendation algorithm."}
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search interests (e.g., Spicy Foods, Fashion, Tech)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-black placeholder-gray-500 border border-black focus:border-lily rounded-2xl text-sm sm:text-base outline-none transition-all duration-200 shadow-inner focus:shadow-md"
          />
        </div>

        {/* Populated field from endpoint search results to pick from */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-4 shadow-lg mb-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-lily" />
                Live Endpoint Matches ({isSearching ? "Querying..." : `${(searchResults.length > 0 ? searchResults : filteredInterests).length} available to pick`})
              </span>
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-lily" />}
            </div>
            {isSearching ? (
              <div className="py-4 flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-lily" />
                <span>Searching live endpoint for "{searchQuery}"...</span>
              </div>
            ) : (searchResults.length > 0 ? searchResults : filteredInterests).length === 0 ? (
              <div className="py-4 text-center text-gray-500 text-sm">
                No matching interests returned from server for <span className="font-semibold text-gray-800">"{searchQuery}"</span>.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                {(searchResults.length > 0 ? searchResults : filteredInterests).map((interest) => {
                  const isSelected = selectedIds.includes(interest.id);
                  return (
                    <button
                      key={`picker-${interest.id}`}
                      type="button"
                      onClick={() => handleToggle(interest.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm transform active:scale-95 ${isSelected
                          ? "bg-lily text-white shadow-lily/20"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isSelected ? "bg-white text-lily" : "bg-black text-white font-extrabold"
                        }`}>
                        {isSelected ? <Check className="w-3 h-3 font-bold" /> : "+"}
                      </span>
                      <span>{interest.name}</span>
                      {interest.category && (
                        <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                          }`}>
                          {interest.category}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Categories Carousel / Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${activeCategory === cat
                    ? "bg-gray-900 text-white shadow-md transform scale-102"
                    : "bg-gray-100 hover:bg-gray-200/80 text-gray-700"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-sm font-medium">Loading topics tailored for you...</p>
        </div>
      ) : isErrorAll ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-red-50/50 rounded-2xl p-6 text-center border border-red-100">
          <p className="text-red-600 font-semibold mb-2">Oops! Couldn't load interests.</p>
          <button
            onClick={() => {
              refetchAll();
              refetchAvailable();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium hover:bg-red-50 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : filteredInterests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">No interests found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="mt-3 text-lily font-semibold text-sm hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-20">
          {filteredInterests.map((interest) => {
            const isSelected = selectedIds.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => handleToggle(interest.id)}
                className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 select-none transform active:scale-95 ${isSelected
                    ? "bg-lily text-white shadow-lg shadow-lily/20 scale-[1.02] border border-transparent"
                    : "bg-white hover:bg-gray-50/90 text-gray-800 border border-gray-200 hover:border-lily shadow-sm hover:shadow"
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`p-2 rounded-xl text-xs transition-colors ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-black group-hover:bg-gray-200"
                    }`}>
                    <Tag className="w-4 h-4" />
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected
                      ? "bg-white text-lily shadow"
                      : "border border-gray-300 group-hover:border-lily bg-gray-50/50"
                    }`}>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 font-bold" />
                    ) : (
                      <span className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-20 bg-lily transition-opacity" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight tracking-tight drop-shadow-sm">
                    {interest.name}
                  </h3>
                  {interest.category && (
                    <p className={`text-[11px] sm:text-xs font-medium mt-1 uppercase tracking-wider ${isSelected ? "text-white/80" : "text-gray-500"
                      }`}>
                      {interest.category}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating / Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-pink-100 text-pink-600 font-bold text-xs sm:text-sm">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 hidden sm:inline">
              topics selected
            </span>
          </div>

          <div className="flex items-center gap-3">
            {mode === "onboarding" && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-lily hover:bg-lily/90 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-lily/25 transform active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : mode === "onboarding" ? (
                <>
                  <span>Continue to Feed</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsSelector;
