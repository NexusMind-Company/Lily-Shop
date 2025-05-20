/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProduct,
  resetAddProductState,
} from "../../redux/addProductSlice";
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

const INITIAL_FORM_STATE = { name: "", price: "" };
const VALIDATION_RULES = {
  name: {
    /* Potentially add required: true if name must always be sent */
  },
  price: {
    pattern: /^\d*\.?\d{0,2}$/, // Allows empty, or number with up to 2 decimal places
    patternMessage: "Price must be a valid number (e.g., 10.99) if entered.",
  },
};

const EditProducts = () => {
  const { product_id } = useParams();
  const location = useLocation();
  const initialProductData = location.state?.productToEdit;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const {
    status: submissionStatusRB,
    error: submissionErrorRB,
    success: submissionSuccessRB,
  } = useSelector((state) => state.addProduct);

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

  const [originalProduct, setOriginalProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);

  const [uiSubmissionStatus, setUiSubmissionStatus] = useState("idle");
  const [uiSubmissionError, setUiSubmissionError] = useState(null);
  const [uiSuccessMsg, setUiSuccessMsg] = useState("");

  useEffect(() => {
    if (initialProductData) {
      resetForm({
        name: initialProductData.name || "",
        price: initialProductData.price ? String(initialProductData.price) : "",
      });
      setCurrentImagePreview(
        initialProductData.image_url || initialProductData.preview || null
      );
      setOriginalProduct(initialProductData);
      setSelectedFile(null);
      setImageError(null);
      setFieldErrors({});
    } else {
      setUiSubmissionError(
        "Product data not available for editing. Please go back and select a product."
      );
      setUiSubmissionStatus("failed");
    }
    dispatch(resetAddProductState());
  }, [initialProductData, resetForm, dispatch]);

  useEffect(() => {
    let objectUrl = null;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setCurrentImagePreview(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (submissionSuccessRB) {
      setUiSuccessMsg("Product updated successfully! Redirecting...");
      setUiSubmissionStatus("succeeded");
      setTimeout(() => {
        dispatch(resetAddProductState());
        navigate("/myShop");
        setUiSuccessMsg("");
      }, 2000);
    }
  }, [submissionSuccessRB, dispatch, navigate]);

  const handleImageInputChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      setImageError(null);
      setSelectedFile(null);

      if (!file) {
        setCurrentImagePreview(
          originalProduct?.image_url || originalProduct?.preview || null
        );
        return;
      }
      const validationError = validateFile(file);
      if (validationError) {
        setImageError(validationError);
        if (imageInputRef.current) imageInputRef.current.value = "";
        setCurrentImagePreview(
          originalProduct?.image_url || originalProduct?.preview || null
        );
        return;
      }
      setSelectedFile(file);
      setFieldErrors((prev) => ({ ...prev, productImage: undefined }));
    },
    [originalProduct, setFieldErrors]
  );

  const actualSubmitLogic = async (formValues) => {
    if (!product_id || !originalProduct) {
      setUiSubmissionError(
        "Cannot update product: Missing ID or initial data."
      );
      setUiSubmissionStatus("failed");
      return;
    }

    let priceToSubmit;
    let priceFieldHasError = false;

    if (formValues.price.trim() !== "") {
      const parsedPrice = parseFloat(formValues.price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setFieldErrors((prev) => ({
      ...prev,
          price: "If provided, price must be a positive number.",
        }));
        priceFieldHasError = true;
      } else {
        priceToSubmit = parsedPrice;
      }
    } else {
      priceToSubmit = "";
    }

    if (priceFieldHasError) return;

    setUiSubmissionStatus("loading");
    setUiSubmissionError(null);
    setUiSuccessMsg("");

    const formData = new FormData();
    let hasChanges = false;

    if (formValues.name !== originalProduct.name) {
      formData.append("name", formValues.name);
      hasChanges = true;
    }

    const originalNumericPrice =
      originalProduct.price !== null && originalProduct.price !== undefined
        ? parseFloat(originalProduct.price)
        : null;

    if (formValues.price.trim() === "") {
      if (originalNumericPrice !== null && originalNumericPrice !== 0) {
        formData.append("price", "");
        hasChanges = true;
      }
    } else if (priceToSubmit !== originalNumericPrice) {
      formData.append("price", priceToSubmit);
      hasChanges = true;
    }

    if (selectedFile) {
      formData.append("image", selectedFile);
      hasChanges = true;
    }

    if (!hasChanges) {
      setUiSubmissionError("No changes detected to update.");
      setUiSubmissionStatus("failed");
      return;
    }

    try {
      await dispatch(updateProduct({ id: product_id, formData })).unwrap();
    } catch (err) {
      console.error("Failed to update product:", err);
      let errorMsg =
        err &&
        typeof err === "object" &&
        err.payload &&
        typeof err.payload.message === "string"
          ? err.payload.message
          : typeof err === "string"
          ? err
          : "Failed to update product. Please try again.";
      setUiSubmissionError(errorMsg);
      setUiSubmissionStatus("failed");
    }
  };

  if (!initialProductData && uiSubmissionStatus !== "failed") {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <ErrorDisplay
          message="Product data not provided or invalid navigation."
          center={true}
        />
      </div>
    );
  }

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Edit <span className="text-lily">Product</span>
          </h1>
        </div>
      </div>

      {uiSubmissionStatus === "failed" && uiSubmissionError && (
        <div className="w-full my-3">
          <ErrorDisplay message={uiSubmissionError} />
        </div>
      )}
      {uiSubmissionStatus === "succeeded" && uiSuccessMsg && (
        <div className="w-full my-3 p-3 text-green-700 bg-green-100 rounded-md border border-green-300 text-center">
          {uiSuccessMsg}
        </div>
      )}
      {submissionStatusRB === "loading" && uiSubmissionStatus !== "loading" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Processing...</span>
        </div>
      )}

      {initialProductData && (
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
              Product Name
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
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (₦)
            </label>
          <input
            type="text"
              id="price"
              name="price"
              value={values.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 1500.50"
              className={`input h-[46px] w-full ${
                fieldErrors.price ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.price && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
          )}
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                imageError || fieldErrors.productImage
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
                {currentImagePreview ? (
                  <img
                    src={currentImagePreview}
                    alt="Product Preview"
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
                  <span className="relative rounded-md font-medium text-lily hover:text-lily-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-lily-dark">
                    <span>
                      {selectedFile
                        ? "Change file"
                        : currentImagePreview
                        ? "Change file"
                        : "Upload an image"}
                    </span>
            <input
              type="file"
                      id={`product_image_edit_${product_id}`}
                      name="productImageEdit"
                      ref={imageInputRef}
                      onChange={handleImageInputChange}
                      accept={ALLOWED_EXTENSIONS.join(",")}
                      className="sr-only"
                    />
                  </span>
                  {!selectedFile && !currentImagePreview && (
                    <p className="pl-1">or drag and drop</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </div>
            {selectedFile && !imageError && (
              <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
                <span className="truncate max-w-[calc(100%-8rem)]">
                  New: {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImageError(null);
                    setCurrentImagePreview(
                      originalProduct?.image_url ||
                        originalProduct?.preview ||
                        null
                    );
                    if (imageInputRef.current) imageInputRef.current.value = "";
                    setFieldErrors((prev) => ({
                      ...prev,
                      productImage: undefined,
                    }));
                  }}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0"
                >
                  Cancel Change
                </button>
          </div>
            )}
            {imageError && (
              <p className="text-red-500 text-xs mt-1">{imageError}</p>
            )}
            {!imageError && fieldErrors.productImage && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.productImage}
              </p>
          )}
        </div>

        <button
            type="submit"
            disabled={isSubmitting}
            className="bg-sun text-white px-4 py-2 rounded-md hover:bg-lily focus:outline-none focus:ring focus:border-lily"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
        </button>
      </form>
      )}
    </section>
  );
};

export default EditProducts;
