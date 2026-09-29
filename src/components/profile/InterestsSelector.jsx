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
  ArrowRight,
  Loader2,
  RefreshCw,
  Plus,
  X,
  ShoppingBag,
  Laptop,
  Utensils,
  Home,
  Activity,
  Smile,
  Music,
} from "lucide-react";

const CATEGORY_ICONS = {
  "Fashion & Apparel": ShoppingBag,
  "Tech & Electronics": Laptop,
  "Beauty & Personal Care": Sparkles,
  "Home & Living": Home,
  "Fitness & Wellness": Activity,
  "Food & Drinks": Utensils,
  "Entertainment & Hobbies": Music,
};

const InterestsSelector = ({ mode = "settings", onComplete, onSkip }) => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // 1. Fetch all available interests in the system
  const {
    data: allInterestsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["interests"],
    queryFn: () => fetchInterests({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch available (unselected) interests for settings mode
  const {
    data: availableInterestsData,
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = useQuery({
    queryKey: ["availableInterests"],
    queryFn: () => fetchAvailableInterests({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
    enabled: mode === "settings",
  });

  // Safe parsing of all interests
  const allInterests = useMemo(() => {
    if (!allInterestsData) return [];
    return Array.isArray(allInterestsData)
      ? allInterestsData
      : allInterestsData.results || [];
  }, [allInterestsData]);

  const availableInterests = useMemo(() => {
    if (!availableInterestsData) return [];
    return Array.isArray(availableInterestsData)
      ? availableInterestsData
      : availableInterestsData.results || [];
  }, [availableInterestsData]);

  // Initialize selected interests:
  // Onboarding starts empty (0 selected) so user picks what they actually love.
  // Settings mode computes the existing selected interests safely.
  useEffect(() => {
    if (allInterests.length > 0 && !hasInitialized) {
      if (mode === "onboarding") {
        setSelectedIds([]);
        setHasInitialized(true);
      } else if (availableInterests.length > 0 && availableInterests.length < allInterests.length) {
        const availableIdsSet = new Set(availableInterests.map((item) => item.id));
        const currentlySelected = allInterests
          .filter((item) => !availableIdsSet.has(item.id))
          .map((item) => item.id);
        setSelectedIds(currentlySelected);
        setHasInitialized(true);
      } else if (availableInterestsData) {
        setHasInitialized(true);
      }
    }
  }, [allInterests, availableInterests, availableInterestsData, hasInitialized, mode]);

  // Group interests by category for continuous calm scroll
  const groupedInterests = useMemo(() => {
    const groups = {};
    const q = searchQuery.trim().toLowerCase();

    allInterests.forEach((item) => {
      const categoryName = item.category || "General Interests";
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      if (matchesSearch) {
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push(item);
      }
    });

    return groups;
  }, [allInterests, searchQuery]);

  // Count total matches across all categories
  const totalMatches = useMemo(() => {
    return Object.values(groupedInterests).reduce((acc, list) => acc + list.length, 0);
  }, [groupedInterests]);

  // Toggle selection state with tactile pill interaction
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Save mutation
  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    mutationFn: async (interests) => {
      const response = await updateUserInterests(interests);
      return response.data || response;
    },
    onSuccess: async () => {
      toast.success(
        mode === "onboarding"
          ? "Preferences saved! Welcome to your feed."
          : "Your content interests have been updated!"
      );
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
      toast.error("Please pick at least 3 interests, or tap 'Skip for now'.");
      return;
    }
    await saveInterests(selectedIds);
    if (onComplete) onComplete(selectedIds);
  };

  const handleSkipAction = () => {
    if (onSkip) onSkip();
    else if (onComplete) onComplete([]);
  };

  const isLoading = isLoadingAll || (mode === "settings" && isLoadingAvailable);
  const minRequired = 3;
  const isTargetMet = selectedIds.length >= minRequired;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 font-poppins">
      {/* Calm, Stress-Free Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lily/10 text-lily font-semibold text-xs mb-2.5 border border-lily/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{mode === "onboarding" ? "Step 3 of 3 • Tailor Your Feed" : "Personal Preferences"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          {mode === "onboarding" ? "What are your passions?" : "Manage Your Interests"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          {mode === "onboarding"
            ? "Pick 3 or more topics to personalize your recommendations, or skip for now."
            : "Select topics you enjoy to personalize your For You recommendations."}
        </p>
      </div>

      {/* Lightweight Search Input */}
      <div className="relative w-full mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search topics (e.g. Street Food, Tech, Skincare)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-lily rounded-xl outline-none transition-all focus:ring-2 focus:ring-lily/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[220px] gap-2.5 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-lily" />
          <p className="text-xs sm:text-sm font-medium">Loading topics for you...</p>
        </div>
      ) : isErrorAll ? (
        <div className="flex flex-col items-center justify-center min-h-[180px] bg-red-50/50 rounded-2xl p-6 text-center border border-red-100">
          <p className="text-red-600 font-semibold text-sm mb-2">Couldn't load interests right now.</p>
          <button
            onClick={() => {
              refetchAll();
              if (mode === "settings") refetchAvailable();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-red-200 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : totalMatches === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 text-xs sm:text-sm font-medium">No topics found matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-lily font-bold text-xs hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Continuous Scroll with Calm Section Headings & Interactive Pill Chips */
        <div className="space-y-6 pb-28">
          {Object.entries(groupedInterests).map(([categoryName, items]) => {
            const CategoryIcon = CATEGORY_ICONS[categoryName] || Sparkles;
            return (
              <div key={categoryName} className="space-y-3">
                {/* Calm Category Heading */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">
                  <CategoryIcon className="w-3.5 h-3.5 text-lily" />
                  <span>{categoryName}</span>
                  <span className="text-[10px] text-gray-400 font-medium normal-case">
                    ({items.length})
                  </span>
                </div>

                {/* Tactile Interactive Pill Chips */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {items.map((interest) => {
                    const isSelected = selectedIds.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => handleToggle(interest.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all select-none duration-150 transform active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-lily/10 text-lily border border-lily ring-1 ring-lily/25 font-semibold shadow-xs"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-lily shrink-0 stroke-[2.5]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>{interest.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Calm Selection Counter */}
          <div className="flex items-center gap-2">
            {isTargetMet ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{selectedIds.length} selected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                <span>{selectedIds.length} of {minRequired} selected</span>
              </span>
            )}
            <span className="text-xs text-gray-400 hidden sm:inline">
              {isTargetMet ? "Ready to personalize!" : "Pick at least 3 topics"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {mode === "onboarding" && (
              <button
                type="button"
                onClick={handleSkipAction}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isLoading || (mode === "onboarding" && !isTargetMet)}
              className="flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 bg-lily hover:bg-darklily text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-lily/20 transform active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : mode === "onboarding" ? (
                <>
                  <span>Continue to Feed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
