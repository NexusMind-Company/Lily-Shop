import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Check, X, Clock, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { api, createSubscriptionCustomization } from "../services/api";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MealCard = ({ meal, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(meal.id)}
    className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer select-none ${
      isSelected
        ? "border-lily bg-[#f0fbf2]"
        : "border-gray-100 hover:border-gray-200"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
        {meal.image_url ? (
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🍛
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold truncate ${isSelected ? "text-[#111813]" : "text-gray-700"}`}
        >
          {meal.name}
        </p>
        {meal.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {meal.description}
          </p>
        )}
      </div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isSelected ? "bg-lily" : "bg-gray-100"
        }`}
      >
        {isSelected ? (
          <Check size={15} className="text-white" />
        ) : (
          <span className="text-gray-400 font-bold">+</span>
        )}
      </div>
    </div>
  </div>
);

const MealSelectionPage = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const location = useLocation();

  const plan = location.state?.plan ?? {};
  const vendorId =
    location.state?.vendor?.id || location.state?.vendorId || plan?.vendor;
  const preferredTime = location.state?.preferredTime || "12:00";

  const rawDays =
    location.state?.selectedDays ||
    location.state?.subscription?.preferred_delivery_days ||
    [];
  const validDays =
    Array.isArray(rawDays) && rawDays.length > 0
      ? rawDays.map((d) => d.toLowerCase())
      : DAYS_OF_WEEK.slice(0, 5); // Default Mon-Fri

  const [activeDay, setActiveDay] = useState(validDays[0]);
  const [search, setSearch] = useState("");

  // State structure: { [day]: { mealIds: Set(), notes: "", time: "12:00" } }
  const [dayConfigs, setDayConfigs] = useState(() => {
    const initial = {};
    validDays.forEach((day) => {
      initial[day] = { mealIds: new Set(), notes: "", time: preferredTime };
    });
    return initial;
  });

  const {
    data: mealsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vendorMeals", vendorId],
    queryFn: async () => {
      const res = await api.get(`/foods/meals/vendors/${vendorId}/`);
      return res.data;
    },
    enabled: !!vendorId,
  });

  const meals = Array.isArray(mealsData)
    ? mealsData
    : (mealsData?.results ?? []);
  const filtered = meals.filter((m) =>
    search ? m.name?.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const toggleMeal = (mealId) => {
    const id = String(mealId);
    setDayConfigs((prev) => {
      const dayData = prev[activeDay];
      const nextMeals = new Set(dayData.mealIds);
      if (nextMeals.has(id)) nextMeals.delete(id);
      else nextMeals.add(id);
      return { ...prev, [activeDay]: { ...dayData, mealIds: nextMeals } };
    });
  };

  const updateDayNote = (note) => {
    setDayConfigs((prev) => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], notes: note },
    }));
  };

  const updateDayTime = (time) => {
    setDayConfigs((prev) => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], time: time },
    }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveCustomizations = async () => {
    setIsSaving(true);
    try {
      const requests = validDays
        .map((day) => {
          const config = dayConfigs[day];
          if (config.mealIds.size === 0 && !config.notes) return null; // Skip empty days

          return createSubscriptionCustomization(subscriptionId, {
            day_of_week: day,
            selected_meal_ids: Array.from(config.mealIds),
            delivery_time: config.time || null,
            notes: config.notes || "",
          });
        })
        .filter(Boolean);

      if (requests.length > 0) {
        await Promise.all(requests);
      }

      toast.success("Meal schedule saved successfully!");
      navigate("/subscriptions", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.detail ||
          "Failed to save meal schedule. You can set it later from your dashboard.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md px-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse"
            >
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
        <p className="text-sm font-bold text-[#111813] mb-2">
          Couldn't load meals
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {error?.message || "Missing vendor information"}
        </p>
        <button
          onClick={() => navigate("/subscriptions")}
          className="text-lily text-sm font-bold px-6 py-2 bg-white rounded-full shadow-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const activeConfig = dayConfigs[activeDay];

  return (
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button
            onClick={() => navigate("/subscriptions")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#111813]" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#111813]">
              Schedule Your Meals
            </h1>
            <p className="text-xs text-gray-400">
              Pick what you want for each day
            </p>
          </div>
          <button
            onClick={() => navigate("/subscriptions")}
            className="text-lily text-xs font-bold px-3 py-1.5 bg-lily/10 rounded-full"
          >
            Skip for now
          </button>
        </div>

        {/* Day Tabs */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar flex gap-2">
          {validDays.map((day) => {
            const hasMeals = dayConfigs[day].mealIds.size > 0;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeDay === day
                    ? "bg-[#111813] text-white"
                    : hasMeals
                      ? "bg-lily/10 text-lily border border-lily/20"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
                {hasMeals && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${activeDay === day ? "bg-lily" : "bg-lily"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#f6f8f6] rounded-xl px-3 py-2.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meals..."
              className="flex-1 bg-transparent text-sm text-[#111813] placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 pt-4 pb-36 space-y-4">
        {/* Day specific settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Delivery Time
            </p>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
              <Clock size={14} className="text-lily" />
              <input
                type="time"
                value={activeConfig.time}
                onChange={(e) => updateDayTime(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold w-full text-gray-700"
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Day Notes (Opt)
            </p>
            <input
              type="text"
              placeholder="e.g. Extra spicy"
              value={activeConfig.notes}
              onChange={(e) => updateDayNote(e.target.value)}
              className="bg-gray-50 px-3 py-2 rounded-xl border-none outline-none text-sm w-full placeholder-gray-400 text-gray-700"
            />
          </div>
        </div>

        {/* Meal list */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-[#111813]">Select Meals</h3>
            <span className="text-xs font-bold text-lily bg-lily/10 px-2 py-0.5 rounded-md">
              {activeConfig.mealIds.size} Selected
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">
                {search ? `No meals match "${search}"` : "No meals available"}
              </p>
            </div>
          ) : (
            filtered.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isSelected={activeConfig.mealIds.has(String(meal.id))}
                onToggle={toggleMeal}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={saveCustomizations}
          disabled={isSaving}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all ${
            isSaving
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "text-white shadow-lg shadow-lily bg-lily/25 hover:bg-darklily"
          }`}
        >
          {isSaving ? "Saving Schedule..." : "Save My Schedule"}
        </button>
      </div>
    </div>
  );
};

export default MealSelectionPage;
