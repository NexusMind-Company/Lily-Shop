import { useState } from "react";
import StarRating from "./StarRating";

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

const ReviewList = ({ reviews, onWriteReview }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm mb-3">No reviews yet</p>
        <button
          onClick={onWriteReview}
          className="text-lily font-medium text-sm hover:underline"
        >
          Be the first to write a review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Reviews</h3>
        <button
          onClick={onWriteReview}
          className="text-sm font-medium text-lily hover:text-lily/80 transition-colors"
        >
          Write a review
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lily/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-lily">
                    {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {review.user_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(review.created_at)}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} size={16} interactive={false} />
            </div>

            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;