import { useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const getInitials = (fullName) => {
  if (!fullName) return "A";
  const parts = String(fullName).split(" ").filter((p) => p.length > 0);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AvatarColors = [
  "from-[#4eb75e] to-green-400",
  "from-amber-400 to-orange-400",
  "from-blue-400 to-indigo-400",
  "from-pink-400 to-rose-400",
  "from-purple-400 to-violet-400",
];

const getAvatarColor = (name) => {
  if (!name) return AvatarColors[0];
  const idx = name.charCodeAt(0) % AvatarColors.length;
  return AvatarColors[idx];
};

const ReviewStars = ({ rating, size = 16, interactive = false, onRate }) => {
  const [hover, setHover] = useState(null);
  const displayRating = hover ?? rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover && setHover(star)}
          onMouseLeave={() => interactive && setHover && setHover(null)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-100 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, isLast, canEdit = false, onEdit, onDelete, onLike, isLiked = false, likeCount = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!isLast ? "mb-3" : ""}`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(review.user_name || review.user)} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
      >
        {getInitials(review.user_name || review.user)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-gray-900">
              {review.user_name || review.user || "Anonymous"}
            </p>
            <div className="flex items-center gap-1">
              <ReviewStars rating={Number(review.rating || 0)} size={12} />
              <span className="text-xs font-bold text-amber-500 ml-0.5">
                {Number(review.rating || 0)}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {formatTimeAgo(review.created_at || review.date)}
          </span>
        </div>

        {review.comment && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {review.comment}
          </p>
        )}

        {/* Like and Action Buttons */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onLike && onLike(review.id)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-lily transition-colors"
          >
            <Star
              size={14}
              className={`${
                isLiked
                  ? "fill-lily text-lily"
                  : "fill-gray-200 text-gray-400"
              }`}
            />
            <span>{likeCount}</span>
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => onEdit && onEdit(review)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(review.id)}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const ReviewList = ({ reviews, onWriteReview, currentUserId, onReviewAction }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
          <Star size={32} className="text-amber-300" />
        </div>
        <p className="text-gray-500 font-semibold mb-1">No reviews yet</p>
        <p className="text-sm text-gray-400 mb-4">Share your experience to help others</p>
        <button
          onClick={onWriteReview}
          className="bg-lily text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-lily/90 transition-colors shadow-md shadow-lily/25"
        >
          Be the first to review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Star size={16} className="text-amber-500" fill="currentColor" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">Customer Reviews</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {reviews.length}
          </span>
        </div>
        <button
          onClick={onWriteReview}
          className="bg-lily text-white px-4 py-2 rounded-xl font-semibold text-xs hover:bg-lily/90 transition-colors shadow-sm"
        >
          Write a review
        </button>
      </div>

      <div className="space-y-0">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            isLast={index === reviews.length - 1}
            canEdit={currentUserId === review.user}
            onEdit={onReviewAction?.onEdit}
            onDelete={onReviewAction?.onDelete}
            onLike={onReviewAction?.onLike}
            isLiked={review.is_liked}
            likeCount={review.like_count}
          />
        ))}
      </div>
    </div>
  );
};

export { ReviewStars, ReviewCard };
export default ReviewList;