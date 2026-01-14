import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createProductContent,
  resetContentState as resetProductContent,
} from "../../redux/productContentSlice";
import {
  createFunContent,
  resetContentState as resetFunContent,
} from "../../redux/funContentSlice";
import {
  FiChevronLeft,
  FiCamera,
  FiImage,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";

const MAX_MEDIA = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mov"];

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const productState = useSelector((state) => state.productContent);
  const funState = useSelector((state) => state.funContent);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    postType: "",
    caption: "",
    media: [],
    name: "",
    price: "",
    in_stock: true,
    quantity_available: "",
    delivery_info: "",
    promotable: false,
    hashtags: "",
    location: "",
  });
  const [errors, setErrors] = useState({});

  const isLoading = productState.loading || funState.loading;
  const success = productState.success || funState.success;
  const apiError = productState.error || funState.error;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(resetProductContent());
        dispatch(resetFunContent());
        navigate("/");
      }, 1500);
    }
  }, [success, navigate, dispatch]);

  // ========================================
  // MEDIA HANDLING
  // ========================================
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG images and MP4, MOV videos are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = [];
    const newErrors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (formData.media.length + newMedia.length >= MAX_MEDIA) {
        newErrors.push(`Maximum ${MAX_MEDIA} files allowed`);
        return;
      }

      newMedia.push({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      });
    });

    if (newErrors.length > 0) {
      setErrors((prev) => ({ ...prev, media: newErrors.join(". ") }));
    } else {
      setErrors((prev) => ({ ...prev, media: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newMedia],
    }));
  };

  const removeMedia = (index) => {
    const item = formData.media[index];
    if (item.url) URL.revokeObjectURL(item.url);

    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      formData.media.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // ========================================
  // FORM VALIDATION
  // ========================================
  const validateForm = () => {
    const newErrors = {};

    if (formData.media.length === 0) {
      newErrors.media = "Please add at least one photo or video";
    }

    if (formData.postType === "product") {
      if (!formData.name.trim()) {
        newErrors.name = "Product name is required";
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // PUBLISH HANDLER
  // ========================================
  const handlePublish = async () => {
    if (!validateForm()) return;

    const submitFormData = new FormData();

    if (formData.postType === "product") {
      // Product creation
      submitFormData.append("name", formData.name.trim() || "Untitled Product");
      submitFormData.append("caption", formData.caption.trim() || "");
      submitFormData.append("price", Number(formData.price));
      submitFormData.append("in_stock", formData.in_stock);
      submitFormData.append("quantity_available", Number(formData.quantity_available) || 0);
      submitFormData.append("delivery_info", formData.delivery_info.trim() || "");
      submitFormData.append("promotable", formData.promotable);
      submitFormData.append("hashtags", formData.hashtags.trim() || "");

      formData.media.forEach((item) => {
        if (item.file) {
          submitFormData.append("media", item.file);
        }
      });

      await dispatch(createProductContent(submitFormData));
    } else {
      // Content creation
      submitFormData.append("post_type", "FUN");
      submitFormData.append("caption", formData.caption.trim() || "");
      submitFormData.append("hashtags", formData.hashtags.trim() || "");
      submitFormData.append("location", formData.location.trim() || "");

      formData.media.forEach((item) => {
        if (item.file) {
          submitFormData.append("media", item.file);
        }
      });

      await dispatch(createFunContent(submitFormData));
    }
  };

  // ========================================
  // STEP NAVIGATION
  // ========================================
  const nextStep = () => {
    if (step === 1 && formData.media.length === 0) {
      setErrors({ media: "Please add at least one photo or video" });
      return;
    }
    setStep((p) => p + 1);
  };

  const prevStep = () => setStep((p) => p - 1);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        {step > 1 ? (
          <button onClick={prevStep} className="text-gray-600 hover:text-black">
            <FiChevronLeft size={28} />
          </button>
        ) : (
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <FiChevronLeft size={28} />
          </button>
        )}

        <h2 className="text-lg font-semibold text-gray-900">
          {step === 1 && "Add Media"}
          {step === 2 && "Post Type"}
          {step === 3 && "Details"}
          {step === 4 && "Preview"}
        </h2>

        <div className="w-7" />
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-4 mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={20} />
            <div>
              <p className="font-medium">Published successfully!</p>
              <p className="text-sm">Redirecting to feed...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-medium">Failed to publish</p>
              <p className="text-sm">
                {typeof apiError === "string" ? apiError : apiError?.detail || "Please try again"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 1: Add Media */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Media Grid */}
            <div className="grid grid-cols-2 gap-3">
              {formData.media.map((item, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  {item.type === "video" ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}

              {/* Add More Button */}
              {formData.media.length < MAX_MEDIA && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lily transition-colors">
                  <FiImage className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Media</span>
                  <span className="text-xs text-gray-400 mt-1">{formData.media.length}/{MAX_MEDIA}</span>
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    multiple
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errors.media && (
              <p className="text-red-500 text-sm">{errors.media}</p>
            )}

            <button
              onClick={nextStep}
              disabled={formData.media.length === 0}
              className={`w-full py-3 rounded-full font-semibold transition ${
                formData.media.length > 0
                  ? "bg-lily hover:bg-darklily text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2: Post Type */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, postType: "fun" }));
                nextStep();
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-lily transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-lily rounded-full flex items-center justify-center">
                  <FiCamera className="text-white" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Fun Post</h3>
                  <p className="text-sm text-gray-600">Share moments, stories, or experiences</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, postType: "product" }));
                nextStep();
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-lily transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <FiPackage className="text-white" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Product Post</h3>
                  <p className="text-sm text-gray-600">Sell a product with price and details</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.postType === "product" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (₦) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Available</label>
                  <input
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData((p) => ({ ...p, quantity_available: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Info</label>
                  <textarea
                    value={formData.delivery_info}
                    onChange={(e) => setFormData((p) => ({ ...p, delivery_info: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    rows="2"
                    placeholder="How will this be delivered?"
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-sm font-medium mb-1">Caption</label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData((p) => ({ ...p, caption: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                rows="3"
                placeholder="Write a caption..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hashtags</label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) => setFormData((p) => ({ ...p, hashtags: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="#tag1 #tag2"
              />
            </div>

            <button
              onClick={handlePublish}
              disabled={isLoading}
              className={`w-full py-3 rounded-full font-semibold transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-lily hover:bg-darklily text-white"
              }`}
            >
              {isLoading ? "Publishing..." : "Publish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;