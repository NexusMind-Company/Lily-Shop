import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createMealPlan, fetchMealPlanDetails, updateMealPlan } from "../services/subscriptionApi";

const CreateMealPlanPage = ({ isEdit = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("id");

  const [form, setForm] = useState({
    plan_name: "",
    description: "",
    price: "",
    meal_per_cycle: 1,
    trial_days: 0,
    collection_code: "",
    media: null,
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- Load existing plan (edit mode) ----------------
  useEffect(() => {
    if (isEdit && planId) {
      fetchMealPlanDetails(planId).then((data) => {
        setForm((f) => ({
          ...f,
          plan_name: data.plan_name || "",
          description: data.description || "",
          price: data.price || "",
          meal_per_cycle: data.meal_per_cycle || 1,
          trial_days: data.trial_days || 0,
          collection_code: data.collection_code || "",
        }));
        // Set preview for existing media
        if (data.media) {
          setMediaPreview(data.media);
        }
      });
    }
  }, [isEdit, planId]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // ---------------- File Upload ----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow image files (as per backend requirement)
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      setError("File type not supported. Only images (jpg, png, gif, webp) are allowed.");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target.result);
      setMediaFile(file);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- Validation ----------------
  const validate = () => {
    if (!form.plan_name.trim()) return "Plan name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Price must be greater than 0";
    if (!form.meal_per_cycle || Number(form.meal_per_cycle) <= 0)
      return "Meals per cycle must be greater than 0";
    return null;
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        plan_name: form.plan_name.trim(),
        price: form.price.toString(),
        trial_days: form.trial_days || 0,
        description: form.description || "",
        meal_per_cycle: form.meal_per_cycle.toString(),
        collection_code: form.collection_code || "",
        media: mediaFile, // Send file directly - backend will handle upload
      };

      if (isEdit) {
        await updateMealPlan(planId, payload);
      } else {
        await createMealPlan(payload);
      }

      console.log("✅ Meal plan saved successfully");
      navigate("/vendor/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.plan_name?.[0] ||
        err.response?.data?.price?.[0] ||
        "Failed to save meal plan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Meal Plan" : "Create Meal Plan"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Design a subscription plan customers will love and pay for.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Basic Info */}
          <section className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
                Basic Info
              </h2>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Plan Name *
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="e.g. Weekly Family Box"
                value={form.plan_name}
                onChange={(e) => update("plan_name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm resize-none outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="What meals are included, who it's for..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Collection Code (Optional)</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="e.g. LILY2024"
                value={form.collection_code}
                onChange={(e) => update("collection_code", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Customers can use this code to identify your meal plan when subscribing</p>
            </div>
          </section>

          {/* Pricing & Media */}
          <section className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
                Pricing
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price *</label>
                <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-white transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                  <span className="px-4 text-gray-500 text-sm">₦</span>
                  <input
                    type="text"
                    className="flex-1 rounded-r-xl px-2 py-2.5 text-sm outline-none"
                    placeholder="15000"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Meals per Cycle *</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  value={form.meal_per_cycle}
                  onChange={(e) => update("meal_per_cycle", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Free Trial (days)</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                value={form.trial_days}
                onChange={(e) => update("trial_days", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Upload Cover Media (image/video)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                onChange={handleFileChange}
              />
              {mediaPreview && (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="mt-3 h-40 w-auto rounded-xl object-cover border"
                />
              )}
              {mediaFile && mediaFile.type.startsWith("video/") && (
                <div className="mt-3 h-40 w-auto rounded-xl bg-gray-100 border flex items-center justify-center">
                  <span className="text-gray-500">Video: {mediaFile.name}</span>
                </div>
              )}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-medium text-white shadow hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMealPlanPage;
