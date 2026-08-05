import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError } from "../../components/vendor/VendorErrorStates";
import { getErrorMessage } from "../../utils/errorUtils";
import { fetchVendorMenu, updateMeal, deleteMealItem } from "../../services/vendorDashboardApi";

const SIZE_COLORS = {
  small: "bg-blue-50 text-blue-700 border-blue-100",
  medium: "bg-green-50 text-green-700 border-green-100",
  large: "bg-purple-50 text-purple-700 border-purple-100",
};

const VendorMenuPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: menu,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendorMenu"],
    queryFn: fetchVendorMenu,
    staleTime: 1000 * 60 * 2,
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => updateMeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorMenu"] });
      toast.success("Meal availability updated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deleteMealItem(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorMenu"] });
      toast.success("Meal removed.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setDeletingId(null),
  });

  const menuData = Array.isArray(menu) ? menu : (menu?.results ?? []);

  if (isLoading && !menu)
    return (
      <VendorLayout title="Menu" showBack onBack={() => navigate(-1)}>
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError && !menu)
    return (
      <VendorLayout title="Menu" showBack onBack={() => navigate(-1)}>
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  return (
    <VendorLayout title="Menu" showBack onBack={() => navigate(-1)}>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => navigate("/vendor/dashboard/menu/add")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-lily text-white text-sm font-bold shadow-sm hover:bg-darklily transition-colors"
        >
          <Plus size={16} /> Add New Meal
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        {["small", "medium", "large"].map((size) => {
          const count = menuData.filter((m) => m.size_category === size).length;
          return (
            <div
              key={size}
              className={`rounded-xl border p-2 ${SIZE_COLORS[size]}`}
            >
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] font-medium capitalize">{size}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {menuData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            No meals yet. Add your first meal to start selling!
          </div>
        ) : (
          menuData.map((meal) => (
            <div
              key={meal.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 transition-opacity ${deletingId === meal.id ? "opacity-40" : ""}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                {meal.image_url ? (
                  <img
                    src={meal.image_url}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🍛"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111813] truncate">
                  {meal.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-bold text-lily">
                    ₦{parseFloat(meal.price).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      update({ id: meal.id, data: { is_available: !meal.is_available } });
                    }}
                    disabled={updating}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${meal.is_available ? 'bg-lily' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${meal.is_available ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-[10px] font-medium ${meal.is_available ? 'text-green-600' : 'text-red-500'}`}>
                    {meal.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/vendor/dashboard/menu/edit/${meal.id}`)}
                  className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-lily transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => remove(meal.id)}
                  disabled={deletingId === meal.id}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorMenuPage;
