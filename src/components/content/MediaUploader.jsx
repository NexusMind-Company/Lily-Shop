
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import {
  Video,
  Image as ImageIcon,
  Trash2,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CameraModal from "./CameraModal";

const MediaUploader = ({ media = [], setMedia }) => {
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle selecting files (append new ones safely)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => file.type.startsWith("video") || file.type.startsWith("image")
    );

    if (validFiles.length === 0) {
      setError("Please upload valid image or video files.");
      return;
    }

    setError("");

    const newMedia = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`, // unique key
      type: file.type.startsWith("video") ? "video" : "image",
      url: URL.createObjectURL(file),
      file,
    }));

    // Append new files (no duplicates)
    const uniqueMedia = [
      ...media,
      ...newMedia.filter(
        (item) => !media.some((existing) => existing.url === item.url)
      ),
    ];

    setMedia(uniqueMedia);
    e.target.value = "";
  };

  // Remove a specific media item
  const handleRemoveMedia = (index) => {
    const updated = media.filter((_, i) => i !== index);
    setMedia(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(updated.length - 1, 0));
    }
  };

  // Handle camera capture
  const handleCapture = (capturedMedia) => {
    if (!capturedMedia) return;
    const newItem = {
      ...capturedMedia,
      id: `${Date.now()}-${Math.random()}`,
    };
    setMedia([...media, newItem]);
    setShowCamera(false);
  };

  // Navigation
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-4 shadow-sm text-center space-y-4">
      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />

      {/* Upload Buttons */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex justify-center gap-8">
          <div
            onClick={() => videoInputRef.current.click()}
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
          >
            <Video className="w-8 h-8 text-gray-700" />
            <span className="text-sm text-gray-700 mt-1 font-medium">
              Upload Videos
            </span>
          </div>

          <div
            onClick={() => imageInputRef.current.click()}
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
          >
            <ImageIcon className="w-8 h-8 text-gray-700" />
            <span className="text-sm text-gray-700 mt-1 font-medium">
              Upload Photos
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          You can select multiple files at once (mp4, mov, jpg, png)
        </p>

        {/* Hidden Inputs */}
        <input
          type="file"
          accept="video/*"
          multiple
          ref={videoInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          multiple
          ref={imageInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Media Preview (Carousel) */}
      {media.length > 0 ? (
        <div className="relative flex flex-col items-center mt-4">
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {media[currentIndex].type === "video" ? (
              <video
                src={media[currentIndex].url}
                className="w-full h-100 object-contain bg-white"
                controls
              />
            ) : (
              <img
                src={media[currentIndex].url}
                alt={`media-${currentIndex}`}
                className="w-full h-100 object-contain bg-white"
              />
            )}

            {/* Delete Button */}
            <button
              onClick={() => handleRemoveMedia(currentIndex)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all z-10"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {media.length > 1 && (
            <div className="flex justify-center mt-3 gap-2">
              {media.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === idx
                      ? "bg-gray-800 scale-110"
                      : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Camera className="w-10 h-10 mb-2 text-gray-400" />
          <p className="text-gray-700 font-medium">No media selected</p>
          <p className="text-xs mt-1 text-gray-500">
            Select or capture multiple images/videos
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
};

MediaUploader.propTypes = {
  media: PropTypes.array.isRequired,
  setMedia: PropTypes.func.isRequired,
};

export default MediaUploader;
