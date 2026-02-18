import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createShop, resetCreateShopState } from "../../redux/createShopSlice";
import { FiUpload, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const CreateShop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const {
    status,
    error: apiError,
    success,
  } = useSelector((state) => state.createShop);

  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    category: "",
    description: "",
    phone: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Handle success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(resetCreateShopState());
        navigate("/myShop");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Shop name is required";
        if (value.length < 3) return "Shop name must be at least 3 characters";
        if (value.length > 50) return "Shop name must not exceed 50 characters";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.length < 10) return "Please provide a complete address";
        return "";
      case "category":
        if (!value.trim()) return "Category is required";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length < 20)
          return "Description must be at least 20 characters";
        if (value.length > 500)
          return "Description must not exceed 500 characters";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^(\+234|0)[789]\d{9}$/;
        if (!phoneRegex.test(value)) {
          return "Please enter a valid Nigerian phone number";
        }
        return "";
      default:
        return "";
    }
  };

  const validateImage = (file) => {
    if (!file) return "Shop image is required";

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG and PNG images are allowed";
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Image size must not exceed ${MAX_FILE_SIZE_MB}MB`;
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageSelect = (file) => {
    if (!file) return;

    // Clean up previous preview
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const error = validateImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
    setTouched((prev) => ({ ...prev, image: true }));
  };

  const handleImageChange = (e) => {
    handleImageSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleImageSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    const imageError = validateImage(imageFile);
    if (imageError) newErrors.image = imageError;

    setErrors(newErrors);
    setTouched({
      name: true,
      address: true,
      category: true,
      description: true,
      phone: true,
      image: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("address", formData.address.trim());
    submitData.append("category", formData.category.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("phone", formData.phone.trim());
    submitData.append("image", imageFile);

    await dispatch(createShop(submitData));
  };

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto">
      {/* Header */}
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="w-full p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fade-in">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={20} />
            <div>
              <p className="font-medium">Shop created successfully!</p>
              <p className="text-sm">Redirecting to your shops...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && !success && (
        <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-medium">Failed to create shop</p>
              <p className="text-sm">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Shop Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shop Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`input h-12 w-full rounded-lg px-4 transition-colors ${
              errors.name && touched.name
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-lily"
            }`}
            placeholder="Enter shop name"
          />
          {errors.name && touched.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Shop Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`input h-12 w-full rounded-lg px-4 transition-colors ${
              errors.category && touched.category
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-lily"
            }`}
            placeholder="e.g., Electronics, Fashion, Food"
          />
          {errors.category && touched.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Shop Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`input h-12 w-full rounded-lg px-4 transition-colors ${
              errors.address && touched.address
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-lily"
            }`}
            placeholder="Enter complete shop address"
          />
          {errors.address && touched.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number *
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`input h-12 w-full rounded-lg px-4 transition-colors ${
              errors.phone && touched.phone
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-lily"
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && touched.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`input w-full rounded-lg px-4 py-3 transition-colors ${
              errors.description && touched.description
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-lily"
            }`}
            placeholder="Describe your shop and what you sell..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && touched.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <p className="text-gray-500 text-xs">
                {formData.description.length}/500 characters
              </p>
            )}
          </div>
        </div>

        {/* Shop Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Image *
          </label>
          {!imagePreview ? (
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                errors.image && touched.image
                  ? "border-red-400 hover:border-red-500"
                  : "border-gray-300 hover:border-lily"
              }`}
              onClick={() => imageInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-1 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative rounded-md font-medium text-lily">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative mt-1 rounded-lg border-2 border-gray-300 overflow-hidden">
              <img
                src={imagePreview}
                alt="Shop Preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                disabled={isLoading}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiX size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm truncate">
                {imageFile?.name}
              </div>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleImageChange}
            disabled={isLoading}
            className="hidden"
          />

          {errors.image && touched.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || hasErrors}
          className={`h-12 rounded-full font-bold text-white transition-all ${
            isLoading || hasErrors
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily hover:shadow-lg transform hover:scale-[1.02]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Shop...
            </span>
          ) : (
            "CREATE SHOP"
          )}
        </button>

        {/* Back Link */}
        <Link
          to="/myShop"
          className="text-center text-sm text-gray-600 hover:text-lily transition-colors"
        >
          ← Back to My Shops
        </Link>
      </form>
    </section>
  );
};

export default CreateShop;
