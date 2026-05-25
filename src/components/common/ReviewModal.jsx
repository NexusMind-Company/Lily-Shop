import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createVendorReview } from "../../services/api";
import { createReview as createShopReview } from "../../services/shopApi";
import toast from "react-hot-toast";

const RATING_LABELS = {
  0: "Tap to rate",
  1: "Poor 😞",
  2: "Fair 😐",
  3: "Good 🙂",
  4: "Very Good 😊",
  5: "Excellent 🤩",
};

const ReviewModal = ({ isOpen, onClose, vendorId, vendorName, shopId, shopName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const isShopReview = !!shopId;
  const title = isShopReview ? (shopName || "this shop") : (vendorName || "this vendor");

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

  const createReviewMutation = useMutation({
    mutationFn: (data) =>
      isShopReview
        ? createShopReview({ shop_id: shopId, rating: data.rating, comment: data.comment })
        : createVendorReview(vendorId, data),
    onSuccess: () => {
      toast.success("Review submitted! Thanks for your feedback.");
      if (isShopReview) {
        queryClient.invalidateQueries({ queryKey: ["shopReviews", shopId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["reviews", vendorId] });
        queryClient.invalidateQueries({ queryKey: ["shopReviews", vendorId] });
        queryClient.invalidateQueries({ queryKey: ["vendorDetails", vendorId] });
      }
      onClose();
    },
    onError: (error) => {
      console.error("Review submission failed:", error?.response?.status, error?.response?.data);
      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "object"
          ? Object.values(error.response.data).flat().join(". ")
          : null) ||
        "Failed to submit review. Please try again.";
      toast.error(msg);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please tap a star to rate");
      return;
    }
    createReviewMutation.mutate({ rating, comment });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3 shadow-inner">
              <Star size={32} className="text-amber-500" strokeWidth={0} />
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Rate {title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">Your review helps others</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      size={44}
                      className={`transition-all duration-200 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-lg"
                          : "fill-gray-100 text-gray-200"
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <div className="h-7 flex items-center">
                <p
                  key={rating}
                  className={`text-base font-bold transition-all duration-300 ${
                    rating === 0
                      ? "text-gray-400"
                      : rating <= 2
                      ? "text-red-500"
                      : rating === 3
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {RATING_LABELS[rating]}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Your review <span className="text-gray-300 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-lily focus:outline-none resize-none text-sm text-gray-700 placeholder-gray-300 transition-colors bg-white"
            />
            <p className="text-xs text-gray-400 text-right">
              {comment.length}/500
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || createReviewMutation.isPending}
            className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              rating === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-lily text-white hover:bg-lily/90 active:scale-[0.98] shadow-lg shadow-lily/30"
            }`}
          >
            {createReviewMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default ReviewModal;