import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createContent, resetContentState } from "../../redux/contentSlice";
import { useNavigate } from "react-router-dom";

import MediaUploader from "./MediaUploader";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import LocationPicker from "./LocationPicker";
import ContentPreview from "./ContentPreview";
import CameraModal from "./CameraModal";
import MusicPicker from "./MusicPicker";
import { Camera, ChevronLeft } from "lucide-react";

const CreatePost = () => {
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error } = useSelector((state) => state.content);
  const [successMessage, setSuccessMessage] = useState("");

  // Unified form data
  const [formData, setFormData] = useState({
    caption: "",
    media: [],
    postType: "fun",
    productDetails: {
      productName: "",
      price: "",
      stock: "",
      colors: [],
      sizes: [],
      deliveryFee: "",
      description: "",
    },
    location: "",
    coordinates: null,
    music: null,
  });

  // Step navigation
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ✅ Handle Publish (Redux integrated)
  const handlePublish = () => {
    const data = new FormData();

    // Core fields
    data.append("name", formData.productDetails.productName || "Untitled");
    data.append("caption", formData.caption || "");
    data.append("price", formData.productDetails.price || 0);
    data.append("is_post", formData.postType === "fun");
    data.append("delivery_info", formData.productDetails.deliveryFee || "");
    data.append("in_stock", formData.productDetails.stock > 0);
    data.append("quantity_available", formData.productDetails.stock || 0);
    data.append("hashtags", "#default");
    data.append("promotable", false);

    // Media
    if (formData.media && formData.media.length > 0) {
      formData.media.forEach((fileObj) => {
        if (fileObj.file) {
          data.append("media", fileObj.file);
        }
      });
    }

    // Location
    if (formData.location) {
      data.append("location", formData.location);
    }

    // Music
    if (formData.music) {
      data.append("music", formData.music.name);
    }

    dispatch(createContent(data));
  };

  // ✅ Redirect on success
  useEffect(() => {
    if (success) {
      setSuccessMessage("Content published successfully!");
      setTimeout(() => {
        navigate("/"); // automatically go to feed
        dispatch(resetContentState());
      }, 2000);
    }
  }, [success, navigate, dispatch]);

  // Update media safely
  const updateMedia = (incoming) => {
    setFormData((prev) => {
      const prevMedia = prev.media || [];

      if (Array.isArray(incoming)) {
        return { ...prev, media: incoming };
      }

      const newItem = incoming;
      const exists = prevMedia.some((m) => m.url === newItem.url);
      if (exists) return prev;

      return { ...prev, media: [...prevMedia, newItem] };
    });
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white text-gray-900">
      <div className="w-full relative flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          {step > 1 ? (
            <button onClick={prevStep} className="text-gray-600 hover:text-black transition">
              <ChevronLeft size={30} />
            </button>
          ) : (
            <span>
              <ChevronLeft size={30} onClick={() => navigate(-1)} />
            </span>
          )}

          <h2 className="text-lg font-semibold text-center w-full text-gray-900">
            {step === 1 && "Create Post"}
            {step === 2 && "Add Details"}
            {step === 3 && "Preview"}
          </h2>

          <span></span>
        </div>

        {/* STEP 1: Upload Media */}
        {step === 1 && (
          <div className="p-4 space-y-8">
            <div className="flex justify-center">
              <button
                onClick={() => setCameraOpen(true)}
                className="flex flex-col items-center justify-center gap-2 px-35 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition">
                <Camera className="w-10 h-10" /> Open Camera
              </button>
            </div>

            <MediaUploader media={formData.media || []} setMedia={updateMedia} />

            <button
              onClick={nextStep}
              disabled={!formData.media || formData.media.length === 0}
              className={`w-full py-3 rounded-full font-semibold mt-4 transition ${
                formData.media && formData.media.length > 0
                  ? "bg-lime-500 hover:bg-lime-600 text-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2: Add Details */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <PostTypeSelector
              postType={formData.postType}
              setPostType={(type) => setFormData((prev) => ({ ...prev, postType: type }))}
            />

            {formData.postType === "product" && (
              <ProductDetailsForm
                formData={formData.productDetails}
                setFormData={(details) =>
                  setFormData((prev) => ({
                    ...prev,
                    productDetails: details,
                  }))
                }
              />
            )}

            <MusicPicker
              selectedMusic={formData.music}
              setSelectedMusic={(music) => setFormData((prev) => ({ ...prev, music }))}
            />

            <LocationPicker formData={formData} setFormData={setFormData} />

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-full bg-lily hover:bg-lily font-semibold mt-4">
              Continue to Preview
            </button>
          </div>
        )}

        {/* STEP 3: Preview & Publish */}
        {step === 3 && (
          <div className="p-4">
            {error && (
              <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                Failed to publish content
              </p>
            )}
            {successMessage && (
              <p className="text-green-700 bg-green-100 border border-green-300 text-center my-3 rounded-lg py-3">
                {successMessage}
              </p>
            )}
            <ContentPreview
              formData={{
                ...formData,
                media: formData.media || [],
                song: formData.music?.name || "",
              }}
              onBack={prevStep}
              onPublish={handlePublish}
              setFormData={setFormData}
            />
            {loading && <p className="text-center text-gray-500 mt-3">Publishing...</p>}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(data) => {
          setFormData((prev) => {
            const exists = prev.media.some((m) => m.url === data.url);
            if (exists) return prev;
            return { ...prev, media: [...(prev.media || []), data] };
          });
          setCameraOpen(false);
        }}
      />
    </div>
  );
};

export default CreatePost;
