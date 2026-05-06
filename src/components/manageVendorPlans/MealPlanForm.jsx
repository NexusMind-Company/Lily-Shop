import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMealPlan,
  updateSubscriptionPlan,
  fetchMealPlan,
  createMeal,
} from "../../services/api";
import { Plus, X, Save, Loader2 } from "lucide-react";

/**
 * MealPlanForm component for creating/editing meal plans with food combinations
 */
const MealPlanForm = ({
  onSuccess,
  onCancel,
  initialType = "weekly",
  isEdit = false,
  planId = null,
  vendorId = null,
}) => {
  const queryClient = useQueryClient();
  const [planData, setPlanData] = useState({
    name: "",
    description: "",
    price: "",
    type: initialType,
    mealsPerWeek: initialType === "weekly" ? 5 : 20,
    features: [],
    address: "",
    service_days_preset: "mon_fri",
  });

  const [mediaFiles, setMediaFiles] = useState([]);

  const [meals, setMeals] = useState([
    {
      name: "",
      description: "",
      image: "",
      calories: "",
      tags: [],
    },
  ]);

  const [tagInputs, setTagInputs] = useState([""]);

  // ---------------- Load Plan Data for Edit ----------------
  const { data: fetchedPlan, isLoading: isFetchingPlan } = useQuery({
    queryKey: ["mealPlan", planId],
    queryFn: () => fetchMealPlan(planId),
    enabled: !!isEdit && !!planId,
  });

  // Effect to prefill data when fetchedPlan changes (Replaces deprecated onSuccess)
  useEffect(() => {
    if (fetchedPlan && isEdit) {
      setPlanData({
        name: fetchedPlan.plan_name || "",
        description: fetchedPlan.description || "",
        price: fetchedPlan.price ? fetchedPlan.price.toString() : "",
        type: fetchedPlan.frequency || initialType,
        mealsPerWeek: fetchedPlan.meals_per_cycle || 5,
        features: [],
        address: fetchedPlan.address || "",
        service_days_preset:
          fetchedPlan.service_days?.length > 5 ? "mon_sun" : "mon_fri",
      });
    }
  }, [fetchedPlan, isEdit, initialType]);

  const createPlanMutation = useMutation({
    mutationFn: (data) => createMealPlan(data),
    onSuccess: (plan) => {
      // Create meals logic remains same...
      handleMealCreation(plan.id);
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      alert("Failed to create meal plan. Please try again.");
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: (data) => updateSubscriptionPlan(planId, data),
    onSuccess: (plan) => {
      handleMealCreation(plan.id);
    },
    onError: (error) => {
      console.error("Error updating plan:", error);
      alert("Failed to update meal plan. Please try again.");
    },
  });

  const handleMealCreation = (id) => {
    const mealPromises = meals
      .filter((meal) => meal.name.trim())
      .map((meal) =>
        createMeal({
          ...meal,
          vendor: vendorId, // and link it to the plan if needed
          calories: parseInt(meal.calories) || 0,
          tags: meal.tags,
        }),
      );

    Promise.all(mealPromises)
      .then(() => {
        // Invalidate plans to ensure refresh when navigating back
        queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
        queryClient.invalidateQueries({ queryKey: ["vendorStats"] });
        onSuccess && onSuccess({ id, name: planData.name });
      })
      .catch((error) => {
        console.error("Error creating meals:", error);
        alert("Plan saved but some meals failed to save.");
      });
  };

  const handlePlanChange = (field, value) => {
    setPlanData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };

  const _addMeal = () => {
    setMeals([
      ...meals,
      {
        name: "",
        description: "",
        image: "",
        calories: "",
        tags: [],
      },
    ]);
    setTagInputs([...tagInputs, ""]);
  };

  const _removeMeal = (index) => {
    if (meals.length > 1) {
      const updatedMeals = meals.filter((_, i) => i !== index);
      setMeals(updatedMeals);
      const updatedTagInputs = tagInputs.filter((_, i) => i !== index);
      setTagInputs(updatedTagInputs);
    }
  };

  const _handleTagChange = (mealIndex, tagString) => {
    const tags = tagString
      .split(",")
      .map((tag) => {
        const trimmed = tag.trim();
        // Simple tag parsing: assume format "label:type" or just "label"
        const [label, type = "general"] = trimmed.split(":");
        return { label: label.trim(), type: type.trim() };
      })
      .filter((tag) => tag.label);

    handleMealChange(mealIndex, "tags", tags);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!planData.name.trim()) {
      alert("Please enter a plan name");
      return;
    }
    if (!planData.description.trim()) {
      alert("Please enter a plan description");
      return;
    }
    if (!planData.price || isNaN(planData.price)) {
      alert("Please enter a valid price");
      return;
    }

    /*
    const validMeals = meals.filter((meal) => meal.name.trim());
    if (validMeals.length === 0) {
      alert("Please add at least one meal");
      return;
    }
    */

    const submissionData = {
      plan_name: planData.name,
      description: planData.description,
      address: planData.address,
      price: parseFloat(planData.price), // Send raw price value
      meals_per_cycle: parseInt(planData.mealsPerWeek),
      frequency: planData.type,
      service_days:
        planData.service_days_preset === "mon_sun"
          ? [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ]
          : ["monday", "tuesday", "wednesday", "thursday", "friday"],
      media: mediaFiles,
    };

    if (isEdit) {
      updatePlanMutation.mutate(submissionData);
    } else {
      createPlanMutation.mutate(submissionData);
    }
  };

  if (isFetchingPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-lily mb-2" />
        <p className="text-gray-500">Loading plan details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-text-main">
        {isEdit ? "Edit Meal Plan" : "Create Meal Plan"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-main">Plan Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={planData.name}
                onChange={(e) => handlePlanChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                placeholder="e.g., Weekly Standard Plan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                value={planData.price}
                onChange={(e) => handlePlanChange("price", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                placeholder="15000"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Service Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handlePlanChange("service_days_preset", "mon_fri")
                }
                className={`px-3 py-2 rounded-md border text-sm font-semibold ${
                  planData.service_days_preset === "mon_fri"
                    ? "bg-lily text-white border-lily"
                    : "bg-white text-black border-gray-300"
                }`}
              >
                Mon – Fri
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePlanChange("service_days_preset", "mon_sun")
                }
                className={`px-3 py-2 rounded-md border text-sm font-semibold ${
                  planData.service_days_preset === "mon_sun"
                    ? "bg-lily text-white border-lily"
                    : "bg-white text-black border-gray-300"
                }`}
              >
                Mon – Sun
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set pricing based on the days you’ll deliver.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Restaurant/Pickup Address *
            </label>
            <textarea
              value={planData.address}
              onChange={(e) => handlePlanChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
              rows="2"
              placeholder="Full address where customers can pick up or search for you..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Description *
            </label>
            <textarea
              value={planData.description}
              onChange={(e) => handlePlanChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
              rows="3"
              placeholder="Describe your meal plan..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Package Photos & Videos
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files) {
                  setMediaFiles(Array.from(e.target.files));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main
                         file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-lily file:text-white hover:file:bg-darklily transition-colors cursor-pointer"
            />
            {mediaFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {mediaFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Type
              </label>
              <select
                value={planData.type}
                onChange={(e) => handlePlanChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Meals per {planData.type === "weekly" ? "Week" : "Month"}
              </label>
              <input
                type="number"
                value={planData.mealsPerWeek}
                onChange={(e) =>
                  handlePlanChange("mealsPerWeek", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                min="1"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Meals Section
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-main">
              Food Combinations (Meals)
            </h3>
            <button
              type="button"
              onClick={_addMeal}
              className="flex items-center gap-2 px-3 py-1 bg-[#13ec49] text-green-950 rounded-md hover:bg-[#0ea33b] transition-colors"
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>

          {meals.map((meal, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-main">Meal {index + 1}</h4>
                {meals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => _removeMeal(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) =>
                      handleMealChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                    placeholder="e.g., Grilled Chicken & Quinoa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={meal.calories}
                    onChange={(e) =>
                      handleMealChange(index, "calories", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                    placeholder="450"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Description
                </label>
                <textarea
                  value={meal.description}
                  onChange={(e) =>
                    handleMealChange(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                  rows="2"
                  placeholder="Describe the meal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={meal.image}
                  onChange={(e) =>
                    handleMealChange(index, "image", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                  placeholder="https://example.com/meal-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Tags (comma separated, format: label:type)
                </label>
                <input
                  type="text"
                  value={tagInputs[index] || ""}
                  onChange={(e) => {
                    const newTagInputs = [...tagInputs];
                    newTagInputs[index] = e.target.value;
                    setTagInputs(newTagInputs);
                    _handleTagChange(index, e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-text-main"
                  placeholder="High Protein:protein, 450 kcal:calories"
                />
              </div>
            </div>
          ))}
        </div>
        */}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-text-main rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              createPlanMutation.isPending || updatePlanMutation.isPending
            }
            className="flex-1 px-4 py-2 bg-lily text-white rounded-md hover:bg-darklily disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {createPlanMutation.isPending || updatePlanMutation.isPending
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Plan"
                : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

MealPlanForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  initialType: PropTypes.string,
  isEdit: PropTypes.bool,
  planId: PropTypes.string,
  vendorId: PropTypes.string,
};

export default MealPlanForm;
