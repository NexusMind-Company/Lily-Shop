import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import {
  updateMealPlan,
  fetchMealPlanDetails,
} from "../services/subscriptionApi";
import { CheckCircle, Edit2, Save, X } from "lucide-react";
import PropTypes from "prop-types";

/**
 * PlanDetailsPage component for viewing and editing a subscription plan.
 * @param {Object} props - Component props
 * @param {boolean} props.isEdit - Whether the page is in edit mode
 */
const PlanDetailsPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const location = useLocation();
  const isEdit = location.state?.mode === "edit";

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(isEdit);
  const [formData, setFormData] = useState({
    plan_name: "",
    price: "",
    trial_days: 0,
    description: "",
    meals_per_cycle: 0,
    media: null,
  });
  const [errors, setErrors] = useState({});

  // Get vendorId from location state or use a default
  const vendorId = location.state?.vendorId || null;

  // ---------------- Load Plan Data ----------------
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMealPlanDetails(planId);
        setPlan(data);
        setFormData({
          plan_name: data.plan_name || "",
          price: data.price ? data.price.toString() : "",
          trial_days: data.trial_days || 0,
          description: data.description || "",
          meals_per_cycle: data.meals_per_cycle || 0,
          media: data.all_media_urls || null,
        });
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  // ---------------- Form Handlers ----------------
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          setErrors({
            ...errors,
            media: "Only image files (JPEG, PNG, GIF, WEBP) are allowed",
          });
          return;
        }
        setFormData({ ...formData, media: file });
        setErrors({ ...errors, media: null });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? Number(value) : value,
      });
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = "Plan name is required";
    }
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plan_name: formData.plan_name,
        price: parseFloat(formData.price), // Send raw price
        trial_days: formData.trial_days,
        description: formData.description,
        meals_per_cycle: formData.meals_per_cycle,
      };

      if (formData.media instanceof File) {
        payload.media = formData.media;
      }

      const updatedPlan = await updateMealPlan(planId, payload);
      setPlan(updatedPlan);
      setEditMode(false);
      navigate("/vendor/plans", {
        state: {
          message: `Plan "${updatedPlan.plan_name}" updated successfully!`,
        },
      });
    } catch (err) {
      console.error("Failed to update plan:", err);
      setErrors({
        ...errors,
        submit: err.message || "Failed to update plan. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (editMode && plan) {
      // Reset form data to original plan data
      setFormData({
        plan_name: plan.plan_name || "",
        price: plan.price ? plan.price.toString() : "",
        trial_days: plan.trial_days || 0,
        description: plan.description || "",
        meals_per_cycle: plan.meals_per_cycle || 0,
        media: plan.all_media_urls || null,
      });
    }
    setEditMode(false);
  };

  const handleBackClick = () => {
    navigate("/vendor/plans");
  };

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-white font-display text-black transition-colors duration-200">
        <TopAppBar title="Plan Details" onBackClick={handleBackClick} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-black">Loading plan details...</div>
        </div>
      </div>
    );
  }

  // ---------------- Render Form ----------------
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white font-display text-black transition-colors duration-200">
      <TopAppBar
        title={editMode ? "Edit Plan" : "Plan Details"}
        onBackClick={editMode ? handleCancel : handleBackClick}
        action={
          !editMode ? { icon: Edit2, onClick: () => setEditMode(true) } : null
        }
      />

      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-5xl mx-auto w-full">
        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Plan Image */}
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
          {formData.media instanceof File ? (
            <img
              src={URL.createObjectURL(formData.media)}
              alt={formData.plan_name}
              className="w-full h-full object-cover"
            />
          ) : formData.media && formData.media.length > 0 ? (
            <img
              src={formData.media[0]}
              alt={formData.plan_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Upload Image (Edit Mode Only) */}
        {editMode && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Plan Image</label>
            <input
              type="file"
              name="media"
              accept="image/*"
              onChange={handleInputChange}
              className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lily/10 file:text-black hover:file:bg-lily"
            />
            {errors.media && (
              <span className="text-sm text-red-500">{errors.media}</span>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Plan Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Plan Name *
            </label>
            {editMode ? (
              <input
                type="text"
                name="plan_name"
                value={formData.plan_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-lily  focus:border-transparent"
                placeholder="Enter plan name"
              />
            ) : (
              <p className="text-lg font-bold text-black">
                {formData.plan_name || "—"}
              </p>
            )}
            {errors.plan_name && (
              <span className="text-sm text-red-500">{errors.plan_name}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Price (₦) *
            </label>
            {editMode ? (
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-lily focus:border-transparent"
                placeholder="Enter price"
              />
            ) : (
              <p className="text-lg font-bold text-lily">
                {formData.price ? `₦${formData.price}` : "—"}
              </p>
            )}
            {errors.price && (
              <span className="text-sm text-red-500">{errors.price}</span>
            )}
          </div>

          {/* Trial Days */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Trial Days</label>
            {editMode ? (
              <input
                type="number"
                name="trial_days"
                value={formData.trial_days}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-lily focus:border-transparent"
                placeholder="0"
              />
            ) : (
              <p className="text-lg font-medium text-black">
                {formData.trial_days || 0} days
              </p>
            )}
          </div>

          {/* Meals Per Cycle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Meals Per Cycle
            </label>
            {editMode ? (
              <input
                type="number"
                name="meals_per_cycle"
                value={formData.meals_per_cycle}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-lily focus:border-transparent"
                placeholder="0"
              />
            ) : (
              <p className="text-lg font-medium text-black">
                {formData.meals_per_cycle || 0} meals
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Description
            </label>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-lily focus:border-transparent resize-none"
                placeholder="Enter description"
              />
            ) : (
              <p className="text-black">
                {formData.description || "No description provided"}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit Mode) */}
        {editMode && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-black hover:bg-gray-50 transition-colors font-medium"
            >
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lily text-black hover:bg-[#0fd641] transition-colors font-bold"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {/* View Plan Features (Non-Edit Mode) */}
        {!editMode && plan && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-black">Plan Features</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-black">
                <CheckCircle className="text-lily" size={16} />
                <span>Visible in marketplace</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black">
                <CheckCircle className="text-lily" size={16} />
                <span>Auto-renewal enabled</span>
              </div>
              {plan.trial_days > 0 && (
                <div className="flex items-center gap-2 text-sm text-black">
                  <CheckCircle className="text-lily" size={16} />
                  <span>{plan.trial_days} days free trial</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PlanDetailsPage.propTypes = {
  isEdit: PropTypes.bool,
};

export default PlanDetailsPage;
