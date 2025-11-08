import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createContent, resetContentState } from "../../redux/contentSlice";
import { useNavigate } from "react-router-dom";

import MediaUploader from "./MediaUploader";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import ContentPreview from "./ContentPreview";
import CameraModal from "./CameraModal";

import { Camera, ChevronLeft } from "lucide-react";

const CreatePost = () => {
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { success, error } = useSelector((state) => state.content);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Final simplified state (API-compatible)
  const [formData, setFormData] = useState({
    caption: "",
    media: [],
    name: "",
    price: "",
    shop_id: "0", // ✅ Mock shop ID
    inStock: null,
    quantity_available: "",
    delivery_info: "",
    promotable: false,
    hashtags: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ✅ Publish handler
  const handlePublish = () => {
    const name =
      formData.postType === "product"
        ? formData.name?.trim() || "Untitled Product"
        : "fun"; // ✅ auto-name for fun posts

    const payload = {
      name,
      caption: formData.caption || "",
      price: Number(formData.price) || 0,
      in_stock: formData.inStock === true || false,
      shop_id: formData.shop_id || "0",
      quantity_available: Number(formData.quantity_available) || 0,
      delivery_info: formData.delivery_info || "",
      promotable: formData.promotable === true || false,
      hashtags: formData.hashtags || "",
      media: formData.media[0]?.file || null,
    };

    console.log("✅ PAYLOAD BEFORE createContent:", payload);


    // ✅ Log form data for debugging
    console.log("✅ FORM DATA TEST:");
    for (let pair of payload.media instanceof FormData ? payload.media.entries() : []) {
      console.log(pair[0], pair[1]);
    }

    dispatch(createContent(payload));
  };

  // ✅ Redirect after success
  useEffect(() => {
    if (success) {
      setSuccessMessage("Content published successfully!");
      setTimeout(() => {
        navigate("/feed");
        dispatch(resetContentState());
      }, 2000);
    }
  }, [success, navigate, dispatch]);

  // ✅ Media handler
  const updateMedia = (incoming) => {
    setFormData((prev) => {
      const existing = prev.media;

      if (Array.isArray(incoming)) {
        return { ...prev, media: incoming };
      }

      const exists = existing.some((m) => m.url === incoming.url);
      if (exists) return prev;

      return { ...prev, media: [...existing, incoming] };
    });
  };

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
            <span>
              <ChevronLeft size={30} onClick={() => navigate(-1)} />
            </span>
          )}

          <h2 className="text-lg font-semibold text-center w-full text-gray-900">
            {step === 1 && "Create Post"}
            {step === 2 && "Add Details"}
            {step === 3 && "Preview"}
          </h2>

          <span />
        </div>

        {/* STEP 1 — MEDIA */}
        {step === 1 && (
          <div className="p-4 space-y-8">
            <div className="flex justify-center">
              <button
                onClick={() => setCameraOpen(true)}
                className="flex flex-col items-center justify-center gap-2 px-35 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition"
              >
                <Camera className="w-10 h-10" /> Open Camera
              </button>
            </div>

            <MediaUploader media={formData.media} setMedia={updateMedia} />

            <button
              onClick={nextStep}
              disabled={formData.media.length === 0}
              className={`w-full py-3 rounded-full font-semibold mt-4 transition ${
                formData.media.length > 0
                  ? "bg-lime-500 hover:bg-lime-600 text-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2 — DETAILS */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <PostTypeSelector
              postType={formData.postType}
              setPostType={(type) =>
                setFormData((prev) => ({ ...prev, postType: type }))
              }
            />

            {formData.postType === "product" && (
              <ProductDetailsForm formData={formData} setFormData={setFormData} />
            )}

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-full bg-lily hover:bg-lily font-semibold mt-4"
            >
              Continue to Preview
            </button>
          </div>
        )}

        {/* STEP 3 — PREVIEW */}
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
              formData={formData}
              onPublish={handlePublish}
              setFormData={setFormData}
              onBack={prevStep}
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
