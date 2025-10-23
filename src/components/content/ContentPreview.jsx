
import PropTypes from "prop-types";
import { useState, useRef } from "react";
import { Upload, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContentPreview = ({ formData, onPublish, setFormData }) => {
  const { media = [], caption, postType, productDetails } = formData;
  const [charCount, setCharCount] = useState(caption?.length || 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate(); 

  const handleCaptionChange = (e) => {
    const text = e.target.value;
    setCharCount(text.length);
    setFormData((prev) => ({ ...prev, caption: text }));
  };

  // Track scroll position to show active media dot
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.firstChild?.offsetWidth || 1;
    const index = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(index);
  };

  // Handle publish and redirect
  const handlePublish = async () => {
    try {
      setLoading(true);
      await onPublish(); // perform your post upload logic
      setLoading(false);
      //  Redirect after successful post
      navigate("/");
    } catch (err) {
      console.error("Publish failed:", err);
      setLoading(false);
      alert("Failed to publish post. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen bg-white text-gray-800 flex flex-col relative">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 mb-24">
        {/*  Media Carousel */}
        {media.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
              {media.map((item, index) => (
                <div
                  key={index}
                  className="relative min-w-[10rem] h-40 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 snap-center"
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={`media-${index}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>

            {/*  Pagination Dots */}
            {media.length > 1 && (
              <div className="flex justify-center mt-2 space-x-1">
                {media.map((_, index) => (
                  <span
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-lime-500 scale-110"
                        : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-28 text-gray-400 border border-gray-200 rounded-md">
            <p>No media selected</p>
          </div>
        )}

        {/* Caption Input */}
        <textarea
          className="w-full border border-gray-400 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-lime-500"
          rows="5"
          placeholder="Describe your post in less than 500 characters..."
          maxLength={500}
          value={caption || ""}
          onChange={handleCaptionChange}
        />
        <p className="text-xs text-gray-400 text-right">
          {charCount}/500 characters
        </p>

        {/*  Hashtags */}
        <div>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Hash className="w-4 h-4" /> Hashtags
          </button>
        </div>

        {/*  Product Info */}
        {postType === "product" && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-3">
            <p className="font-semibold text-sm text-gray-800">
              {productDetails?.productName || "Product Name"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ₦{productDetails?.price || "0"} — {productDetails?.stock || 0} in
              stock
            </p>
          </div>
        )}
      </div>

      {/*  Fixed Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-sm">
        <button
          onClick={handlePublish}
          disabled={loading}
          className={`w-full flex items-center justify-center ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lime-500 hover:bg-lime-600"
          } text-black py-3 rounded-full font-semibold transition`}
        >
          {loading ? (
            <span>Posting...</span>
          ) : (
            <>
              <Upload className="w-4 h-4 inline-block mr-1" />
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
};

ContentPreview.propTypes = {
  formData: PropTypes.shape({
    media: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        url: PropTypes.string,
      })
    ),
    caption: PropTypes.string,
    song: PropTypes.shape({
      name: PropTypes.string,
      artist: PropTypes.string,
    }),
    postType: PropTypes.string,
    productDetails: PropTypes.object,
  }).isRequired,
  onPublish: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ContentPreview;
