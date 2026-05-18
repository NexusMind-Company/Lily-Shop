import React from "react";
import { Star, ThumbsUp } from "lucide-react";

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
  if (!fullName) return "";
  const parts = String(fullName).split(" ").filter((part) => part.length > 0);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const ReviewStars = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }
      />
    ))}
  </div>
);

const ProductReview = ({ review }) => {
  const initials = getInitials(review.user_name || review.user || "Anonymous");
  const timeAgo = formatTimeAgo(review.created_at || review.date);
  const rating = Number(review.rating || 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4eb75e] to-green-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-gray-900 truncate">
                {review.user_name || review.user || "Anonymous"}
              </p>
              <div className="flex items-center gap-1">
                <ReviewStars rating={rating} size={14} />
                <span className="text-xs font-semibold text-amber-500 ml-0.5">
                  {rating > 0 ? rating.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed pl-14">
          {review.comment}
        </p>
      )}

      {review.helpful_count > 0 && (
        <div className="mt-3 pl-14 flex items-center gap-1.5">
          <ThumbsUp size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {review.helpful_count} found this helpful
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductReview;