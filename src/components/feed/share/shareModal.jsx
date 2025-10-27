import React, { useState } from "react";
import { X, Copy, Share2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// You can replace these with actual SVG icons for the brands if you have them
const getSocialIcon = (type) => {
  switch (type) {
    case "WhatsApp":
      return (
        <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-8 h-8" />
      );
    case "X":
      return <img src="/icons/x.svg" alt="Twitter" className="w-8 h-8" />;
    case "Facebook":
      return (
        <img src="/icons/facebook.svg" alt="Facebook" className="w-8 h-8" />
      );
    default:
      return <LinkIcon size={24} />;
  }
};

const ShareModal = ({ isOpen, onClose, postUrl, postCaption }) => {
  const [isCopied, setIsCopied] = useState(false);

  const shareOptions = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        postCaption + "\n" + postUrl
      )}`,
    },
    {
      name: "X",
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(postCaption)}`,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
    },
  ];

  // Function to copy the link to the clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Failed to copy link.");
    }
  };

  // Function to trigger the device's native share functionality
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          text: postCaption,
          url: postUrl,
        });
      } catch (err) {
        console.error("Error using native share: ", err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      handleCopyLink();
      alert("Link copied to clipboard (Share not supported on this browser).");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50 flex justify-center items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-xl bg-white rounded-t-3xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-4 border-b border-gray-200">
              <h2 className="text-center font-bold text-lg text-gray-800">
                Share Post
              </h2>
              <button
                onClick={onClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">
              {/* Social Media Shortcuts */}
              <div className="grid grid-cols-4 gap-1 pt-4 border-t border-gray-200">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 bg-lily hover:bg-ash rounded-full gap-1"
                  >
                    {getSocialIcon(option.name)}
                    <span className="text-xs text-gray-600">{option.name}</span>
                  </a>
                ))}
              </div>
              {/* Primary Actions */}
              <div className="grid grid-cols-4 gap-6">
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center size-22 bg-lily hover:bg-ash rounded-full transition-colors"
                >
                  <Share2 size={24} className="text-gray-700" />
                  <span className="text-sm font-semibold text-gray-800">
                    Share via...
                  </span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center size-22 bg-lily hover:bg-ash rounded-full transition-colors"
                >
                  <Copy
                    size={24}
                    className={`transition-colors ${
                      isCopied ? "text-darklily" : "text-gray-700"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isCopied ? "text-darklily" : "text-gray-800"
                    }`}
                  >
                    {isCopied ? "Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
