import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import { createVendorReview } from "../../services/api";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, vendorId, vendorName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: (data) => createVendorReview(vendorId, data),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["vendorDetails", vendorId] });
      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to submit review");
    },
  });

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    createReviewMutation.mutate({ rating, comment });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 flex justify-end items-end md:left-0 cursor-pointer pointer-events-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl cursor-default relative overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-5 border-b border-gray-100">
              <h2 className="text-center font-semibold text-base text-gray-900">
                Rate {vendorName || "this vendor"}
              </h2>
              <button
                onClick={handleClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 z-10 p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-500">
                  How was your experience?
                </p>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  size={36}
                  interactive={true}
                />
                <p className="text-sm font-medium text-gray-700">
                  {rating === 0 && "Tap to rate"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Share your experience (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-lily resize-none text-sm"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || createReviewMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-lily text-white h-12 rounded-2xl font-semibold text-sm hover:bg-lily/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReviewMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default ReviewModal;