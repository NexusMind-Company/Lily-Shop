import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import { api } from "../../services/api";

const fetchMyVendorProfile = async () => {
  const res = await api.get("/foods/food-vendors/me/");
  return res.data;
};

const updateMyVendorProfile = async (data) => {
  const formData = new FormData();
  [
    "name",
    "cuisine",
    "description",
    "contact_email",
    "contact_phone",
    "address",
  ].forEach((k) => {
    if (data[k] !== undefined && data[k] !== null) formData.append(k, data[k]);
  });
  if (data.media instanceof File) formData.append("media", data.media);
  // Use the correct endpoint for vendor profile update
  const res = await api.patch("/foods/food-vendors/me/update/", formData);
  return res.data;
};

const VendorEditProfilePage = () => {
  const queryClient = useQueryClient();

  const {
    data: vendor,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myVendorProfile"],
    queryFn: fetchMyVendorProfile,
  });

  const [form, setForm] = useState({
    name: "",
    cuisine: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [mediaFile, setMediaFile] = useState(null);

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name ?? "",
        cuisine: vendor.cuisine ?? "",
        description: vendor.description ?? "",
        contact_email: vendor.contact_email ?? "",
        contact_phone: vendor.contact_phone ?? "",
        address: vendor.address ?? "",
      });
    }
  }, [vendor]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateMyVendorProfile({ ...form, media: mediaFile }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVendorProfile"] });
      toast.success("Profile updated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold text-gray-600  mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e] transition-colors"
      />
    </div>
  );

  if (isLoading)
    return (
      <VendorLayout title="Edit Profile">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError)
    return (
      <VendorLayout title="Edit Profile">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  return (
    <VendorLayout title="Edit Vendor Profile">
      <div className="max-max-w-xl space-y-6">
        <div className="bg-[#4eb75e]/10 border border-[#4eb75e]/20 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-[#4eb75e] mb-0.5">
            Vendor Profile
          </p>
          <p className="text-xs text-gray-500">
            Update your restaurant details. Changes are visible to customers
            immediately.
          </p>
        </div>

        {/* Current photo */}
        {vendor?.image_url && (
          <div className="flex justify-center">
            <img
              src={vendor.image_url}
              alt="Vendor"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#4eb75e]/30"
            />
          </div>
        )}

        <div className="bg-white  rounded-2xl p-5 shadow-sm border border-gray-100  space-y-4">
          {field(
            "name",
            "Restaurant / Vendor Name *",
            "text",
            "e.g. Mama Nkechi's Kitchen",
          )}
          {field(
            "address",
            "Restaurant Address *",
            "text",
            "e.g. 12 Adeola Odeku Street, VI, Lagos",
          )}
          {field("cuisine", "Cuisine", "text", "e.g. Nigerian, Continental")}

          <div>
            <label className="block text-sm font-semibold text-gray-600  mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Tell customers what makes your food special..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e] resize-none transition-colors"
            />
          </div>

          {field(
            "contact_email",
            "Contact Email",
            "email",
            "restaurant@email.com",
          )}
          {field("contact_phone", "Contact Phone", "tel", "e.g. 08012345678")}

          <div>
            <label className="block text-sm font-semibold text-gray-600  mb-1.5">
              Update Photo / Media
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files[0] ?? null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#4eb75e]/10 file:text-[#4eb75e] hover:file:bg-[#4eb75e]/20"
            />
            {mediaFile && (
              <p className="text-[10px] text-gray-400 mt-1">{mediaFile.name}</p>
            )}
          </div>

          <button
            onClick={() => save()}
            disabled={isPending || !form.name.trim() || !form.address.trim()}
            className="w-full py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorEditProfilePage;
