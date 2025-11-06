import React, { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  postComment,
  addLocalComment,
  clearComments,
} from "../../../redux/feedCommentSlice";
import CommentItem from "../comments/commentItem";
import { CommentSkeleton } from "../../common/skeletons";
import { Navigate } from "react-router";

const CommentsModal = ({
  isOpen,
  onClose,
  postId,
  itemType,
  totalComments,
}) => {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user_data);

  const comments = useSelector((state) => state.feedComments.comments);
  const commentsStatus = useSelector(
    (state) => state.feedComments.commentsStatus
  );

  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [inputHeight, setInputHeight] = useState("auto");

  useEffect(() => {
    if (isOpen && postId) {
      // Pass both postId and itemType to the thunk
      dispatch(fetchComments({ postId, itemType }));
    }
  }, [isOpen, postId, itemType, dispatch]); // Add itemType dependency

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        dispatch(clearComments());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 100);
      textareaRef.current.style.height = `${newHeight}px`;
      setInputHeight(newHeight);
    }
  }, [commentText]);

  const handleReplyTag = ({ user, id }) => {
    setReplyTarget({ user, id });
    setCommentText(`@${user} `);
    textareaRef.current?.focus();
  };

  const handleCommentChange = (e) => {
    const text = e.target.value;
    if (replyTarget && !text.startsWith(`@${replyTarget.user}`)) {
      setReplyTarget(null);
    }
    setCommentText(text);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const trimmedText = commentText.trim();
    if (!trimmedText || isPosting || !currentUser) {
      if (!currentUser) {
        // You can replace this with a toast notification
        alert("Please log in to comment.");
        Navigate("/login");
      }
      return;
    }

    setIsPosting(true);

    const finalCommentText =
      replyTarget && trimmedText.startsWith(`@${replyTarget.user}`)
        ? trimmedText.substring(`@${replyTarget.user} `.length).trim()
        : trimmedText;

    const newComment = {
      id: `local_${Date.now()}`,
      user: currentUser.name,
      userpic: currentUser.userpic,
      text: finalCommentText,
      timeAgo: "Just now",
      likes: 0,
      replies: [],
      postId: postId,
      itemType: itemType, // Pass itemType to the thunk
      parentId: replyTarget ? replyTarget.id : null,
      replyingTo: replyTarget ? replyTarget.user : null,
    };

    dispatch(addLocalComment(newComment));

    try {
      await dispatch(postComment(newComment)).unwrap();
    } catch (error) {
      console.error("Failed to post comment:", error);
      // You can dispatch an action here to remove the local comment or mark it as failed
    }

    setCommentText("");
    setReplyTarget(null);
    setIsPosting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex justify-center items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-xl bg-white rounded-t-3xl shadow-2xl h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-center font-bold text-lg text-gray-800">
                {totalComments} comments
              </h2>
              <button
                onClick={onClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {commentsStatus === "loading" && (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              )}
              {commentsStatus === "succeeded" && comments.length === 0 && (
                <p className="text-center text-gray-500">
                  Be the first to comment!
                </p>
              )}
              {commentsStatus === "succeeded" &&
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReplyTag}
                  />
                ))}
              {commentsStatus === "failed" && (
                <p className="text-center text-red-500">
                  Failed to load comments.
                </p>
              )}
            </div>
            <form
              onSubmit={handleSubmitComment}
              className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
            >
              {replyTarget && (
                <div className="text-sm text-gray-600 mb-2 flex items-center">
                  Replying to
                  <span className="font-semibold text-lily mx-1">
                    {replyTarget.user}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTarget(null);
                      setCommentText("");
                    }}
                    className="ml-1 text-red-500 hover:text-red-700 text-xs"
                  >
                    (Cancel)
                  </button>
                </div>
              )}
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0">
                  {/* You can put currentUser.userpic here */}
                </div>
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={handleCommentChange}
                  placeholder="Add a comment..."
                  rows={1}
                  style={{ height: inputHeight }}
                  className="flex-1 resize-none border-0 focus:ring-0 text-gray-800 p-2 rounded-lg bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isPosting}
                  className="p-2 rounded-full transition-colors flex-shrink-0 disabled:bg-gray-200 disabled:text-gray-500 bg-lily text-white"
                >
                  {isPosting ? (
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;
