import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSubscriptionVendor } from "../../redux/createSubscriptionVendorSlice";
import useFormValidation from "../../hooks/useFormValidation";
import { toast } from "react-hot-toast";
import ErrorDisplay from "../common/ErrorDisplay";

const INITIAL_FORM_STATE = {
  name: "",
  cuisine: "",
  description: "",
  contact_email: "",
  contact_phone: "",
  address: "",
};

const VALIDATION_RULES = {
  name: {
    required: true,
    requiredMessage: "Restaurant/Vendor name is required.",
    maxLength: 255,
  },
  description: { required: true, requiredMessage: "Description is required." },
  address: {
    required: true,
    requiredMessage:
      "Address is required. Customers need to know where you are.",
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
    patternMessage:
      "Please enter a valid Nigerian phone number (e.g. 08012345678).",
    maxLength: 20,
  },
};

const CreateSubscriptionVendor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

  // If already a vendor, redirect immediately — don't show the form
  const isAlreadyVendor = Boolean(
    user_data?.vendor_id || profileData?.user?.vendor_id,
  );

  useEffect(() => {
    if (isAlreadyVendor) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [isAlreadyVendor, navigate]);

  const {
    values,
    errors: fieldErrors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    resetForm,
  } = useFormValidation(INITIAL_FORM_STATE, VALIDATION_RULES);

  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [bannerFile, setBannerFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [bannerPreview, profilePreview]);

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

  const actualSubmitLogic = async (validatedTextValues) => {
    setSubmissionStatus("loading");

    const vendorData = {
      shop_name: validatedTextValues.name.trim(),
      category: validatedTextValues.cuisine.trim(),
      description: validatedTextValues.description.trim(),
      contact_email: validatedTextValues.contact_email?.trim() || null,
      contact_phone: validatedTextValues.contact_phone.trim(),
      address: validatedTextValues.address.trim(),
      banner_image: bannerFile,
      profile_image: profileFile,
      service_days: JSON.stringify([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ]),
    };

    try {
      await dispatch(createSubscriptionVendor(vendorData)).unwrap();
      toast.success("Food vendor created successfully!");
      setSubmissionStatus("succeeded");
      resetForm();

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      let errorMsg = "Failed to create food vendor. ";
      if (err && err.message && err.message.includes("timeout")) {
        errorMsg += "Request timed out. Please try again.";
      } else if (err && err.message && err.message.includes("Network Error")) {
        errorMsg += "Network error. Please check your connection.";
      } else if (err && typeof err === "object" && err.status === 401) {
        errorMsg = "Please log in to create a vendor.";
      } else if (
        err &&
        typeof err === "object" &&
        err.detail &&
        typeof err.detail === "string" &&
        err.detail.includes("already has")
      ) {
        toast.success("Redirecting to dashboard...");
        setSubmissionStatus("succeeded");
        setTimeout(() => {
          navigate("/vendor/dashboard");
        }, 2000);
        return;
      } else if (
        err &&
        typeof err === "object" &&
        err.detail &&
        typeof err.detail === "string"
      ) {
        errorMsg = err.detail;
      } else if (
        err &&
        typeof err === "object" &&
        err.payload &&
        typeof err.payload === "string"
      ) {
        errorMsg = err.payload;
      } else if (typeof err === "string") {
        errorMsg = err;
      } else {
        errorMsg += "Please try again later.";
      }
      toast.error(errorMsg);
      setSubmissionStatus("failed");
    }
  };

  const inputClass = (fieldName) =>
    `input h-[46px] w-full ${fieldErrors[fieldName] ? "border-red-500" : "border-gray-300"}`;

  // Don't render form while redirect is in progress
  if (isAlreadyVendor) return null;

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Food Vendor</span>
          </h1>
        </div>
      </div>

      {/* Manual error/success UI removed in favor of Toasts */}

      <form
        className="w-full flex flex-col gap-5"
        onSubmit={handleFormSubmit(actualSubmitLogic)}
        noValidate
      >
        {/* Restaurant / Vendor Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Restaurant / Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Mama Nkechi's Kitchen"
            className={inputClass("name")}
            aria-invalid={fieldErrors.name ? "true" : "false"}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Address — required */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Restaurant Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 12 Adeola Odeku Street, Victoria Island, Lagos"
            className={inputClass("address")}
            aria-invalid={fieldErrors.address ? "true" : "false"}
          />
          {fieldErrors.address ? (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">
              Customers will use this to find your restaurant.
            </p>
          )}
        </div>

        {/* Cuisine */}
        <div>
          <label
            htmlFor="cuisine"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cuisine
          </label>
          <input
            type="text"
            id="cuisine"
            name="cuisine"
            value={values.cuisine}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Nigerian, Continental, Chinese"
            className={inputClass("cuisine")}
            aria-invalid={fieldErrors.cuisine ? "true" : "false"}
          />
          {fieldErrors.cuisine && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.cuisine}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell customers what makes your food special..."
            className={`input h-20 w-full ${fieldErrors.description ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={fieldErrors.description ? "true" : "false"}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label
            htmlFor="contact_email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contact Email
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={values.contact_email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="restaurant@email.com"
            className={inputClass("contact_email")}
            aria-invalid={fieldErrors.contact_email ? "true" : "false"}
          />
          {fieldErrors.contact_email && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.contact_email}
            </p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label
            htmlFor="contact_phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contact Phone
          </label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            value={values.contact_phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 08012345678"
            className={inputClass("contact_phone")}
            aria-invalid={fieldErrors.contact_phone ? "true" : "false"}
          />
          {fieldErrors.contact_phone && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.contact_phone}
            </p>
          )}
        </div>

        {/* Media */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banner Image */}
            <div>
              <label
                htmlFor="banner_image"
                className="block text-sm font-medium text-[#111813] mb-1"
              >
                Banner Image
              </label>
              <div className="flex flex-col gap-2 relative">
                {bannerPreview ? (
                  <div className="relative w-full h-30 rounded-xl overflow-hidden shadow-sm">
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-30 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#13ec49] hover:bg-[#f6f8f6] transition-all rounded-xl cursor-pointer">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 mb-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500">
                      Upload Banner (Optional)
                    </span>
                    <input
                      type="file"
                      id="banner_image"
                      name="banner_image"
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
              <label
                htmlFor="profile_image"
                className="block text-sm font-medium text-[#111813] mb-1"
              >
                Logo / Profile
              </label>
              <div className="flex flex-col gap-2 relative">
                {profilePreview ? (
                  <div className="relative w-full h-30 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={profilePreview}
                      alt="Cover"
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-30 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#13ec49] hover:bg-[#f6f8f6] transition-all rounded-xl cursor-pointer">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 mb-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500">
                      Upload Profile (Optional)
                    </span>
                    <input
                      type="file"
                      id="profile_image"
                      name="profile_image"
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

        <button
          type="submit"
          className="input pt-0 h-11.5 bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] disabled:opacity-50 hover:bg-lily hover:text-white cursor-pointer"
          disabled={isSubmitting || submissionStatus === "loading"}
        >
          {submissionStatus === "loading"
            ? "Creating Vendor..."
            : "Create Food Vendor"}
        </button>
      </form>
    </section>
  );
};

export default CreateSubscriptionVendor;
