import PropTypes from "prop-types";
import { useState, useRef } from "react";
import { Upload, Hash, X } from "lucide-react";

const ContentPreview = ({ formData, onPublish, setFormData }) => {
  const { media = [], caption } = formData;

  const [charCount, setCharCount] = useState(caption?.length || 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Hashtag input
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");

  const scrollRef = useRef(null);

  // ✅ Disable all input if loading
  const disabled = loading;

  const handleCaptionChange = (e) => {
    if (disabled) return;

    const text = e.target.value;
    setCharCount(text.length);

    setFormData((prev) => ({
      ...prev,
      caption: text,
    }));
  };

  const handleScroll = () => {
    if (!scrollRef.current || disabled) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.firstChild?.offsetWidth || 1;
    const index = Math.round(scrollLeft / itemWidth);

    setCurrentIndex(index);
  };

  // ✅ Add hashtag
  const addHashtag = () => {
    if (!hashtagInput.trim() || disabled) return;

    let tag = hashtagInput.trim();
    if (!tag.startsWith("#")) tag = `#${tag}`;

    const existing =
      formData.hashtags?.split(",").map((h) => h.trim()).filter(Boolean) || [];

    if (existing.includes(tag)) {
      setHashtagInput("");
      setShowHashtagInput(false);
      return;
    }

    const updated = [...existing, tag];

    setFormData((prev) => ({
      ...prev,
      hashtags: updated.join(","),
    }));

    setHashtagInput("");
    setShowHashtagInput(false);
  };

  // ✅ Remove hashtag
  const removeHashtag = (tag) => {
    if (disabled) return;

    const current =
      formData.hashtags?.split(",").map((h) => h.trim()).filter(Boolean) || [];

    const filtered = current.filter((t) => t !== tag);

    setFormData((prev) => ({
      ...prev,
      hashtags: filtered.join(","),
    }));
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      await onPublish(); // API call handled outside
      // ❗ Do NOT setLoading(false). Parent handles redirect
    } catch (err) {
      console.error("Publish failed:", err);
      setLoading(false);
      alert("Failed to publish post. Please try again.");
    }
  };

  const hashtagList =
    formData.hashtags
      ?.split(",")
      .map((h) => h.trim())
      .filter(Boolean) || [];

  return (
    <div className="w-full h-screen bg-white text-gray-800 flex flex-col relative">

      {/* ✅ Scrollable Content */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-3 space-y-4 mb-24 ${
          disabled ? "pointer-events-none opacity-70" : ""
        }`}
      >

        {/* ✅ Media Preview */}
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
                    <video src={item.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={item.url} alt={`media-${index}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>

            {/* ✅ Carousel Dots */}
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

        {/* ✅ Caption */}
        <textarea
          disabled={disabled}
          className="w-full border border-gray-400 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-lime-500 disabled:bg-gray-100"
          rows="5"
          placeholder="Describe your post..."
          maxLength={500}
          value={caption || ""}
          onChange={handleCaptionChange}
        />

        <p className="text-xs text-gray-400 text-right">{charCount}/500 characters</p>

        {/* ✅ Hashtags */}
        <div className="space-y-2">

          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowHashtagInput(true)}
            className={`flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium 
              ${disabled ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-50"}
            `}
          >
            <Hash className="w-4 h-4" /> Add Hashtags
          </button>

          {hashtagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {hashtagList.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  {!disabled && (
                    <X
                      className="w-4 h-4 cursor-pointer text-gray-600 hover:text-red-500"
                      onClick={() => removeHashtag(tag)}
                    />
                  )}
                </span>
              ))}
            </div>
          )}

          {showHashtagInput && !disabled && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                autoFocus
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                placeholder="Enter hashtag"
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
              />
              <button
                onClick={addHashtag}
                className="px-3 py-2 bg-lime-500 text-black rounded-lg text-sm font-semibold"
              >
                Add
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ✅ Publish Button */}
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
          {loading ? <span>Posting...</span> : (<><Upload className="w-4 h-4 mr-1" /> Post</>)}
        </button>
      </div>

    </div>
  );
};

ContentPreview.propTypes = {
  formData: PropTypes.object.isRequired,
  onPublish: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ContentPreview;
