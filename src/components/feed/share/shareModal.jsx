import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Share2,
  Link as LinkIcon,
  MessageCircle,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const getSocialIcon = (type) => {
  switch (type) {
    case "WhatsApp":
      return (
        <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      );
    case "X":
      return (
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      );
    case "Facebook":
      return (
        <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      );
    case "LilyChat":
      return (
        <div className="w-12 h-12 rounded-full border-2 border-lily flex items-center justify-center overflow-hidden">
          <img
            src="/lily-logo.jpg"
            alt="LilyChat"
            className="w-full h-full object-cover"
          />
        </div>
      );
    default:
      return <LinkIcon size={24} />;
  }
};

const ShareModal = ({
  isOpen,
  onClose,
  postUrl,
  postCaption,
  post,
  isProduct,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const shareOptions = [
    {
      name: "LilyChat",
      onClick: () => {
        navigate("/messages", { state: { sharePost: post, isProduct } });
        onClose();
      },
    },
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
          className="fixed inset-0 z-[9999] bg-black/60 flex justify-end items-end md:left-0 md:w-full cursor-pointer pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            key="share-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-t-3xl md:rounded-t-3xl shadow-2xl flex flex-col cursor-default relative overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-5 border-b border-gray-100">
              <h2 className="text-center font-semibold text-base text-gray-900">
                Share
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 z-10 p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex justify-around items-center py-4 mb-5">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={
                      option.onClick ||
                      (() => window.open(option.url, "_blank"))
                    }
                    className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 bg-transparent border-none"
                  >
                    {getSocialIcon(option.name)}
                    <span className="text-xs font-medium text-gray-700">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="h-px bg-gray-100 mb-5" />

              <div className="space-y-2">
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                    <Share2 size={20} className="text-gray-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    More options...
                  </span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center ${isCopied ? "bg-lily" : "bg-gray-100"}`}
                  >
                    {isCopied ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-white fill-white"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <Copy size={20} className="text-gray-700" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${isCopied ? "text-lily" : "text-gray-800"}`}
                  >
                    {isCopied ? "Link copied!" : "Copy link"}
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
