import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { ChevronLeft, Star } from "lucide-react";
import { fetchUserReviews, deleteReview, toggleReviewLike } from "../../services/shopApi";
import { ReviewCard } from "../../components/common/ReviewList";
import EditReviewModal from "../../components/shop/EditReviewModal";
import LoaderSd from "../../components/loaders/loaderSd";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import toast from "react-hot-toast";

const UserReviewsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState(null);

  const userData = useSelector((state) => state.auth?.user_data);
  const currentUserId = userData?.id || userData?.user?.id;

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["userReviews"],
    queryFn: () => fetchUserReviews(),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (reviewId) => toggleReviewLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
    },
    onError: () => toast.error("Failed to toggle like"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderSd />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay message={error?.message || "Failed to load reviews"} center={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">My Reviews</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 pt-6">
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Star size={32} className="text-amber-300" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 mb-2">
              No reviews yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start rating shops to build your review history
            </p>
            <button
              onClick={() => navigate("/feed")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-lily text-white rounded-xl font-semibold hover:bg-lily/90 transition-colors"
            >
              <Star size={18} />
              Explore Shops
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star size={16} className="text-amber-500" fill="currentColor" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">All Reviews</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            </div>

            <div className="space-y-3 bg-white rounded-2xl p-4">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ReviewCard
                    review={review}
                    isLast={index === reviews.length - 1}
                    canEdit={true}
                    onEdit={() => setEditingReview(review)}
                    onDelete={(reviewId) => deleteReviewMutation.mutate(reviewId)}
                    onLike={(reviewId) => toggleLikeMutation.mutate(reviewId)}
                    isLiked={review.is_liked}
                    likeCount={review.like_count}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditReviewModal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        review={editingReview}
        shopId={editingReview?.shop}
      />
    </div>
  );
};

export default UserReviewsPage;
