/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateShop } from "../../redux/deleteShopSlice";
import { fetchShopById, clearSelectedShopState } from "../../redux/shopSlice";
import useFormValidation from "../../hooks/useFormValidation";
import ErrorDisplay from "../common/ErrorDisplay";
import LoaderSd from "../loaders/loaderSd";

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
  name: {
    /* minLength: 3, minLengthMessage: "Name is too short" */
  },
  address: {
    /* minLength: 5 */
  },
  category: {},
  description: {},
};

const EditShop = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const {
    selectedShop: existingShop,
    status: fetchStatus,
    error: fetchError,
  } = useSelector((state) => state.shops);

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
  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (shop_id) {
      dispatch(fetchShopById(shop_id));
    }
    return () => {
      dispatch(clearSelectedShopState());
    };
  }, [shop_id, dispatch]);

  useEffect(() => {
    if (existingShop && fetchStatus === "succeeded") {
      resetForm({
        name: existingShop.name || "",
        address: existingShop.address || "",
        category: existingShop.category || "",
        description: existingShop.description || "",
      });
      setCurrentImagePreview(existingShop.image_url);
      setSelectedFile(null);
      setImageError(null);
    }
  }, [existingShop, fetchStatus, resetForm]);

  useEffect(() => {
    let objectUrl = null;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setCurrentImagePreview(objectUrl);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const handleImageInputChange = useCallback(
    (e) => {
    const file = e.target.files[0];
      setImageError(null);
      setSelectedFile(null);

      if (!file) {
        setSelectedFile(null);
        setCurrentImagePreview(existingShop?.image_url || null);
        return;
      }

    const validationError = validateFile(file);
    if (validationError) {
        setImageError(validationError);
        setSelectedFile(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        setCurrentImagePreview(existingShop?.image_url || null);
      return;
    }
      setSelectedFile(file);
      setFieldErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs.shopImage;
        return newErrs;
      });
    },
    [existingShop, setFieldErrors]
  );

  const actualSubmitLogic = async (formValues) => {
    console.log("Form submitted with:", formValues, "and image:", selectedFile);
    setSubmissionStatus("loading");
    setSubmissionError(null);
    setSuccessMsg("");

    const formData = new FormData();

    formData.append("name", formValues.name);
    formData.append("address", formValues.address);
    formData.append("category", formValues.category);
    formData.append("description", formValues.description);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    let hasChanges = selectedFile !== null;
    if (!hasChanges && existingShop) {
      for (const key in formValues) {
        if (formValues[key] !== (existingShop[key] || "")) {
          hasChanges = true;
          break;
        }
      }
    }

    if (!hasChanges) {
      setSubmissionError("No changes detected to update.");
      setSubmissionStatus("failed");
      return;
    }

    try {
      const result = await dispatch(
        updateShop({ id: shop_id, updatedData: formData })
      ).unwrap();
      setSuccessMsg("Shop updated successfully! Redirecting to your shop...");
      setSubmissionStatus("succeeded");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/myShop");
      }, 2000);
    } catch (error) {
      console.error("Error updating shop:", error);
      let errorMsg = "Failed to update shop. ";
      if (error && error.message && error.message.includes("timeout")) {
        errorMsg += "Request timed out. Please try again.";
      } else if (
        error &&
        error.message &&
        error.message.includes("Network Error")
      ) {
        errorMsg += "Network error. Please check your connection.";
      } else if (error && typeof error === "object" && error.status === 401) {
        errorMsg = "Authentication error. Please log in again.";
      } else if (error && typeof error === "object" && error.status === 413) {
        errorMsg = "The uploaded file is too large.";
      } else if (
        error &&
        typeof error === "object" &&
        error.payload &&
        typeof error.payload === "string"
      ) {
        errorMsg = error.payload;
      } else if (typeof error === "string") {
        errorMsg = error;
      } else {
        errorMsg += "Please try again later.";
      }
      setSubmissionError(errorMsg);
      setSubmissionStatus("failed");
    }
  };

  if (fetchStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <LoaderSd />
      </div>
    );
  }

  if (fetchStatus === "failed") {
    if (!existingShop || (existingShop && existingShop.id !== shop_id)) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ErrorDisplay
            message={fetchError || "Failed to load shop details for this ID."}
            center={true}
          />
        </div>
      );
    }
  }

  if (fetchStatus === 'succeeded' && (!existingShop || (existingShop && existingShop.id !== shop_id))) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <ErrorDisplay message={`Shop with ID ${shop_id} not found.`} center={true} />
      </div>
    );
  }

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Edit <span className="text-lily">Shop</span> Details
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

      {existingShop &&
        existingShop.id === shop_id &&
        fetchStatus === "succeeded" && (
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
              />
              {fieldErrors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.address}
                </p>
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
              />
              {fieldErrors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.category}
                </p>
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
              >
                <div className="space-y-1 text-center">
                  {currentImagePreview ? (
                    <img
                      src={currentImagePreview}
                      alt="Shop Preview"
                      className="mx-auto h-24 w-24 object-cover rounded-md"
                    />
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
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
                    <span className="relative rounded-md font-medium text-lily hover:text-lily-dark">
                      <span>
                        {selectedFile
                          ? "Change file"
                          : currentImagePreview
                          ? "Change file"
                          : "Upload a file"}
                      </span>
          <input
                        type="file"
                        id="shopImageEdit"
                        name="shopImageEdit"
            ref={imageInputRef}
                        onChange={handleImageInputChange}
                        accept={ALLOWED_EXTENSIONS.join(",")}
                        className="sr-only"
                      />
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                  </p>
                </div>
              </div>
              {selectedFile && !imageError && (
                <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
                  <span className="truncate max-w-[calc(100%-4rem)]">
                    New: {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImageError(null);
                      setCurrentImagePreview(existingShop?.image_url || null);
                      if (imageInputRef.current)
                        imageInputRef.current.value = "";
                      setFieldErrors((prev) => ({
                        ...prev,
                        shopImage: undefined,
                      }));
                    }}
                    className="ml-2 text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
                  >
                    Cancel Change
                  </button>
                </div>
              )}
              {imageError && (
                <p className="text-red-500 text-xs mt-1">{imageError}</p>
              )}
              {!imageError && fieldErrors.shopImage && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.shopImage}
                </p>
          )}
        </div>

          <button
            type="submit"
              disabled={isSubmitting || submissionStatus === "loading"}
              className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] disabled:opacity-50 hover:bg-lily hover:text-white cursor-pointer"
          >
              {submissionStatus === "loading"
                ? "Updating Shop..."
                : "Save Changes"}
          </button>
          </form>
        )}

      {!shop_id && !fetchStatus && (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <p>No shop ID provided.</p>
        </div>
      )}
    </section>
  );
};

export default EditShop;
