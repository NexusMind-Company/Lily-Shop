import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  createProductContent,
  resetContentState as resetProductContent,
} from "../../redux/productContentSlice";
import {
  createFunContent,
  resetContentState as resetFunContent,
} from "../../redux/funContentSlice";
import {
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Image as ImageIcon,
  Hash,
  MapPin,
  DollarSign,
  Package,
} from "lucide-react";

const MAX_MEDIA = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
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
  const [dragActive, setDragActive] = useState(false);

  const isLoading = productState.loading || funState.loading;
  const success = productState.success || funState.success;
  const apiError = productState.error || funState.error;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(resetProductContent());
        dispatch(resetFunContent());
        navigate("/feed");
      }, 2000);
    }
  }, [success, navigate, dispatch]);

  // Media Handling
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, MP4, MOV files allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File must be under ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleMediaSelect = (files) => {
    const fileArray = Array.from(files);
    const newMedia = [];
    const newErrors = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (formData.media.length + newMedia.length >= MAX_MEDIA) {
        newErrors.push(`Maximum ${MAX_MEDIA} files`);
        return;
      }

      newMedia.push({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      });
    });

    if (newErrors.length) {
      setErrors((prev) => ({ ...prev, media: newErrors.join(". ") }));
    } else {
      setErrors((prev) => ({ ...prev, media: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newMedia].slice(0, MAX_MEDIA),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.length) {
      handleMediaSelect(e.dataTransfer.files);
    }
  };

  const removeMedia = (index) => {
    const item = formData.media[index];
    if (item.url) URL.revokeObjectURL(item.url);
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const reorderMedia = (fromIndex, toIndex) => {
    const newMedia = [...formData.media];
    const [removed] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, removed);
    setFormData((prev) => ({ ...prev, media: newMedia }));
  };

  // Form Validation
  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && formData.media.length === 0) {
      newErrors.media = "Add at least one photo or video";
    }

    if (step === 3 && formData.postType === "product") {
      if (!formData.name.trim()) newErrors.name = "Product name required";
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Publish
  const handlePublish = async () => {
    if (!validateStep()) return;

    const submitFormData = new FormData();

    if (formData.postType === "product") {
      submitFormData.append("name", formData.name.trim());
      submitFormData.append("caption", formData.caption.trim());
      submitFormData.append("price", Number(formData.price));
      submitFormData.append("in_stock", formData.in_stock);
      submitFormData.append("quantity_available", Number(formData.quantity_available) || 0);
      submitFormData.append("delivery_info", formData.delivery_info.trim());
      submitFormData.append("promotable", formData.promotable);
      submitFormData.append("hashtags", formData.hashtags.trim());

      formData.media.forEach((item) => {
        if (item.file) submitFormData.append("media", item.file);
      });

      await dispatch(createProductContent(submitFormData));
    } else {
      submitFormData.append("post_type", "FUN");
      submitFormData.append("caption", formData.caption.trim());
      submitFormData.append("hashtags", formData.hashtags.trim());
      submitFormData.append("location", formData.location.trim());

      formData.media.forEach((item) => {
        if (item.file) submitFormData.append("media", item.file);
      });

      await dispatch(createFunContent(submitFormData));
    }
  };

  const nextStep = () => {
    if (validateStep()) setStep((p) => p + 1);
  };

  const prevStep = () => setStep((p) => p - 1);

  useEffect(() => {
    return () => {
      formData.media.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl z-10">
          <button
            onClick={() => step > 1 ? prevStep() : navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 mx-4">
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? "w-8 bg-lily" : s < step ? "w-4 bg-lily/50" : "w-4 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {step === 1 && "Add Media"}
              {step === 2 && "Choose Type"}
              {step === 3 && "Add Details"}
              {step === 4 && "Preview & Post"}
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Posted!</p>
                <p className="text-sm text-green-700">Redirecting to feed...</p>
              </div>
            </motion.div>
          )}

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Failed to post</p>
                <p className="text-sm text-red-700">
                  {typeof apiError === "string" ? apiError : apiError?.detail || "Try again"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Media Upload */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive
                      ? "border-lily bg-lily/5 scale-105"
                      : "border-gray-300 hover:border-lily/50"
                  }`}
                >
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drag & drop media here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse (up to {MAX_MEDIA} files)
                  </p>
                  <label className="inline-block">
                    <span className="px-6 py-3 bg-lily text-white rounded-full font-semibold cursor-pointer hover:bg-darklily transition">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept={ALLOWED_TYPES.join(",")}
                      multiple
                      onChange={(e) => handleMediaSelect(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Media Grid */}
                {formData.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.media.map((item, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("index", index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData("index"));
                          reorderMedia(fromIndex, index);
                        }}
                        className="relative aspect-square rounded-xl overflow-hidden group cursor-move"
                      >
                        {item.type === "video" ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.media && (
                  <p className="text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.media}
                  </p>
                )}

                <button
                  onClick={nextStep}
                  disabled={formData.media.length === 0}
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition ${
                    formData.media.length > 0
                      ? "bg-lily text-white hover:bg-darklily"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Post Type */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  What are you posting?
                </h2>

                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, postType: "fun" }));
                    nextStep();
                  }}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-lily hover:bg-lily/5 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-lg">Fun Post</h3>
                      <p className="text-sm text-gray-600">Share moments & experiences</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-lily" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, postType: "product" }));
                    nextStep();
                  }}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-lily hover:bg-lily/5 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-lg">Product Post</h3>
                      <p className="text-sm text-gray-600">Sell with price & details</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-lily" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* STEP 3: Details Form */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {formData.postType === "product" ? "Product Details" : "Post Details"}
                </h2>

                {/* Product Fields */}
                {formData.postType === "product" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-lily" />
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition"
                        placeholder="e.g., Summer Dress"
                        maxLength={50}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-lily" />
                          Price (₦) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition"
                          placeholder="0"
                          min="0"
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Quantity</label>
                        <input
                          type="number"
                          value={formData.quantity_available}
                          onChange={(e) => setFormData((p) => ({ ...p, quantity_available: e.target.value }))}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">In Stock?</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="inStock"
                            checked={formData.in_stock === true}
                            onChange={() => setFormData((p) => ({ ...p, in_stock: true }))}
                            className="w-5 h-5 text-lily"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="inStock"
                            checked={formData.in_stock === false}
                            onChange={() => setFormData((p) => ({ ...p, in_stock: false }))}
                            className="w-5 h-5 text-lily"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Delivery Info</label>
                      <textarea
                        value={formData.delivery_info}
                        onChange={(e) => setFormData((p) => ({ ...p, delivery_info: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition resize-none"
                        rows="3"
                        placeholder="How will this be delivered? e.g., Lagos delivery ₦2000"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Caption</label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData((p) => ({ ...p, caption: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition resize-none"
                    rows="4"
                    placeholder="Write a caption..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.caption.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-lily" />
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData((p) => ({ ...p, hashtags: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition"
                    placeholder="#fashion #style #trending"
                  />
                </div>

                {formData.postType === "fun" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-lily" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-lily focus:outline-none transition"
                      placeholder="Lagos, Nigeria"
                    />
                  </div>
                )}

                <button
                  onClick={nextStep}
                  className="w-full py-4 bg-lily text-white rounded-full font-semibold hover:bg-darklily transition flex items-center justify-center gap-2"
                >
                  Preview <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 4: Preview & Publish */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center">Preview Your Post</h2>

                {/* Feed-Style Preview */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-200">
                  {/* Media Preview */}
                  {formData.media.length > 0 && (
                    <div className="mb-4">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                        {formData.media[0].type === "video" ? (
                          <video
                            src={formData.media[0].url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={formData.media[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        {formData.media.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            +{formData.media.length - 1} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post Info */}
                  <div className="space-y-2">
                    {formData.postType === "product" && (
                      <>
                        <h3 className="font-bold text-lg">{formData.name || "Product Name"}</h3>
                        <p className="text-2xl font-bold text-lily">
                          ₦{Number(formData.price || 0).toLocaleString()}
                        </p>
                      </>
                    )}

                    {formData.caption && (
                      <p className="text-gray-700 text-sm">{formData.caption}</p>
                    )}

                    {formData.hashtags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.hashtags.split(" ").filter(Boolean).map((tag, i) => (
                          <span key={i} className="text-lily text-sm font-medium">
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {formData.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Publish Button */}
                <button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-lily to-darklily text-white hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Publish Post
                    </>
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;