import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  api,
  updateFoodVendor,
  fetchStates,
  fetchLgas,
} from "../../services/api";
import useFormValidation from "../../hooks/useFormValidation";
import { X } from "lucide-react";

const VALIDATION_RULES = {
  name: {
    required: true,
    requiredMessage: "Restaurant/Vendor name is required.",
    maxLength: 255,
  },
  description: { required: true, requiredMessage: "Description is required." },
  address: {
    required: true,
    requiredMessage: "Address is required.",
  },
  state: {
    required: true,
    requiredMessage: "State is required.",
  },
  lga: {
    required: true,
    requiredMessage: "LGA is required.",
  },
  cuisine: { required: false, maxLength: 255 },
  contact_email: {
    required: false,
    email: true,
    invalidMessage: "Please enter a valid email.",
    maxLength: 254,
  },
  contact_phone: {
    required: true,
    requiredMessage: "Phone number is required.",
    pattern: /^(\+234|0)[789]\d{9}$/,
    patternMessage: "Please enter a valid Nigerian phone number.",
    maxLength: 20,
  },
};

const fetchFoodVendorProfile = async (vendorId) => {
  if (!vendorId) return null;
  const res = await api.get(`/foods/food-vendors/${vendorId}/`);
  return res.data;
};

const VendorEditProfileForm = ({ onCancel, onSuccess }) => {
  const queryClient = useQueryClient();
  const { data: profileData } = useSelector((state) => state.profile);
  const { user_data } = useSelector((state) => state.auth);

  const vendorId = profileData?.user?.vendor_id || user_data?.vendor_id;

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["myVendorProfile", vendorId],
    queryFn: () => fetchFoodVendorProfile(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 10, // Keep data fresh for 10 minutes
    retry: false, // Prevent multiple requests if the endpoint fails
  });

  const {
    values,
    errors: fieldErrors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    setValues,
  } = useFormValidation(
    {
      name: "",
      cuisine: "",
      description: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      state: "",
      lga: "",
    },
    VALIDATION_RULES,
  );

  const [bannerFile, setBannerFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    const loadStates = async () => {
      setStatesLoading(true);
      try {
        const data = await fetchStates();
        setStates(data);
      } catch (err) {
        console.error("Failed to load states:", err);
      } finally {
        setStatesLoading(false);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    const loadLgas = async () => {
      if (!values.state) {
        setLgas([]);
        return;
      }
      setLgasLoading(true);
      try {
        const data = await fetchLgas(values.state);
        setLgas(data);
      } catch (err) {
        console.error("Failed to load LGAs:", err);
      } finally {
        setLgasLoading(false);
      }
    };
    loadLgas();
  }, [values.state]);

  useEffect(() => {
    if (vendor) {
      setValues({
        name: vendor.name || "",
        cuisine: vendor.cuisine || "",
        description: vendor.description || "",
        contact_email: vendor.contact_email || "",
        contact_phone: vendor.contact_phone || "",
        address: vendor.address || "",
        state: vendor.state || "",
        lga: vendor.lga || "",
      });
      if (vendor.image_url) {
        setProfilePreview(vendor.image_url);
      }
      // Note: banner_image might not be separate in the current response,
      // but we'll handle it if it exists or if the user uploads a new one.
    }
  }, [vendor, setValues]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data) =>
      updateFoodVendor({
        shop_name: data.name,
        category: data.cuisine,
        description: data.description,
        address: data.address,
        state: data.state,
        lga: data.lga,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone,
        banner_image: bannerFile,
        profile_image: profileFile,
      }),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["myVendorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["vendorDashboardOverview"] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to update profile",
      );
    },
  });

  const onSubmit = (validatedValues) => {
    updateProfile(validatedValues);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const inputClass = (fieldName) =>
    `input h-[46px] w-full ${fieldErrors[fieldName] ? "border-red-500" : "border-gray-300"}`;

  if (vendorLoading)
    return (
      <div className="py-10 text-center text-gray-500 font-medium">
        Loading vendor profile...
      </div>
    );

  return (
    <div className="w-full space-y-6">
      {/* Flat Header */}
      <div className="rounded-2xl border border-solid border-black h-16 w-full flex items-center justify-center bg-white shadow-sm">
        <h2 className="text-xl font-normal font-poppins text-black">
          Edit <span className="text-lily">Food Vendor</span>
        </h2>
      </div>

      <form
        className="w-full flex flex-col gap-6"
        onSubmit={handleFormSubmit(onSubmit)}
        noValidate
      >
        {/* Restaurant / Vendor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Restaurant / Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Mama Nkechi's Kitchen"
            className={inputClass("name")}
            aria-invalid={fieldErrors.name ? "true" : "false"}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-xs mt-1.5">{fieldErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* State Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={values.state}
              onChange={(e) => {
                handleChange(e);
                setValues((prev) => ({ ...prev, lga: "" }));
              }}
              onBlur={handleBlur}
              className={inputClass("state")}
              disabled={statesLoading}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {fieldErrors.state && (
              <p className="text-red-500 text-xs mt-1.5">{fieldErrors.state}</p>
            )}
          </div>

          {/* LGA Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              LGA <span className="text-red-500">*</span>
            </label>
            <select
              name="lga"
              value={values.lga}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("lga")}
              disabled={lgasLoading || !values.state}
            >
              <option value="">Select LGA</option>
              {lgas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {fieldErrors.lga && (
              <p className="text-red-500 text-xs mt-1.5">{fieldErrors.lga}</p>
            )}
          </div>
        </div>

        {/* Restaurant Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Restaurant Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 12 Adeola Odeku Street, Victoria Island, Lagos"
            className={inputClass("address")}
            aria-invalid={fieldErrors.address ? "true" : "false"}
          />
          {fieldErrors.address && (
            <p className="text-red-500 text-xs mt-1.5">{fieldErrors.address}</p>
          )}
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cuisine
          </label>
          <input
            type="text"
            name="cuisine"
            value={values.cuisine}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Nigerian, Continental, Chinese"
            className={inputClass("cuisine")}
            aria-invalid={fieldErrors.cuisine ? "true" : "false"}
          />
          {fieldErrors.cuisine && (
            <p className="text-red-500 text-xs mt-1.5">{fieldErrors.cuisine}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell customers what makes your food special..."
            className={`input h-28 w-full pt-3 resize-none ${fieldErrors.description ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={fieldErrors.description ? "true" : "false"}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1.5">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={values.contact_email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="restaurant@email.com"
              className={inputClass("contact_email")}
              aria-invalid={fieldErrors.contact_email ? "true" : "false"}
            />
            {fieldErrors.contact_email && (
              <p className="text-red-500 text-xs mt-1.5">
                {fieldErrors.contact_email}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={values.contact_phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 08012345678"
              className={inputClass("contact_phone")}
              aria-invalid={fieldErrors.contact_phone ? "true" : "false"}
            />
            {fieldErrors.contact_phone && (
              <p className="text-red-500 text-xs mt-1.5">
                {fieldErrors.contact_phone}
              </p>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-[#111813] mb-1.5">
                Banner Image
              </label>
              <div className="flex flex-col gap-2 relative">
                {bannerPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm border border-black">
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-lily hover:bg-[#f6f8f6] transition-all rounded-xl cursor-pointer">
                    <span className="text-xs font-semibold text-gray-500 text-center px-4">
                      Upload Banner (Optional)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-[#111813] mb-1.5">
                Logo / Profile
              </label>
              <div className="flex flex-col gap-2 relative">
                {profilePreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm border border-black">
                    <img
                      src={profilePreview}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileFile(null);
                        setProfilePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-lily hover:bg-[#f6f8f6] transition-all rounded-xl cursor-pointer">
                    <span className="text-xs font-semibold text-gray-500 text-center px-4">
                      Upload Logo (Optional)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 pb-12">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 border border-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="flex-1 h-12 bg-sun hover:bg-lily hover:text-white border border-black border-solid rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorEditProfileForm;
