import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSubscriptionVendor } from "../../redux/createSubscriptionVendorSlice";
import useFormValidation from "../../hooks/useFormValidation";
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
  name: { required: true, requiredMessage: "Restaurant/Vendor name is required.", maxLength: 255 },
  description: { required: true, requiredMessage: "Description is required." },
  address: { required: true, requiredMessage: "Address is required. Customers need to know where you are." },
  cuisine: { required: false, maxLength: 255 },
  contact_email: {
    required: false,
    email: true,
    invalidMessage: "Please enter a valid email.",
    maxLength: 254,
  },
  contact_phone: { required: false, maxLength: 20 },
};

const CreateSubscriptionVendor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

  // If already a vendor, redirect immediately — don't show the form
  const isAlreadyVendor = Boolean(
    user_data?.vendor_id || profileData?.user?.vendor_id
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
    setErrors: setFieldErrors,
  } = useFormValidation(INITIAL_FORM_STATE, VALIDATION_RULES);

  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const actualSubmitLogic = async (validatedTextValues) => {
    setSubmissionStatus("loading");
    setSubmissionError(null);
    setSuccessMsg("");

    const vendorData = {
      name: validatedTextValues.name.trim(),
      cuisine: validatedTextValues.cuisine.trim(),
      description: validatedTextValues.description.trim(),
      contact_email: validatedTextValues.contact_email.trim(),
      contact_phone: validatedTextValues.contact_phone.trim(),
      address: validatedTextValues.address.trim(),
      media: mediaFiles,
    };

    try {
      await dispatch(createSubscriptionVendor(vendorData)).unwrap();
      setSuccessMsg("Food vendor created successfully! Redirecting...");
      setSubmissionStatus("succeeded");
      resetForm();

      setTimeout(() => {
        setSuccessMsg("");
        navigate("/vendor/dashboard");
      }, 3000);
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
        setSuccessMsg(
          "You already have a vendor profile. Redirecting to dashboard...",
        );
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
      setSubmissionError(errorMsg);
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
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Food Vendor</span>
          </h1>
        </div>
      </div>

      {submissionStatus === "failed" && submissionError && (
        <div className="w-full my-3">
          <ErrorDisplay message={submissionError} />
        </div>
      )}

      {submissionStatus === "succeeded" && successMsg && (
        <div className="w-full my-3 p-3 text-green-700 bg-green-100 rounded-md border border-green-300 text-center">
          {successMsg}
        </div>
      )}

      <form
        className="w-full flex flex-col gap-5"
        onSubmit={handleFormSubmit(actualSubmitLogic)}
        noValidate
      >
        {/* Restaurant / Vendor Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell customers what makes your food special..."
            className={`input h-[80px] w-full ${fieldErrors.description ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={fieldErrors.description ? "true" : "false"}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
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
            <p className="text-red-500 text-xs mt-1">{fieldErrors.contact_email}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
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
            <p className="text-red-500 text-xs mt-1">{fieldErrors.contact_phone}</p>
          )}
        </div>

        {/* Media */}
        <div>
          <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-1">
            Photos / Media
          </label>
          <input
            type="file"
            id="media"
            name="media"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setMediaFiles(Array.from(e.target.files))}
            className="input h-[46px] w-full border-gray-300"
          />
          {mediaFiles.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {mediaFiles.length} file(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] disabled:opacity-50 hover:bg-lily hover:text-white cursor-pointer"
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