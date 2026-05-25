import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import { api } from "../../services/api";

// ── API functions ───────────────────────────────────────────────
const fetchVendorPackages = async () => {
  const res = await api.get("/foods/vendor/packages/");
  return res.data;
};
const createPackage = async (data) => {
  const res = await api.post("/foods/vendor/packages/", data);
  return res.data;
};
const updatePackage = async (id, data) => {
  const res = await api.patch(`/foods/vendor/packages/${id}/`, data);
  return res.data;
};
const deletePackage = async (id) => {
  const res = await api.delete(`/foods/vendor/packages/${id}/`);
  return res.data;
};

// ── Package Form ────────────────────────────────────────────────
const TIERS = [
  {
    key: "student",
    label: "Student",
    color: "bg-blue-100 text-blue-700",
    desc: "Affordable option for students and budget-conscious customers",
  },
  {
    key: "standard",
    label: "Standard",
    color: "bg-green-100 text-green-700",
    desc: "Regular pricing for most customers",
  },
  {
    key: "premium",
    label: "Premium",
    color: "bg-purple-100 text-purple-700",
    desc: "Premium experience with extras and priority delivery",
  },
  {
    key: "custom",
    label: "Custom",
    color: "bg-orange-100 text-orange-700",
    desc: "Define your own package name and pricing",
  },
];

const PackageForm = ({ pkg, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState({
    name: pkg?.name ?? "",
    tier: pkg?.tier ?? "standard",
    base_price: pkg?.base_price ?? "",
    description: pkg?.description ?? "",
    meals_per_cycle: pkg?.meals_per_cycle ?? 5,
    includes_delivery: pkg?.includes_delivery ?? false,
    extras: pkg?.extras ?? [],
  });
  const [newExtra, setNewExtra] = useState({ name: "", price: "" });

  const addExtra = () => {
    if (!newExtra.name.trim()) {
      toast.error("Extra name required");
      return;
    }
    if (!newExtra.price || isNaN(parseFloat(newExtra.price))) {
      toast.error("Valid price required");
      return;
    }
    setForm((f) => ({
      ...f,
      extras: [
        ...f.extras,
        { name: newExtra.name.trim(), price: parseFloat(newExtra.price) },
      ],
    }));
    setNewExtra({ name: "", price: "" });
  };

  const removeExtra = (i) =>
    setForm((f) => ({ ...f, extras: f.extras.filter((_, idx) => idx !== i) }));

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Package name required");
      return;
    }
    if (
      !form.base_price ||
      isNaN(parseFloat(form.base_price)) ||
      parseFloat(form.base_price) <= 0
    ) {
      toast.error("Enter a valid base price");
      return;
    }
    onSave({ ...form, base_price: parseFloat(form.base_price) });
  };

  const selectedTier = TIERS.find((t) => t.key === form.tier);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white  rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#111813] ">
            {pkg ? "Edit Package" : "Create Package"}
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-gray-100 "
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tier Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Package Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.key}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      tier: t.key,
                      name: t.key !== "custom" ? t.label + " Menu" : f.name,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border-2 ${form.tier === t.key ? "border-lily bg-lily/5" : "border-gray-100 "}`}
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${t.color}`}
                  >
                    {t.label}
                  </span>
                  <p className="text-gray-500 text-[10px] leading-tight">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Package Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Package Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Student Menu, Premium Pack"
              className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-lily"
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Base Price (₦) *
            </label>
            <input
              type="number"
              min="0"
              value={form.base_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, base_price: e.target.value }))
              }
              placeholder="e.g. 15000"
              className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-lily"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Price shown to customers before adding extras
            </p>
          </div>

          {/* Meals per cycle */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Meals Per Cycle
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    meals_per_cycle: Math.max(1, f.meals_per_cycle - 1),
                  }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100  text-lg font-bold flex items-center justify-center"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-[#111813] ">
                  {form.meals_per_cycle}
                </p>
                <p className="text-[10px] text-gray-400">meals/cycle</p>
              </div>
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    meals_per_cycle: f.meals_per_cycle + 1,
                  }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100  text-lg font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What makes this package special?"
              className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-lily resize-none"
            />
          </div>

          {/* Includes Delivery Toggle */}
          <div className="flex items-center justify-between bg-gray-50  rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#111813] ">
                Includes Delivery
              </p>
              <p className="text-xs text-gray-400">
                Free delivery bundled in this package
              </p>
            </div>
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  includes_delivery: !f.includes_delivery,
                }))
              }
              className={`w-12 h-6 rounded-full transition-all relative ${form.includes_delivery ? "bg-lily" : "bg-gray-200 "}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.includes_delivery ? "right-1" : "left-1"}`}
              />
            </button>
          </div>

          {/* Optional Extras (add-ons with pricing) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Optional Extras
            </label>
            <p className="text-[10px] text-gray-400 mb-2">
              Items customers can add — pricing updates automatically
            </p>

            {form.extras.map((extra, i) => (
              <div
                key={i}
                className="flex items-center gap-2 mb-2 bg-gray-50  rounded-xl px-3 py-2"
              >
                <span className="text-xs font-semibold text-[#111813]  flex-1">
                  {extra.name}
                </span>
                <span className="text-xs font-bold text-lily">
                  +₦{extra.price.toLocaleString()}
                </span>
                <button
                  onClick={() => removeExtra(i)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Extra name (e.g. Egg)"
                value={newExtra.name}
                onChange={(e) =>
                  setNewExtra((p) => ({ ...p, name: e.target.value }))
                }
                className="flex-1 px-3 py-2 rounded-xl border border-gray-100  bg-gray-50  text-xs text-[#111813]  focus:outline-none focus:border-lily"
              />
              <input
                type="number"
                placeholder="₦"
                value={newExtra.price}
                onChange={(e) =>
                  setNewExtra((p) => ({ ...p, price: e.target.value }))
                }
                className="w-20 px-3 py-2 rounded-xl border border-gray-100  bg-gray-50  text-xs text-[#111813]  focus:outline-none focus:border-lily"
              />
              <button
                onClick={addExtra}
                className="px-3 py-2 rounded-xl bg-lily text-white text-xs font-bold hover:bg-darklily transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-lily text-white font-bold text-sm hover:bg-darklily disabled:opacity-60 transition-colors"
          >
            {isSaving ? "Saving..." : pkg ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Package Card ────────────────────────────────────────────────
const PackageCard = ({ pkg, onEdit, onDelete, isDeleting }) => {
  const [expanded, setExpanded] = useState(false);
  const tier = TIERS.find((t) => t.key === pkg.tier) ?? TIERS[1];

  return (
    <div
      className={`bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden transition-opacity ${isDeleting ? "opacity-40" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.color}`}
              >
                {tier.label}
              </span>
              {pkg.includes_delivery && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                  Free Delivery
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-[#111813] ">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-lily">
              ₦{(pkg.base_price ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400">
              {pkg.meals_per_cycle} meals
            </p>
          </div>
        </div>

        {(pkg.extras ?? []).length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 font-medium mt-2"
          >
            <Tag size={11} />
            {pkg.extras.length} extra{pkg.extras.length !== 1 ? "s" : ""}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {expanded && (pkg.extras ?? []).length > 0 && (
          <div className="mt-2 space-y-1">
            {pkg.extras.map((e, i) => (
              <div
                key={i}
                className="flex justify-between text-xs bg-gray-50  rounded-lg px-3 py-1.5"
              >
                <span className="text-gray-600 ">{e.name}</span>
                <span className="font-bold text-lily">
                  +₦{(e.price ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex border-t border-gray-50 ">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-lily hover:bg-gray-50  transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
        <div className="w-px bg-gray-50 " />
        <button
          onClick={() => onDelete(pkg.id)}
          disabled={isDeleting}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50  transition-colors disabled:opacity-40"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const VendorPackagesPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendorPackages"],
    queryFn: fetchVendorPackages,
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (data) => createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorPackages"] });
      setShowForm(false);
      toast.success("Package created!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorPackages"] });
      setEditPkg(null);
      toast.success("Package updated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deletePackage(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorPackages"] });
      toast.success("Package deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setDeletingId(null),
  });

  if (isLoading)
    return (
      <VendorLayout title="Packages">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError)
    return (
      <VendorLayout title="Packages">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  const pkgList = packages ?? [];

  return (
    <VendorLayout title="Packages">
      <div className="bg-lily/10 border border-lily/20 rounded-2xl px-4 py-3">
        <p className="text-xs font-bold text-lily mb-0.5">
          💡 Package Pricing
        </p>
        <p className="text-xs text-gray-500">
          Define meal packages like "Student Menu" or "Premium Pack" with base
          prices. Customers can add optional extras and the price updates
          automatically.
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-lily text-white text-sm font-bold shadow-sm hover:bg-darklily transition-colors"
      >
        <Plus size={16} /> Create Package
      </button>

      {pkgList.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p className="text-2xl mb-3">📦</p>
          <p className="font-semibold text-[#111813]  mb-1">No packages yet</p>
          <p className="text-xs">
            Create your first package to offer tiered pricing to customers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pkgList.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isDeleting={deletingId === pkg.id}
              onEdit={(p) => setEditPkg(p)}
              onDelete={(id) => remove(id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PackageForm
          isSaving={creating}
          onSave={(d) => create(d)}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editPkg && (
        <PackageForm
          pkg={editPkg}
          isSaving={updating}
          onSave={(d) => update({ id: editPkg.id, data: d })}
          onCancel={() => setEditPkg(null)}
        />
      )}
    </VendorLayout>
  );
};

export default VendorPackagesPage;
