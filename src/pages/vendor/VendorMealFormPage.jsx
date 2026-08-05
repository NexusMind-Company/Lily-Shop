import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, ChevronDown, ChevronUp, FileVideo, X } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { addMeal, updateMeal, fetchVendorMenu } from "../../services/vendorDashboardApi";

const VendorMealFormPage = () => {
  const navigate = useNavigate();
  const { mealId } = useParams();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [_, setMediaPreviews] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    size_category: "medium",
    description: "",
    image: null,
    video_url: "",
    media: [],
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    ingredients: "",
    allergens: "",
    dietary_tags: "",
    serving_size: "",
  });

  const [serverPreviews, setServerPreviews] = useState([]);
  const [localPreviews, setLocalPreviews] = useState([]);

  // If we are editing, fetch the menu and find the meal
  const { data: menu, isLoading } = useQuery({
    queryKey: ["vendorMenu"],
    queryFn: fetchVendorMenu,
    enabled: !!mealId,
  });

  useEffect(() => {
    if (mealId && menu) {
      const menuData = Array.isArray(menu) ? menu : (menu?.results ?? []);
      const meal = menuData.find((m) => m.id === parseInt(mealId) || m.id === mealId);
      if (meal) {
        setForm({
          name: meal.name ?? "",
          price: meal.price ?? "",
          size_category: meal.size_category ?? "medium",
          description: meal.description ?? "",
          image: null, // Keep null to not re-upload if untouched
          video_url: meal.video_url ?? "",
          media: [],
          calories: meal.calories ?? "",
          protein: meal.protein ?? "",
          carbs: meal.carbs ?? "",
          fat: meal.fat ?? "",
          ingredients: meal.ingredients?.join(", ") ?? "",
          allergens: meal.allergens?.join(", ") ?? "",
          dietary_tags: meal.dietary_tags?.join(", ") ?? "",
          serving_size: meal.serving_size ?? "",
        });
        setMediaPreviews(meal.all_media_urls || []);
        if (meal.all_media_urls?.length) {
          setServerPreviews(meal.all_media_urls.map(url => ({
            url,
            isVideo: !!url.match(/\.(mp4|webm)$/i),
            isLocal: false
          })));
        } else if (meal.image_url) {
          setServerPreviews([{
            url: meal.image_url,
            isVideo: !!meal.image_url.match(/\.(mp4|webm)$/i),
            isLocal: false
          }]);
        }
      }
    }
  }, [mealId, menu]);

  // Manage object URLs for memory leak prevention
  useEffect(() => {
    const previews = form.media.map(file => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith('video/'),
      isLocal: true,
    }));
    setLocalPreviews(previews);
    
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [form.media]);

  const displayPreviews = localPreviews.length > 0 ? localPreviews : serverPreviews;

  const { mutate: saveMeal, isPending: isSaving } = useMutation({
    mutationFn: (data) => mealId ? updateMeal(mealId, data) : addMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorMenu"] });
      toast.success(mealId ? "Meal updated!" : "Meal added!");
      navigate(-1);
    },
    onError: (_err) => {
      toast.error("An error occurred. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required.");
      return;
    }

    const submitData = {
      ...form,
      ingredients: form.ingredients ? form.ingredients.split(",").map((s) => s.trim()).filter(Boolean) : [],
      allergens: form.allergens ? form.allergens.split(",").map((s) => s.trim()).filter(Boolean) : [],
      dietary_tags: form.dietary_tags ? form.dietary_tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    
    // Size category is handled in frontend for price ranges but let's pass it anyway if backend expects it
    saveMeal(submitData);
  };

  const inputClass = "input h-[46px] w-full border border-gray-300 rounded-[7px] px-3 focus:outline-none focus:border-lily";

  if (mealId && isLoading) {
    return (
      <VendorLayout title="Edit Meal" showBack onBack={() => navigate(-1)}>
        <div className="py-10 text-center text-gray-500 font-medium">Loading meal details...</div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout title={mealId ? "Edit Meal" : "Add Meal"} showBack onBack={() => navigate(-1)}>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        
        {/* Main Details */}
        <div className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setForm({ ...form, media: Array.from(e.target.files) });
                }
              }}
            />

            {displayPreviews.length > 0 ? (
              <div className="space-y-3">
                <div className="flex gap-3 overflow-x-auto w-full no-scrollbar items-center snap-x pb-2">
                  {displayPreviews.map((preview, i) => (
                    <div key={i} className="aspect-square w-64 shrink-0 snap-center rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                      {preview.isVideo ? (
                        <video 
                          src={preview.url} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          controls={false} 
                          className="w-full h-full object-cover pointer-events-none" 
                        />
                      ) : (
                        <img 
                          src={preview.url} 
                          alt={`Preview ${i}`} 
                          className="w-full h-full object-cover pointer-events-none" 
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="text-xs font-semibold text-lily flex items-center gap-1 hover:text-darklily transition-colors"
                >
                  <Upload size={14} /> Replace Media
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                className="w-full min-h-32 rounded-[7px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-lily transition-colors bg-gray-50 p-6"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  Tap to upload images or videos
                </p>
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  Supports JPEG, PNG, WEBP, MP4, WEBM
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meal Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Jollof Rice + Chicken"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₦) <span className="text-red-500">*</span></label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meal Size Category</label>
            <select
              value={form.size_category}
              onChange={(e) => setForm({ ...form, size_category: e.target.value })}
              className={inputClass}
            >
              <option value="small">Small (Snacks, light bites)</option>
              <option value="medium">Medium (Standard plates)</option>
              <option value="large">Large (Combos, special packs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Briefly describe what this meal contains..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-[7px] p-3 focus:outline-none focus:border-lily resize-none text-sm"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-lily hover:text-darklily transition-colors"
          >
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Advanced Options (Macros, Dietary Info, Video)
          </button>
        </div>

        {/* Advanced Options Form */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ingredients (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Rice, Chicken, Tomatoes"
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Calories (kcal)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Serving Size</label>
                <input
                  type="text"
                  placeholder="e.g. 1 plate"
                  value={form.serving_size}
                  onChange={(e) => setForm({ ...form, serving_size: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Protein (g)</label>
                <input type="number" step="0.1" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Carbs (g)</label>
                <input type="number" step="0.1" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Fat (g)</label>
                <input type="number" step="0.1" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Allergens (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Peanuts, Dairy"
                value={form.allergens}
                onChange={(e) => setForm({ ...form, allergens: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-lily text-white font-bold text-sm shadow-sm hover:bg-darklily transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : mealId ? "Save Changes" : "Add Meal"}
          </button>
        </div>
      </form>
    </VendorLayout>
  );
};

export default VendorMealFormPage;
