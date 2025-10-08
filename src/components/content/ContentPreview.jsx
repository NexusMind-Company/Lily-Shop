import { useState } from "react";
import PropTypes from "prop-types";

function ContentPreview({ media, productName, price, caption, song }) {
  const [showFullCaption, setShowFullCaption] = useState(false);

  const handleSeeMore = () => setShowFullCaption(true);

  return (
    <section>
      <div>
        {/* Media Preview */}
        <div>
          {media.type === "video" ? (
            <video
              src={media.url}
              controls
              style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "contain" }}
            />
          ) : (
            <img
              src={media.url}
              alt="preview"
              style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "contain" }}
            />
          )}
        </div>

        {/* Bottom Right Overlay */}
        <div className="absolute top-[50%] z-10 p-5 text-white">
          <div className="font-bold text-[18px]">{productName}</div>
          <div className="font-semibold">₦{price}</div>
          <div
            className="mb-1 text-gray-100"
            style={{
              width: "70%",
              maxHeight: "80px",
              overflowY: "auto",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              overflowWrap: "break-word",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            <style>
              {`
              .mb-1::-webkit-scrollbar {
                display: none;
              }
            `}
            </style>
            {showFullCaption || caption.length <= 80 ? (
              <>
                {caption}
                {caption.length > 80 && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 14,
                      marginLeft: 8,
                    }}
                    onClick={() => setShowFullCaption(false)}>
                    Show less
                  </button>
                )}
              </>
            ) : (
              <>
                {caption.slice(0, 80)}...
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 14,
                    marginLeft: 8,
                  }}
                  onClick={handleSeeMore}>
                  See more
                </button>
              </>
            )}
          </div>
          {song && <div className="mb-2 text-gray-100">🎵 {song}</div>}
          <button className="rounded-2xl bg-white outline-none py-1 px-3 text-black">
            👜 Buy Now
          </button>
        </div>
      </div>
    </section>
  );
}

ContentPreview.propTypes = {
  media: PropTypes.shape({
    type: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  productName: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.string.isRequired,
  song: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onPublish: PropTypes.func.isRequired,
};

export default ContentPreview;
