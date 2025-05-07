/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createShop } from "../../redux/createShopSlice";
import { useDispatch } from "react-redux";
import useFormValidation from "../../hooks/useFormValidation";
import ErrorDisplay from "../common/ErrorDisplay";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const validateFile = (file) => {
  if (!file) return "No file selected.";

  const fileExtension = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return "Only JPEG and PNG formats are allowed.";
  }

  if (!file.type || !ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG and PNG formats are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
};

const INITIAL_FORM_STATE = {
  name: "",
  address: "",
  category: "",
  description: "",
};

const VALIDATION_RULES = {
  name: { required: true, requiredMessage: "Shop name is required." },
  address: { required: true, requiredMessage: "Shop address is required." },
  category: { required: true, requiredMessage: "Shop category is required." },
  description: {
    required: true,
    requiredMessage: "Shop description is required.",
  },
};

const CreateShop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageInputChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      setImageError(null);
      setSelectedFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);

      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setImageError(validationError);
        if (imageInputRef.current) imageInputRef.current.value = "";
        return;
      }

      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.shopImage;
        return newErrors;
      });
    },
    [imagePreview, setFieldErrors]
  );

  const actualSubmitLogic = async (validatedTextValues) => {
    if (!selectedFile) {
      setImageError("Please upload a shop image.");
      setFieldErrors((prev) => ({
        ...prev,
        shopImage: "Shop image is required.",
      }));
      setSubmissionStatus("idle");
      return;
    }
    if (imageError) {
      setFieldErrors((prev) => ({ ...prev, shopImage: imageError }));
      setSubmissionStatus("idle");
      return;
    }

    setSubmissionStatus("loading");
    setSubmissionError(null);
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("name", validatedTextValues.name.trim());
    formData.append("address", validatedTextValues.address.trim());
    formData.append("category", validatedTextValues.category.trim());
    formData.append("description", validatedTextValues.description.trim());
    formData.append("image", selectedFile);

    try {
      await dispatch(createShop(formData)).unwrap();
      setSuccessMsg("Shop created successfully! Redirecting...");
      setSubmissionStatus("succeeded");
      resetForm();
      setSelectedFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setImageError(null);
      setFieldErrors({});

      setTimeout(() => {
        setSuccessMsg("");
        navigate("/myShop");
      }, 3000);
    } catch (err) {
      console.error("Failed to create shop:", err);
      let errorMsg = "Failed to create shop. ";
      if (err && err.message && err.message.includes("timeout")) {
        errorMsg += "Request timed out. Please try again.";
      } else if (err && err.message && err.message.includes("Network Error")) {
        errorMsg += "Network error. Please check your connection.";
      } else if (err && typeof err === "object" && err.status === 401) {
        errorMsg = "Please log in to create a shop.";
      } else if (err && typeof err === "object" && err.status === 413) {
        errorMsg =
          "The uploaded file is too large. Please upload a smaller file.";
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

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
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
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shop Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input h-[46px] w-full ${
              fieldErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={fieldErrors.name ? "true" : "false"}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shop Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input h-[46px] w-full ${
              fieldErrors.address ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={fieldErrors.address ? "true" : "false"}
          />
          {fieldErrors.address && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shop Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input h-[46px] w-full ${
              fieldErrors.category ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={fieldErrors.category ? "true" : "false"}
          />
          {fieldErrors.category && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shop Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input w-full ${
              fieldErrors.description ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={fieldErrors.description ? "true" : "false"}
          ></textarea>
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Image
          </label>
          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
              imageError || fieldErrors.shopImage
                ? "border-red-400"
                : "border-gray-300"
            } border-dashed rounded-md cursor-pointer hover:border-lily transition-colors`}
            onClick={() => imageInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const mockEvent = { target: { files: e.dataTransfer.files } };
                handleImageInputChange(mockEvent);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Shop Preview"
                  className="mx-auto h-24 w-24 object-cover rounded-md"
                />
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <div className="flex text-sm text-gray-600">
                <span className="relative rounded-md font-medium text-lily hover:text-lily-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-lily-dark">
                  <span>{selectedFile ? "Change file" : "Upload a file"}</span>
                  <input
                    type="file"
                    id="shopImage"
                    name="shopImage"
                    ref={imageInputRef}
                    onChange={handleImageInputChange}
                    accept={ALLOWED_EXTENSIONS.join(",")}
                    className="sr-only"
                  />
                </span>
                {!selectedFile && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          </div>

          {selectedFile && !imageError && (
            <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
              <span className="truncate max-w-[calc(100%-4rem)]">
                Selected: {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  setImageError(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.shopImage;
                    return newErrors;
                  });
                }}
                className="ml-2 text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {imageError && (
            <p className="text-red-500 text-xs mt-1">{imageError}</p>
          )}
          {!imageError && fieldErrors.shopImage && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.shopImage}</p>
          )}
        </div>

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] disabled:opacity-50 hover:bg-lily hover:text-white cursor-pointer"
          disabled={isSubmitting || submissionStatus === "loading"}
        >
          {submissionStatus === "loading" ? "Creating Shop..." : "Create Shop"}
        </button>
      </form>
    </section>
  );
};

export default CreateShop;
