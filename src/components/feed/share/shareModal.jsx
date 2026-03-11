import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Share2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        postCaption + "\n" + postUrl,
      )}`,
    },
    {
      name: "X",
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(
        postUrl,
      )}&text=${encodeURIComponent(postCaption)}`,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl,
      )}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Failed to copy link.");
    }
  };

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
      handleCopyLink();
      alert("Link copied to clipboard (Share not supported on this browser).");
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="share-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-end md:left-64 md:w-[calc(100%-16rem)] md:justify-start md:items-center md:p-6 cursor-pointer pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            key="share-panel"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col mb-15 md:mb-0 cursor-default relative overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-4 border-b border-gray-200">
              <h2 className="text-center font-bold text-lg text-gray-800">
                Share Post
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800 z-10 p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-4 gap-1 py-4 border-b border-gray-200">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center size-17 bg-lily hover:bg-ash rounded-full gap-1 cursor-pointer"
                  >
                    {getSocialIcon(option.name)}
                  </a>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-6">
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center min-w-17 min-h-17 bg-lily hover:bg-ash rounded-full transition-colors cursor-pointer"
                >
                  <Share2 size={24} className="text-gray-700" />
                  <span className="text-xs font-semibold text-gray-800">
                    Share via...
                  </span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center size-17 bg-lily hover:bg-ash rounded-full transition-colors cursor-pointer"
                >
                  <Copy
                    size={24}
                    className={`transition-colors ${
                      isCopied ? "text-darklily" : "text-gray-700"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold transition-colors ${
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

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default ShareModal;
