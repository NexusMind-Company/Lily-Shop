import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const getInitials = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Renders a single comment, including its nested replies.
 */
const CommentItem = ({ comment, onReply, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const initials = getInitials(comment.user);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReplyClick = (e) => {
    e.stopPropagation();
    onReply({ user: comment.user, id: comment.id });
  };

  return (
    <div
      className={`flex space-x-3 py-2 ${
        isReply ? "ml-6 border-l-2 border-gray-100 pl-4" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm">
        {comment.userpic ? (
          <img
            src={comment.userpic}
            alt={comment.user}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment Body */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex justify-between items-center text-xs">
            <p className="font-semibold text-gray-800">{comment.user}</p>
            <span className="text-gray-500">{comment.timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {comment.replyingTo && (
              <span className="text-lily font-semibold mr-1">
                @{comment.replyingTo}
              </span>
            )}
            {comment.text}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 text-xs mt-1 text-gray-500 pl-2">
          <button
            onClick={handleReplyClick}
            className="font-semibold hover:text-lily transition-colors"
          >
            Reply
          </button>
          <span className="flex items-center space-x-1">
            <img
              src="/icons/heart-outline.svg"
              alt="Likes"
              className="w-3 h-3"
            />
            <span>{comment.likes}</span>
          </span>
        </div>

        {/* Reply Toggle & Rendering */}
        {hasReplies && (
          <>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center text-xs font-semibold text-lily mt-2 transition-colors pl-2"
            >
              {showReplies ? (
                <>
                  <ChevronUp size={14} className="mr-1" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="mr-1" />
                  View {comment.replies.length} replies
                </>
              )}
            </button>
            {showReplies && (
              <div className="mt-2 space-y-1">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
