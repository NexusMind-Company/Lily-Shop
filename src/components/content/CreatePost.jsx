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
  ChevronRight,
  ChevronLeft,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import MediaUploader from "./MediaUploader";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import ContentPreview from "./ContentPreview";
import CameraModal from "./CameraModal";

const MAX_MEDIA = 5;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "video/mp4",
  "video/mov",
];

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { isAuthenticated } = useSelector((state) => state.auth);
  const productState = useSelector((state) => state.productContent);
  const funState = useSelector((state) => state.funContent);

  // Local State
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  // Derived State
  const reduxLoading = productState.loading || funState.loading;
  const loading = localLoading || reduxLoading;
  const success = productState.success || funState.success;

  // 1. Auth Check
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // 2. Success Handler & Redirect
  useEffect(() => {
    if (success) {
      setSuccessMessage("Post created successfully!");
      setErrorMessage("");
      const timer = setTimeout(() => {
        dispatch(resetProductContent());
        dispatch(resetFunContent());
        navigate("/feed");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  // 3. Error Handler
  useEffect(() => {
    const error = productState.error || funState.error;
    if (error) {
      // API errors can be strings or objects
      const detail = error.detail || "Failed to publish content.";
      const mediaError = Array.isArray(error.media)
        ? error.media.join(" ")
        : error.media;

      setErrorMessage(mediaError || detail);
      setLocalLoading(false);
    }
  }, [productState.error, funState.error]);

  // 4. Cleanup Object URLs
  useEffect(() => {
    return () => {
      formData.media.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // -----------------------------------------------------
  // HELPERS: Media & Validation
  // -----------------------------------------------------
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

  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && formData.media.length === 0) {
      newErrors.media = "Add at least one photo or video";
    }

    if (step === 2 && formData.postType === "product") {
      if (!formData.name?.trim()) newErrors.name = "Product name required";
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((p) => p + 1);
  };

  const prevStep = () => setStep((p) => p - 1);

  // -----------------------------------------------------
  // MAIN ACTION: Publish
  // -----------------------------------------------------
  const handlePublish = async () => {
    if (!validateStep()) return;

    setLocalLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const submitFormData = new FormData();

      if (formData.postType === "product") {
        // --- PRODUCT PAYLOAD ---
        submitFormData.append(
          "name",
          formData.name?.trim() || "Untitled Product",
        );
        submitFormData.append("caption", formData.caption?.trim() || "");
        submitFormData.append(
          "price",
          formData.price ? Number(formData.price) : 0,
        );
        submitFormData.append("in_stock", formData.in_stock);
        submitFormData.append(
          "quantity_available",
          formData.quantity_available ? Number(formData.quantity_available) : 0,
        );
        submitFormData.append(
          "delivery_info",
          formData.delivery_info?.trim() || "",
        );
        submitFormData.append("promotable", formData.promotable);
        submitFormData.append("hashtags", formData.hashtags?.trim() || "");

        // Append media
        formData.media.forEach((item) => {
          if (item.file) submitFormData.append("media", item.file);
        });

        await dispatch(createProductContent(submitFormData));
      } else {
        // --- FUN PAYLOAD ---
        submitFormData.append("post_type", "FUN");
        submitFormData.append("caption", formData.caption?.trim() || "");
        submitFormData.append("hashtags", formData.hashtags?.trim() || "");
        submitFormData.append("location", formData.location?.trim() || "");

        // Append media
        formData.media.forEach((item) => {
          if (item.file) submitFormData.append("media", item.file);
        });

        await dispatch(createFunContent(submitFormData));
      }
    } catch (err) {
      console.error("PUBLISH ERROR:", err);
      setErrorMessage("An unexpected error occurred.");
      setLocalLoading(false);
    }
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="w-full flex flex-col min-h-screen bg-white text-gray-900">
      <div className="w-full relative flex-1">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="text-gray-600 hover:text-black transition"
            >
              <ChevronLeft size={30} />
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-black transition"
            >
              <ChevronLeft size={30} />
            </button>
          )}
          <h2 className="text-lg font-semibold text-center w-full text-gray-900">
            {step === 1 && "Create Post"}
            {step === 2 && "Add Details"}
            {step === 3 && "Preview"}
          </h2>
          <div className="w-[30px]" /> {/* Spacer for alignment */}
        </div>

        {/* STEP 1: UPLOAD MEDIA */}
        {step === 1 && (
          <div className="p-4 space-y-8">
            <div className="flex justify-center">
              <button
                onClick={() => setCameraOpen(true)}
                className="flex flex-col items-center justify-center gap-2 px-10 py-8 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition w-full border-2 border-dashed border-gray-300"
              >
                <Camera className="w-10 h-10" />
                <span>Open Camera</span>
              </button>
            </div>

            <MediaUploader
              media={formData.media}
              setMedia={handleMediaSelect}
              dragActive={dragActive}
              setDragActive={setDragActive}
            />

            {errors.media && (
              <p className="text-red-500 text-sm text-center">{errors.media}</p>
            )}

            <button
              onClick={nextStep}
              disabled={formData.media.length === 0}
              className={`w-full py-3 rounded-full font-semibold mt-4 transition ${
                formData.media.length > 0
                  ? "bg-lily hover:bg-darklily text-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2: DETAILS FORM */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <PostTypeSelector
              postType={formData.postType}
              setPostType={(type) =>
                setFormData((prev) => ({ ...prev, postType: type }))
              }
            />

            {/* Product Specific Form */}
            {formData.postType === "product" && (
              <ProductDetailsForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}

            {/* Fun / Generic Form Fields */}
            {formData.postType !== "product" && (
              <div className="space-y-4">
                <textarea
                  placeholder="Write a caption..."
                  className="w-full p-3 border rounded-lg"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-3 border rounded-lg"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="#Hashtags"
                  className="w-full p-3 border rounded-lg"
                  value={formData.hashtags}
                  onChange={(e) =>
                    setFormData({ ...formData, hashtags: e.target.value })
                  }
                />
              </div>
            )}

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-full bg-lily text-white hover:bg-darklily font-semibold mt-4 flex items-center justify-center gap-2"
            >
              Preview <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 3: PREVIEW & CONFIRM */}
        {step === 3 && (
          <div className="p-4 space-y-4">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                <p>{successMessage}</p>
              </div>
            )}

            <ContentPreview
              formData={formData}
              onPublish={handlePublish}
              setFormData={setFormData}
              onBack={prevStep}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* CAMERA MODAL */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(data) => {
          setFormData((prev) => {
            const exists = prev.media.some((m) => m.url === data.url);
            if (exists) return prev;
            return { ...prev, media: [...prev.media, data] };
          });
          setCameraOpen(false);
        }}
      />
    </div>
  );
};

export default CreatePost;
