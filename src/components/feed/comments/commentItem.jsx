import React, { useState } from "react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";

const getInitials = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatShortDate = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const VerifiedCartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="ml-1 inline-block"
  >
    <path
      d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1Z"
      fill="#22c55e"
    />
    <circle
      cx="17"
      cy="15"
      r="5"
      fill="#22c55e"
      stroke="white"
      strokeWidth="1.5"
    />
    <path
      d="M15 15L16.5 16.5L19 13.5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CommentItem = ({ comment, onReply, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);

  const userName =
    comment.user || comment.user_name || comment.username || "User";
  const initials = getInitials(userName);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const commentBody =
    comment.text ||
    comment.comment ||
    comment.comment_text ||
    comment.content ||
    "";

  const displayTime =
    comment.timeAgo ||
    formatShortDate(comment.created_at || comment.date || comment.timestamp);

  const handleReplyClick = (e) => {
    e.stopPropagation();
    onReply({ user: userName, id: comment.id });
  };

  return (
    <div className={`flex space-x-3 py-3 ${isReply ? "ml-8 mt-1" : "mt-2"}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center font-semibold text-sm border border-gray-100">
        {comment.userpic || comment.profile_pic ? (
          <img
            src={comment.userpic || comment.profile_pic}
            alt={userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center flex-wrap">
          <p className="font-semibold text-[15px] text-gray-900">{userName}</p>
          {comment.is_buyer && <VerifiedCartIcon />}

          {comment.replyingTo && (
            <span className="flex items-center text-gray-500 text-[15px] mx-1">
              <span className="mx-1 text-gray-400 font-light">&gt;</span>
              <span className="text-gray-700">{comment.replyingTo}</span>
            </span>
          )}
        </div>

        <p className="text-[15px] text-gray-800 leading-snug mt-1 break-words pr-2">
          {commentBody}
        </p>

        <div className="flex items-center text-[13px] mt-2 text-gray-500 font-medium">
          <span className="mr-4 tracking-wide">{displayTime}</span>
          <button
            onClick={handleReplyClick}
            className="font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Reply
          </button>

          <div className="ml-auto flex items-center space-x-1.5 cursor-pointer pr-2">
            {comment.is_liked ? (
              <Heart
                size={16}
                fill="#ec4899"
                color="#ec4899"
                className="drop-shadow-sm"
              />
            ) : (
              <Heart size={16} color="#6b7280" />
            )}
            <span
              className={`text-[13px] ${comment.is_liked ? "text-pink-500 font-semibold" : "text-gray-500"}`}
            >
              {comment.likes || comment.like_count || 0}
            </span>
          </div>
        </div>

        {hasReplies && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2 text-gray-400 font-light">—</span>
              {showReplies ? (
                <>
                  Hide <ChevronUp size={14} className="ml-1" />
                </>
              ) : (
                <>
                  View {comment.replies.length} replies{" "}
                  <ChevronDown size={14} className="ml-1" />
                </>
              )}
            </button>
            {showReplies && (
              <div className="mt-1 space-y-1">
                {comment.replies.map((reply, index) => (
                  <CommentItem
                    key={
                      reply?.id
                        ? String(reply.id)
                        : `reply-${index}-${Date.now()}`
                    }
                    comment={reply}
                    onReply={onReply}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
