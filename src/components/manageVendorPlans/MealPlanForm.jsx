import { useState } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import { createMealPlan, createMeal } from "../../services/subscriptionApi";
import { Plus, X, Save } from "lucide-react";

/**
 * MealPlanForm component for creating/editing meal plans with food combinations
 */
const MealPlanForm = ({
  onSuccess,
  onCancel,
  initialType = "weekly",
  isEdit = false,
}) => {
  const vendorId = "test-vendor";

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

  const createPlanMutation = useMutation({
    mutationFn: (data) => createMealPlan(vendorId, data),
    onSuccess: (plan) => {
      // Create meals after plan is created
      const mealPromises = meals
        .filter((meal) => meal.name.trim())
        .map((meal) =>
          createMeal(vendorId, {
            ...meal,
            calories: parseInt(meal.calories) || 0,
            tags: meal.tags,
          }),
        );

      Promise.all(mealPromises)
        .then(() => {
          onSuccess && onSuccess(plan);
        })
        .catch((error) => {
          console.error("Error creating meals:", error);
          alert("Plan created but some meals failed to save.");
        });
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      alert("Failed to create meal plan. Please try again.");
    },
  });

  const handlePlanChange = (field, value) => {
    setPlanData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };

  const addMeal = () => {
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

  const removeMeal = (index) => {
    if (meals.length > 1) {
      const updatedMeals = meals.filter((_, i) => i !== index);
      setMeals(updatedMeals);
      const updatedTagInputs = tagInputs.filter((_, i) => i !== index);
      setTagInputs(updatedTagInputs);
    }
  };

  const handleTagChange = (mealIndex, tagString) => {
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
    if (!planData.address.trim()) {
      alert("Please enter a restaurant/pickup address");
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

    const validMeals = meals.filter((meal) => meal.name.trim());
    if (validMeals.length === 0) {
      alert("Please add at least one meal");
      return;
    }

    createPlanMutation.mutate({
      ...planData,
      price: parseFloat(planData.price),
      features: planData.features.filter((f) => f.trim()),
      service_days:
        planData.service_days_preset === "mon_sun"
          ? ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
          : ["monday","tuesday","wednesday","thursday","friday"],
      media: mediaFiles,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-surface-dark rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-text-main dark:text-white">
        Create Meal Plan
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-main dark:text-white">
            Plan Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={planData.name}
                onChange={(e) => handlePlanChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                placeholder="e.g., Weekly Standard Plan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                value={planData.price}
                onChange={(e) => handlePlanChange("price", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                placeholder="15000"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
              Service Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlanChange("service_days_preset", "mon_fri")}
                className={`px-3 py-2 rounded-md border text-sm font-semibold ${
                  planData.service_days_preset === "mon_fri"
                    ? "bg-[#13ec49] text-green-950 border-[#13ec49]"
                    : "bg-white dark:bg-surface-dark text-text-main dark:text-white border-gray-300 dark:border-gray-600"
                }`}
              >
                Mon – Fri
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange("service_days_preset", "mon_sun")}
                className={`px-3 py-2 rounded-md border text-sm font-semibold ${
                  planData.service_days_preset === "mon_sun"
                    ? "bg-[#13ec49] text-green-950 border-[#13ec49]"
                    : "bg-white dark:bg-surface-dark text-text-main dark:text-white border-gray-300 dark:border-gray-600"
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
            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
              Restaurant/Pickup Address *
            </label>
            <textarea
              value={planData.address}
              onChange={(e) => handlePlanChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
              rows="2"
              placeholder="Full address where customers can pick up or search for you..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
              Description *
            </label>
            <textarea
              value={planData.description}
              onChange={(e) => handlePlanChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
              rows="3"
              placeholder="Describe your meal plan..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white
                         file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                         file:bg-[#13ec49] file:text-green-950 hover:file:bg-[#0ea33b] transition-colors cursor-pointer"
            />
            {mediaFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {mediaFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                Type
              </label>
              <select
                value={planData.type}
                onChange={(e) => handlePlanChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                Meals per {planData.type === "weekly" ? "Week" : "Month"}
              </label>
              <input
                type="number"
                value={planData.mealsPerWeek}
                onChange={(e) =>
                  handlePlanChange("mealsPerWeek", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                min="1"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-main dark:text-white">
              Food Combinations (Meals)
            </h3>
            <button
              type="button"
              onClick={addMeal}
              className="flex items-center gap-2 px-3 py-1 bg-[#13ec49] text-green-950 rounded-md hover:bg-[#0ea33b] transition-colors"
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>

          {meals.map((meal, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-main dark:text-white">
                  Meal {index + 1}
                </h4>
                {meals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMeal(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) =>
                      handleMealChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                    placeholder="e.g., Grilled Chicken & Quinoa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={meal.calories}
                    onChange={(e) =>
                      handleMealChange(index, "calories", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                    placeholder="450"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  value={meal.description}
                  onChange={(e) =>
                    handleMealChange(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                  rows="2"
                  placeholder="Describe the meal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={meal.image}
                  onChange={(e) =>
                    handleMealChange(index, "image", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                  placeholder="https://example.com/meal-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                  Tags (comma separated, format: label:type)
                </label>
                <input
                  type="text"
                  value={tagInputs[index] || ""}
                  onChange={(e) => {
                    const newTagInputs = [...tagInputs];
                    newTagInputs[index] = e.target.value;
                    setTagInputs(newTagInputs);
                    handleTagChange(index, e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-dark text-text-main dark:text-white"
                  placeholder="High Protein:protein, 450 kcal:calories"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-text-main dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPlanMutation.isPending}
            className="flex-1 px-4 py-2 bg-[#13ec49] text-green-950 rounded-md hover:bg-[#0ea33b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {createPlanMutation.isPending
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
};

export default MealPlanForm;
