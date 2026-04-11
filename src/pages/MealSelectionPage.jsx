import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";

const MealCard = ({ meal, included, onToggle }) => (
  <div
    onClick={() => onToggle(meal.id)}
    className={`bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer select-none ${
      included
        ? "border-[#4eb75e]"
        : "border-red-200 dark:border-red-800 opacity-60"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 relative">
        {meal.image_url ? (
          <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍛</div>
        )}
        {!included && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <X size={20} className="text-red-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${included ? "text-[#111813] dark:text-white" : "text-gray-400 line-through"}`}>
          {meal.name}
        </p>
        {meal.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{meal.description}</p>
        )}
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
        included ? "bg-[#4eb75e]" : "bg-red-100 dark:bg-red-900/40"
      }`}>
        {included
          ? <Check size={15} className="text-white" />
          : <X size={15} className="text-red-500" />
        }
      </div>
    </div>
  </div>
);

const MealSelectionPage = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const location = useLocation();

  const plan = location.state?.plan ?? {};
  const vendorId = location.state?.vendorId;
  const initialExcluded = location.state?.excluded_meals ?? [];

  const [search, setSearch] = useState("");
  const [excluded, setExcluded] = useState(new Set(initialExcluded.map(String)));

  const { data: mealsData, isLoading, isError, error } = useQuery({
    queryKey: ["vendorMeals", vendorId],
    queryFn: async () => {
      const res = await api.get(`/foods/meals/vendors/${vendorId}/`);
      return res.data;
    },
    enabled: !!vendorId,
  });

  const meals = Array.isArray(mealsData) ? mealsData : mealsData?.results ?? [];
  const filtered = meals.filter((m) =>
    search ? m.name?.toLowerCase().includes(search.toLowerCase()) : true
  );
  const includedCount = meals.length - excluded.size;

  const toggleMeal = (mealId) => {
    const id = String(mealId);
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      api.put(`/foods/subscriptions/${subscriptionId}/meals/`, {
        excluded_meals: Array.from(excluded),
      }),
    onSuccess: () => {
      toast.success("Meal preferences saved!");
      navigate(-1);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to save preferences."
      );
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !vendorId) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-bold text-[#111813] mb-2">Couldn't load meals</p>
        <p className="text-xs text-gray-400 mb-4">{error?.message || "Missing vendor information"}</p>
        <button onClick={() => navigate(-1)} className="text-[#4eb75e] text-sm font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-[#111813]" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#111813]">Customise Your Meals</h1>
            <p className="text-xs text-gray-400">{plan.plan_name ?? "Meal Plan"} — tap to remove or add back</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${excluded.size === 0 ? "bg-[#4eb75e] text-white" : "bg-orange-100 text-orange-600"}`}>
            {includedCount}/{meals.length}
          </div>
        </div>

        <div className="mx-4 mb-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
          <p className="text-[11px] text-blue-700 dark:text-blue-300">
            Tap any meal to <strong>remove</strong> it from your delivery. Tap again to add it back.
          </p>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#f6f8f6] rounded-xl px-3 py-2.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meals..."
              className="flex-1 bg-transparent text-sm text-[#111813] placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Meal list */}
      <div className="flex-1 px-4 pt-4 pb-36 space-y-3">
        {excluded.size > 0 && (
          <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl px-4 py-2.5">
            <p className="text-xs text-orange-700 dark:text-orange-400">
              {excluded.size} meal{excluded.size !== 1 ? "s" : ""} removed from delivery
            </p>
            <button onClick={() => setExcluded(new Set())} className="text-xs text-[#4eb75e] font-semibold">
              Reset all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">{search ? `No meals match "${search}"` : "No meals available"}</p>
          </div>
        ) : (
          filtered.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              included={!excluded.has(String(meal.id))}
              onToggle={toggleMeal}
            />
          ))
        )}
      </div>

      {/* Bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {excluded.size === 0 ? "All meals included ✓" : `${excluded.size} meal${excluded.size !== 1 ? "s" : ""} excluded`}
          </p>
          <p className="text-xs font-bold text-[#4eb75e]">{includedCount} meals kept</p>
        </div>
        <button
          onClick={() => {
            if (includedCount === 0) { toast.error("Keep at least one meal."); return; }
            save();
          }}
          disabled={isPending || includedCount === 0}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
            includedCount > 0
              ? "bg-[#4eb75e] text-white hover:bg-[#3da64d]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isPending ? "Saving..." : <><Check size={16} /> Save Preferences</>}
        </button>
      </div>
    </div>
  );
};

export default MealSelectionPage;
