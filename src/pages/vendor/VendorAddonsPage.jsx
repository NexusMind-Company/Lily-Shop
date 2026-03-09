import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchAddons, createAddon, updateAddon, deleteAddon } from "../../services/vendorDashboardApi";

const mockAddons = [
  { id: "A001", name: "Zobo Drink", price: 500, description: "Chilled hibiscus drink", is_available: true },
  { id: "A002", name: "Cake Slice", price: 700, description: "Chef's daily bake", is_available: true },
  { id: "A003", name: "Fruit Salad", price: 600, description: "Mixed seasonal fruits", is_available: false },
];

const AddonForm = ({ addon, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState({ name: addon?.name ?? "", price: addon?.price ?? "", description: addon?.description ?? "" });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) { toast.error("Enter a valid price greater than 0."); return; }
    onSave({ ...form, price: parseFloat(form.price) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#111813] dark:text-white">{addon ? "Edit Add-on" : "New Add-on"}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: "Add-on Name *", key: "name", type: "text", placeholder: "e.g. Zobo Drink" },
            { label: "Price (₦) *", key: "price", type: "number", placeholder: "e.g. 500" },
            { label: "Description", key: "description", type: "text", placeholder: "Short description..." },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e]" />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors">
            {isSaving ? "Saving..." : addon ? "Save Changes" : "Add to Menu"}
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorAddonsPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editAddon, setEditAddon] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: addons, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["vendorAddons"],
    queryFn: fetchAddons,
    placeholderData: mockAddons,
    retry: 2,
  });

  const { mutate: add, isPending: adding } = useMutation({
    mutationFn: (data) => createAddon(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAddons"] }); setShowForm(false); toast.success("Add-on created!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => updateAddon(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAddons"] }); setEditAddon(null); toast.success("Add-on updated!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deleteAddon(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAddons"] }); toast.success("Add-on removed."); },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setDeletingId(null),
  });

  const toggleAvailability = (addon) => update({ id: addon.id, data: { is_available: !addon.is_available } });

  if (isLoading && !addons) return <VendorLayout title="Add-ons"><VendorPageLoader /></VendorLayout>;
  if (isError && !addons) return <VendorLayout title="Add-ons"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  const addonList = addons ?? mockAddons;

  return (
    <VendorLayout title="Add-ons">
      <div className="bg-[#4eb75e]/10 border border-[#4eb75e]/20 rounded-2xl px-4 py-3">
        <p className="text-xs font-bold text-[#4eb75e] mb-0.5">💡 Revenue Booster</p>
        <p className="text-xs text-gray-500">Optional extras customers can add with their meal subscriptions — drinks, desserts, weekend treats.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["Zobo – ₦500", "Cake Slice – ₦700", "Fruit Salad – ₦600", "Malt – ₦400"].map((ex) => (
          <span key={ex} className="flex-shrink-0 text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1.5 rounded-full font-medium">{ex}</span>
        ))}
      </div>

      <button onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4eb75e] text-white text-sm font-bold shadow-sm hover:bg-[#3da64d] transition-colors">
        <Plus size={16} /> Add New Add-on
      </button>

      <div className="space-y-3">
        {addonList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No add-ons yet. Create your first one!</div>
        ) : (
          addonList.map((addon) => (
            <div key={addon.id} className={`bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-opacity ${deletingId === addon.id ? "opacity-40" : ""} ${!addon.is_available ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-xl flex-shrink-0">🍹</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111813] dark:text-white">{addon.name}</p>
                  <p className="text-xs text-gray-400">{addon.description}</p>
                </div>
                <p className="text-sm font-bold text-[#4eb75e] flex-shrink-0">₦{(addon.price ?? 0).toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                <button onClick={() => toggleAvailability(addon)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${addon.is_available ? "text-[#4eb75e]" : "text-gray-400"}`}>
                  {addon.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {addon.is_available ? "Available" : "Unavailable"}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => setEditAddon(addon)} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-[#4eb75e] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(addon.id)} disabled={deletingId === addon.id}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <AddonForm isSaving={adding} onSave={(d) => add(d)} onCancel={() => setShowForm(false)} />}
      {editAddon && <AddonForm addon={editAddon} isSaving={updating} onSave={(d) => update({ id: editAddon.id, data: d })} onCancel={() => setEditAddon(null)} />}
    </VendorLayout>
  );
};

export default VendorAddonsPage;