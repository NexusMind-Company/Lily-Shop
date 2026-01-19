// --- unchanged imports ---
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// TWO SEPARATE SLICES
import {
  createProductContent,
  resetContentState as resetProductContent,
} from "../../redux/productContentSlice";

import {
  createFunContent,
  resetContentState as resetFunContent,
} from "../../redux/funContentSlice";

import MediaUploader from "./MediaUploader";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import ContentPreview from "./ContentPreview";
import CameraModal from "./CameraModal";

import { Camera, ChevronLeft } from "lucide-react";

const CreatePost = () => {
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Select from both slices
  const productState = useSelector((state) => state.productContent);
  const funState = useSelector((state) => state.funContent);

  const success = productState.success || funState.success;
  const error = productState.error || funState.error;

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // unified form state
  const [formData, setFormData] = useState({
    postType: "",
    caption: "",
    media: [],
    name: "",
    price: "",
    inStock: false,
    quantity_available: "",
    delivery_info: "",
    promotable: false,
    hashtags: "",
    location: "",
  });

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // -----------------------------------------------------
  // PUBLISH HANDLER — fully corrected
  // -----------------------------------------------------
  const handlePublish = async () => {
    setLoading(true);

    try {
      if (formData.postType === "product") {
        // PRODUCT PAYLOAD
        const productPayload = {
          name: formData.name?.trim() || "Untitled Product",
          caption: formData.caption?.trim() || "",
          delivery_info: formData.delivery_info?.trim() || "",
          hashtags: formData.hashtags?.trim() || "",
          price: formData.price === "" ? null : Number(formData.price),
          quantity_available:
            formData.quantity_available === ""
              ? 0
              : Number(formData.quantity_available),
          in_stock: Boolean(formData.inStock),
          promotable: Boolean(formData.promotable),
          media: formData.media[0]?.file || null,
        };

        console.log("PRODUCT PAYLOAD:", productPayload);

        await dispatch(createProductContent(productPayload));
      } else {
        // FUN PAYLOAD
        const funPayload = {
          caption: formData.caption?.trim() || "",
          hashtags: formData.hashtags?.trim() || "",
          location: formData.location?.trim() || "",
          media: formData.media[0]?.file || null,
        };

        console.log("FUN PAYLOAD:", funPayload);

        await dispatch(createFunContent(funPayload));
      }
    } catch (err) {
      console.error("PUBLISH ERROR:", err);
      const detail =
        funState.error?.detail ||
        productState.error?.detail ||
        "Failed to publish content.";
      const media =
        funState.error?.media ||
        productState.error?.media ||
        "Failed to publish content.";

      setErrorMessage(detail);
      setErrorMessage(media);
      setErrorMessage(err);
    }

    setLoading(false);
  };

  // redirect on success
  useEffect(() => {
    if (success) {
      setSuccessMessage("Content published successfully!");

      setTimeout(() => {
        navigate("/");
        dispatch(resetProductContent());
        dispatch(resetFunContent());
        setLoading(false);
      }, 1500);
    }

    if (error) {
      setLoading(false);
    }
  }, [success, error, navigate, dispatch]);

  // MEDIA HANDLER
  const updateMedia = (incoming) => {
    setFormData((prev) => {
      if (Array.isArray(incoming)) return { ...prev, media: incoming };

      const exists = prev.media.some((m) => m.url === incoming.url);
      if (exists) return prev;

      return { ...prev, media: [...prev.media, incoming] };
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

        {/* STEP 1 */}
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

        {/* STEP 2 */}
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
                formData={formData}
                setFormData={setFormData}
              />
            )}

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-full bg-lily hover:bg-lily font-semibold mt-4"
            >
              Continue to Preview
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="p-4">
            {error && (
              <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                Failed to publish content
              </p>
            )}
            {/* Show detail error if present */}
            {(productState.error?.detail ||
              funState.error?.detail ||
              funState.error?.media ||
              productState.error?.media) && (
              <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                {productState.error?.detail || funState.error?.detail}
              </p>
            )}
            {/* Show media error if present */}
            {Array.isArray(productState.error?.media) &&
              productState.error.media.length > 0 && (
                <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                  {productState.error.media.join(" ")}
                </p>
              )}
            {Array.isArray(funState.error?.media) &&
              funState.error.media.length > 0 && (
                <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                  {funState.error.media.join(" ")}
                </p>
              )}
            {errorMessage && (
              <p className="text-red-700 bg-red-100 border border-red-300 text-center my-3 rounded-lg py-3">
                {errorMessage}
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
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* CAMERA */}
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
