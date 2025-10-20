import { useState, useRef } from "react";
import CameraRecorderModal from "./CameraModal";
import MusicPicker from "./MusicPicker";
import LocationTagger from "./LocationTagger";
import PostTypeSelector from "./PostTypeSelector";
import ProductDetailsForm from "./ProductDetailsForm";
import ContentPreview from "./ContentPreview";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";

function UploadContent() {
  const [tab, setTab] = useState(0);
  const [activeItems, setActiveItems] = useState([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [music, setMusic] = useState(null);
  const [location, setLocation] = useState("");
  const [postType, setPostType] = useState("fun");
  const [productDetails, setProductDetails] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);

  // Handler to open camera
  const showCamera = () => setCameraOpen(true);

  // Handler to close camera
  const closeCamera = () => setCameraOpen(false);

  // Handler to add new media
  const handleAddMedia = (media) => {
    setActiveItems((prev) => [...prev, media]);
  };

  const handleGoBack = () => {
    setTab((prev) => Math.max(prev - 1, 0));
  };

  const handlePublish = () => {
    alert("Content published!");
    setTab(0);
    setActiveItems([]);
  };

  const fileInputRef = useRef(null);
  const tabLabels = ["Upload/Record", "Details", "Product Details", "Preview & Publish"];

  const handleNext = () => setTab((prev) => Math.min(prev + 1, tabLabels.length - 1));
  const handlePrev = () => setTab((prev) => Math.max(prev - 1, 0));

  const handleClearAll = () => {
    setActiveItems([]);
    // Add any additional cleanup logic here
  };

  return (
    <div className="w-full max-w-full sm:max-w-2xl mx-auto px-2 mt-10 h-fit flex flex-col">
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 mb-10 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Create <span className="text-lily">Content</span>
        </h1>
      </div>

      <div className="top-0 z-10">
        <div className=" h-16 flex items-center justify-between px-4">
          {/* Mobile Header */}
          <div className="sm:hidden flex items-center w-full justify-between">
            <button
              className="text-gray-500 disabled:opacity-50"
              onClick={handlePrev}
              disabled={tab === 0}>
              <ChevronLeft />
            </button>
            <span className="font-poppins">{tabLabels[tab]}</span>
            <button
              className="text-gray-500 disabled:opacity-50"
              onClick={handleNext}
              disabled={tab === tabLabels.length - 1}>
              <ChevronRight />
            </button>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex flex-wrap mb-4 w-full">
            {tabLabels.map((label, idx) => (
              <button
                key={label}
                className={`flex-1 px-2 py-2 text-xs sm:text-base ${
                  tab === idx ? "border-b-2 border-lily font-bold" : "text-gray-500"
                }`}
                onClick={() => setTab(idx)}
                disabled={
                  (idx === 2 && postType !== "product") || (idx > 0 && activeItems.length === 0)
                }>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload tab */}
      <div className="flex-grow overflow-auto">
        {tab === 0 && (
          <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const newMedia = files.map((file) => ({
                      previewUrl: URL.createObjectURL(file),
                      type: file.type.startsWith("video") ? "video" : "image",
                      file: file,
                    }));
                    setActiveItems((prev) => [...prev, ...newMedia]);
                  }}
                />
                <button
                  className="w-full sm:w-auto px-4 py-2 bg-lily text-white rounded"
                  onClick={() => fileInputRef.current?.click()}>
                  Choose from gallery
                </button>
                <button
                  className="w-full sm:w-auto px-4 py-2 bg-lily text-white rounded"
                  onClick={showCamera}>
                  Open Camera
                </button>
              </div>
              {/* Camera modal usage */}
              <CameraRecorderModal
                open={cameraOpen}
                onClose={closeCamera}
                onAddMedia={handleAddMedia}
              />
              {activeItems.length > 0 && (
                <div className="mb-4">
                  <div className="flex overflow-x-auto gap-4 pb-4">
                    {activeItems.map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 w-full sm:w-1/2 relative">
                        {item.type === "video" ? (
                          <video
                            src={item.previewUrl}
                            controls
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <img
                            src={item.previewUrl}
                            alt={`preview-${idx}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                        <button
                          className="absolute left-2 bottom-2 bg-red-600 text-white px-3 py-1 rounded shadow"
                          onClick={() => {
                            setActiveItems((prev) => prev.filter((_, i) => i !== idx));
                          }}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-end md:flex-row gap-2 my-4 w-full">
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 text-sm md:text-base"
                disabled={activeItems.length === 0}>
                Clear All
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 bg-lily text-white rounded hover:bg-lily/90 disabled:bg-gray-300 text-sm md:text-base"
                disabled={activeItems.length === 0}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Details tab */}
        {tab === 1 && (
          <div className="h-full flex flex-col p-4">
            <div className="flex-grow overflow-y-auto">
              <div className="mb-4">
                <label className="block mb-1">Caption:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Hashtags:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#fashion #sale"
                />
              </div>
              <MusicPicker videoUrl={activeItems[0]?.previewUrl} onMusicChange={setMusic} />
              <LocationTagger onLocationChange={setLocation} />
              <PostTypeSelector postType={postType} setPostType={setPostType} />
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-lily text-white rounded mt-4 mb-4 mx-auto"
              onClick={() => setTab(postType === "product" ? 2 : 3)}>
              Next
            </button>
          </div>
        )}

        {/* Product Details tab */}
        {tab === 2 && postType === "product" && (
          <div className="h-full flex flex-col p-4">
            <div className="flex-grow overflow-y-auto">
              <ProductDetailsForm details={productDetails} setDetails={setProductDetails} />
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-lily text-white rounded mt-4 mb-4 mx-auto"
              onClick={() => setTab(3)}>
              Next
            </button>
          </div>
        )}

        {/* Preview & Publish tab */}
        {tab === 3 && (
          <div>
            {activeItems.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-full sm:w-1/2 relative">
                    <ContentPreview
                      media={{
                        type: item.type,
                        url: item.previewUrl,
                      }}
                      productName={productDetails.name || "Product Name"}
                      price={productDetails.price || "0"}
                      caption={caption || ""}
                      song={music?.name || ""}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No media to preview.</div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-5 my-10 justify-end ">
              <button onClick={handleGoBack} className="bg-red-500 py-2 px-4 rounded-md text-white">
                Go Back
              </button>
              <button onClick={handlePublish} className="bg-lily text-white py-2 px-4 rounded-md">
                Publish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadContent;
