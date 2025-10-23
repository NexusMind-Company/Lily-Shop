
import { useState } from "react";
import MediaUploader from "./MediaUploader";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import LocationPicker from "./LocationPicker";
import ContentPreview from "./ContentPreview";
import CameraModal from "./CameraModal";
import MusicPicker from "./MusicPicker";
import { Camera, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);

  //  Unified form data
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

  const navigate = useNavigate();

  // Step navigation
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  //  Publish handler
  const handlePublish = () => {
    alert("Post published successfully!");
  };

  // Update media safely (no duplication, supports full replacement or single append)
  const updateMedia = (incoming) => {
    setFormData((prev) => {
      const prevMedia = prev.media || [];

      // If array → full replacement (e.g., delete or batch upload)
      if (Array.isArray(incoming)) {
        return { ...prev, media: incoming };
      }

      // If single item → append safely (e.g., camera capture)
      const newItem = incoming;
      const exists = prevMedia.some((m) => m.url === newItem.url);
      if (exists) return prev; // skip duplicates

      return { ...prev, media: [...prevMedia, newItem] };
    });
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white text-gray-900">
      <div className="w-full relative flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="text-gray-600 hover:text-black transition"
            >
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
            {/* Camera Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setCameraOpen(true)}
                className="flex flex-col items-center justify-center gap-2 px-35 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition"
              >
                <Camera className="w-10 h-10" /> Open Camera
              </button>
            </div>

            {/* Media Uploader */}
            <MediaUploader media={formData.media || []} setMedia={updateMedia} />

            {/* Next Button */}
            <button
              onClick={nextStep}
              disabled={!formData.media || formData.media.length === 0}
              className={`w-full py-3 rounded-full font-semibold mt-4 transition ${
                formData.media && formData.media.length > 0
                  ? "bg-lime-500 hover:bg-lime-600 text-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2: Add Details */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <PostTypeSelector
              postType={formData.postType}
              setPostType={(type) =>
                setFormData((prev) => ({ ...prev, postType: type }))
              }
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

            {/* Music Picker */}
            <MusicPicker
              selectedMusic={formData.music}
              setSelectedMusic={(music) =>
                setFormData((prev) => ({ ...prev, music }))
              }
            />

            {/* Location Picker */}
            <LocationPicker formData={formData} setFormData={setFormData} />

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-full bg-lily hover:bg-lily  font-semibold mt-4"
            >
              Continue to Preview
            </button>
          </div>
        )}

        {/* STEP 3: Preview & Publish */}
        {step === 3 && (
          <div className="p-4">
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
          </div>
        )}
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(data) => {
          // Append captured image/video safely
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
