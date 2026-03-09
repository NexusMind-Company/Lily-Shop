import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchVendorMenu, addMeal, updateMeal, deleteMealItem } from "../../services/vendorDashboardApi";

const PRICE_RANGES = {
  small: { min: 1000, max: 2000, label: "Small Meal", example: "Snacks, light bites" },
  medium: { min: 2000, max: 3500, label: "Medium Meal", example: "Jollof Rice, Fried Rice" },
  large: { min: 3500, max: 5000, label: "Large Meal", example: "Full combos, special packs" },
};
const SIZE_COLORS = {
  small: "bg-blue-50 text-blue-700 border-blue-100",
  medium: "bg-green-50 text-green-700 border-green-100",
  large: "bg-purple-50 text-purple-700 border-purple-100",
};
const mockMenu = [
  { id: "M001", name: "Jollof Rice + Chicken", price: "2500", size_category: "medium", image_url: null, is_available: true },
  { id: "M002", name: "Egusi Soup + Pounded Yam", price: "3800", size_category: "large", image_url: null, is_available: true },
  { id: "M003", name: "Chin-Chin (100g)", price: "1200", size_category: "small", image_url: null, is_available: false },
];

const PriceGuide = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-8 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-[#111813] dark:text-white">Pricing Guidelines</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} className="text-gray-400" /></button>
      </div>
      <p className="text-xs text-gray-500 mb-4">Prices must fall within these ranges to keep meals affordable for customers.</p>
      {Object.entries(PRICE_RANGES).map(([size, { label, min, max, example }]) => (
        <div key={size} className={`rounded-xl border p-3 mb-2 ${SIZE_COLORS[size]}`}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-bold">{label}</span>
            <span className="text-sm font-bold">₦{min.toLocaleString()} – ₦{max.toLocaleString()}</span>
          </div>
          <p className="text-[10px] opacity-70">{example}</p>
        </div>
      ))}
    </div>
  </div>
);

const FoodGuidelines = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-8 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-[#111813] dark:text-white">Food Quality Standards</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} className="text-gray-400" /></button>
      </div>
      <div className="space-y-3">
        {[
          { emoji: "💰", title: "Affordable", desc: "Price must fall within the approved range for your meal size." },
          { emoji: "😋", title: "Delicious", desc: "Well-seasoned, properly cooked Nigerian dishes." },
          { emoji: "🧼", title: "Hygienically Prepared", desc: "Clean environment, fresh ingredients daily." },
          { emoji: "🍛", title: "Popular Nigerian Dishes", desc: "Jollof Rice, Egusi, Fried Rice, Pepper Soup, etc." },
          { emoji: "📏", title: "Correct Portion Sizing", desc: "Portions must match the selected size category." },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-xl">{emoji}</span>
            <div>
              <p className="text-sm font-bold text-[#111813] dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full mt-5 py-3 rounded-xl bg-[#4eb75e] text-white font-bold text-sm">I Understand</button>
    </div>
  </div>
);

const MealForm = ({ meal, onSave, onCancel, isSaving }) => {
  const fileRef = useRef();
  const [form, setForm] = useState({
    name: meal?.name ?? "",
    price: meal?.price ?? "",
    size_category: meal?.size_category ?? "medium",
    description: meal?.description ?? "",
    image: null,
  });
  const [showPriceGuide, setShowPriceGuide] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(!meal);

  const range = PRICE_RANGES[form.size_category];
  const priceNum = parseFloat(form.price);
  const priceValid = !form.price || (priceNum >= range.min && priceNum <= range.max);
  const priceWarning = !!form.price && !priceValid;

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Meal name is required."); return; }
    if (!form.price) { toast.error("Price is required."); return; }
    if (isNaN(priceNum) || priceNum <= 0) { toast.error("Enter a valid price."); return; }
    if (!priceValid) { toast.error(`Price must be ₦${range.min.toLocaleString()}–₦${range.max.toLocaleString()} for ${form.size_category} meals.`); return; }
    onSave(form);
  };

  if (showGuidelines) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-8 shadow-2xl">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-[#4eb75e]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🍛</span>
            </div>
            <h3 className="font-bold text-[#111813] dark:text-white text-lg">Before You Add a Meal</h3>
            <p className="text-xs text-gray-500 mt-1">Please review our food standards</p>
          </div>
          <div className="space-y-2 mb-5">
            {["Meals must be affordable & properly priced", "Nigerian dishes preferred (Jollof, Egusi, etc.)", "Hygienically prepared with fresh ingredients", "Portions must match the selected size category"].map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle size={14} className="text-[#4eb75e] flex-shrink-0" />
                {point}
              </div>
            ))}
          </div>
          <button onClick={() => setShowGuidelines(false)} className="w-full py-3 rounded-xl bg-[#4eb75e] text-white font-bold text-sm">I Understand – Continue</button>
          <button onClick={onCancel} className="w-full mt-2 py-2 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#111813] dark:text-white">{meal ? "Edit Meal" : "Add New Meal"}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div onClick={() => fileRef.current.click()}
            className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#4eb75e] transition-colors">
            <Upload size={20} className="text-gray-300 mb-1" />
            <p className="text-xs text-gray-400">{form.image ? form.image.name : "Tap to upload meal image"}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setForm({ ...form, image: e.target.files[0] }); }} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Meal Name *</label>
            <input type="text" placeholder="e.g. Jollof Rice + Chicken" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e]" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Meal Size *</label>
            <div className="grid grid-cols-3 gap-2">
              {["small", "medium", "large"].map((size) => (
                <button key={size} onClick={() => setForm({ ...form, size_category: size })}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${form.size_category === size ? "bg-[#4eb75e] text-white shadow-sm" : "bg-gray-50 dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Price (₦) *</label>
              <button onClick={() => setShowPriceGuide(true)} className="text-[10px] text-[#4eb75e] font-semibold flex items-center gap-1">
                <Info size={11} /> View price guide
              </button>
            </div>
            <input type="number" min="0"
              placeholder={`₦${range.min.toLocaleString()} – ₦${range.max.toLocaleString()}`}
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none transition-colors ${priceWarning ? "border-red-400 focus:border-red-400" : "border-gray-100 dark:border-gray-700 focus:border-[#4eb75e]"}`} />
            {priceWarning && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                <AlertTriangle size={11} />
                Price must be ₦{range.min.toLocaleString()} – ₦{range.max.toLocaleString()} for {form.size_category} meals
              </p>
            )}
            {form.price && priceValid && (
              <p className="flex items-center gap-1 text-xs text-[#4eb75e] mt-1.5">
                <CheckCircle size={11} /> Price is within the approved range
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description (optional)</label>
            <textarea rows={2} placeholder="Brief description of the meal..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e] resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={priceWarning || isSaving}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all ${priceWarning || isSaving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#4eb75e] hover:bg-[#3da64d]"}`}>
            {isSaving ? "Saving..." : meal ? "Save Changes" : "Add Meal"}
          </button>
        </div>
        {showPriceGuide && <PriceGuide onClose={() => setShowPriceGuide(false)} />}
      </div>
    </div>
  );
};

const VendorMenuPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editMeal, setEditMeal] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: menu, isLoading, isError, error, refetch,
  } = useQuery({
    queryKey: ["vendorMenu"],
    queryFn: fetchVendorMenu,
    placeholderData: mockMenu,
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });

  const { mutate: add, isPending: adding } = useMutation({
    mutationFn: (data) => addMeal(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorMenu"] }); setShowForm(false); toast.success("Meal added!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => updateMeal(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorMenu"] }); setEditMeal(null); toast.success("Meal updated!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deleteMealItem(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorMenu"] }); toast.success("Meal removed."); },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setDeletingId(null),
  });

  const menuData = menu ?? mockMenu;

  if (isLoading && !menu) return <VendorLayout title="Menu"><VendorPageLoader /></VendorLayout>;
  if (isError && !menu) return <VendorLayout title="Menu"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  return (
    <VendorLayout title="Menu">
      <div className="flex gap-2">
        <button onClick={() => setShowGuidelines(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-xs font-semibold text-gray-500">
          <Info size={14} /> Guidelines
        </button>
        <button onClick={() => setShowForm(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4eb75e] text-white text-sm font-bold shadow-sm hover:bg-[#3da64d] transition-colors">
          <Plus size={16} /> Add Meal
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {["small", "medium", "large"].map((size) => {
          const count = menuData.filter((m) => m.size_category === size).length;
          return (
            <div key={size} className={`rounded-xl border p-2 ${SIZE_COLORS[size]}`}>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] font-medium capitalize">{size}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {menuData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No meals yet. Add your first meal!</div>
        ) : (
          menuData.map((meal) => (
            <div key={meal.id} className={`bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3 transition-opacity ${deletingId === meal.id ? "opacity-40" : ""}`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                {meal.image_url ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" /> : "🍛"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111813] dark:text-white truncate">{meal.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${SIZE_COLORS[meal.size_category] ?? ""}`}>{meal.size_category}</span>
                  <span className="text-xs font-bold text-[#4eb75e]">₦{parseFloat(meal.price).toLocaleString()}</span>
                  {!meal.is_available && <span className="text-[10px] text-red-500 font-medium">Unavailable</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditMeal(meal)}
                  className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-[#4eb75e] transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(meal.id)} disabled={deletingId === meal.id}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <MealForm isSaving={adding} onSave={(d) => add(d)} onCancel={() => setShowForm(false)} />}
      {editMeal && <MealForm meal={editMeal} isSaving={updating} onSave={(d) => update({ id: editMeal.id, data: d })} onCancel={() => setEditMeal(null)} />}
      {showGuidelines && <FoodGuidelines onClose={() => setShowGuidelines(false)} />}
    </VendorLayout>
  );
};

export default VendorMenuPage;