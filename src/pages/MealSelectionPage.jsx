import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Check, Plus, Minus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { updateSubscriptionMeals } from "../services/api";

// ── Meal Card ───────────────────────────────────────────────────
const MealCard = ({ meal, quantity, onAdd, onRemove }) => {
  const isSelected = quantity > 0;

  return (
    <div className={`bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border-2 transition-all ${isSelected ? "border-[#4eb75e]" : "border-gray-100 dark:border-gray-800"}`}>
      <div className="flex items-center gap-3">
        {/* Meal image */}
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
          {meal.image_url ? (
            <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍛</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#111813] dark:text-white truncate">{meal.name}</p>
          {meal.description && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{meal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {meal.size_category && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                {meal.size_category}
              </span>
            )}
            <span className="text-xs font-bold text-[#4eb75e]">
              ₦{parseFloat(meal.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isSelected ? (
            <>
              <button onClick={() => onRemove(meal.id)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#111813] dark:text-white hover:bg-gray-200 transition-colors">
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold text-[#111813] dark:text-white w-5 text-center">{quantity}</span>
              <button onClick={() => onAdd(meal.id)}
                className="w-8 h-8 rounded-full bg-[#4eb75e] flex items-center justify-center text-white hover:bg-[#3da64d] transition-colors">
                <Plus size={14} />
              </button>
            </>
          ) : (
            <button onClick={() => onAdd(meal.id)}
              className="w-8 h-8 rounded-full bg-[#4eb75e] flex items-center justify-center text-white hover:bg-[#3da64d] transition-colors">
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const MealSelectionPage = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const location = useLocation();

  // Plan info passed via router state from previous page
  const plan = location.state?.plan ?? {};
  const vendorId = location.state?.vendorId;
  const mealsPerCycle = plan.meal_per_cycle ?? plan.meals_per_cycle ?? 5;

  const [quantities, setQuantities] = useState({}); // { mealId: count }
  const [search, setSearch] = useState("");

  // Fetch vendor's menu
  const { data: mealsData, isLoading, isError, error } = useQuery({
    queryKey: ["vendorMeals", vendorId],
    queryFn: async () => {
      const response = await api.get(`/foods/meals/vendors/${vendorId}/`);
      return response.data;
    },
    enabled: !!vendorId,
  });

  const meals = Array.isArray(mealsData) ? mealsData : mealsData?.results ?? [];

  const filteredMeals = meals.filter((m) =>
    search ? m.name?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);
  const remaining = mealsPerCycle - totalSelected;

  const handleAdd = (mealId) => {
    if (totalSelected >= mealsPerCycle) {
      toast.error(`You can only select ${mealsPerCycle} meals for this plan`);
      return;
    }
    setQuantities((prev) => ({ ...prev, [mealId]: (prev[mealId] ?? 0) + 1 }));
  };

  const handleRemove = (mealId) => {
    setQuantities((prev) => {
      const next = { ...prev, [mealId]: (prev[mealId] ?? 1) - 1 };
      if (next[mealId] <= 0) delete next[mealId];
      return next;
    });
  };

  // Calculate total price
  const totalPrice = Object.entries(quantities).reduce((sum, [mealId, qty]) => {
    const meal = meals.find((m) => String(m.id) === String(mealId));
    return sum + parseFloat(meal?.price ?? 0) * qty;
  }, 0);

  const { mutate: confirmSelection, isPending } = useMutation({
    mutationFn: () => updateSubscriptionMeals(subscriptionId, Object.entries(quantities).map(([meal_id, quantity]) => ({ meal_id, quantity }))),
    onSuccess: () => {
      toast.success("Meal selection saved!");
      navigate("/subscriptions");
    },
    onError: (err) => {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Failed to save selections.";
      toast.error(msg);
    },
  });

  const handleConfirm = () => {
    if (totalSelected < mealsPerCycle) {
      toast.error(`Please select ${remaining} more meal${remaining !== 1 ? "s" : ""}`);
      return;
    }
    confirmSelection();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-5xl mx-auto px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
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
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-[#111813]" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#111813]">Choose Your Meals</h1>
            <p className="text-xs text-gray-400">{plan.plan_name ?? "Meal Plan"}</p>
          </div>
          {/* Progress pill */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${totalSelected >= mealsPerCycle ? "bg-[#4eb75e] text-white" : "bg-gray-100 text-gray-600"}`}>
            {totalSelected}/{mealsPerCycle}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4eb75e] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalSelected / mealsPerCycle) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {totalSelected >= mealsPerCycle
              ? "✓ All meals selected — you're good to go!"
              : `Select ${remaining} more meal${remaining !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search */}
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

      {/* Meal List */}
      <div className="flex-1 px-4 pt-4 pb-36 space-y-3">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">{search ? `No meals match "${search}"` : "No meals available"}</p>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              quantity={quantities[meal.id] ?? 0}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>

      {/* Bottom Summary + Confirm */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 px-4 sm:px-8 lg:px-16 py-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">Estimated Total</p>
            <p className="text-lg font-bold text-[#111813] dark:text-white">
              ₦{totalPrice.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-[#4eb75e]" />
            <span className="text-sm font-bold text-[#4eb75e]">
              {totalSelected} item{totalSelected !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          disabled={totalSelected < mealsPerCycle || isPending}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
            totalSelected >= mealsPerCycle
              ? "bg-[#4eb75e] text-white hover:bg-[#3da64d]"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isPending ? "Saving..." : (
            <>
              <Check size={16} />
              Confirm Selections
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MealSelectionPage;
