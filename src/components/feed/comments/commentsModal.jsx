import React, { useEffect, useState, useRef, useMemo } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  postComment,
  addLocalComment,
  clearComments,
  toggleCommentLike,
} from "../../../redux/feedCommentSlice";
import CommentItem from "../comments/commentItem";
import { CommentSkeleton } from "../../common/skeletons";
import { useNavigate } from "react-router-dom";
import {
  deleteProductComment,
  deleteContentComment,
} from "../../../services/api";
import MentionSuggestions from "../../common/MentionSuggestions";

const countNodes = (nodes) => {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((acc, node) => {
    return acc + 1 + countNodes(node.replies);
  }, 0);
};

const CommentsModal = ({
  isOpen,
  onClose,
  postId,
  itemType,
  totalComments,
  onCommentCountUpdate,
}) => {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);

  const authState = useSelector((state) => state.auth);
  const profileState = useSelector((state) => state.profile);

  // Clean, exact data targeting based on your slices
  const currentUserId =
    profileState?.data?.user?.id || authState?.user_data?.id;
  const currentUser = profileState?.data?.user || authState?.user_data || null;
  const isAuthenticated = authState?.isAuthenticated;

  const rawComments = useSelector((state) => state.feedComments.comments);
  const commentsStatus = useSelector(
    (state) => state.feedComments.commentsStatus,
  );

  const commentsList = useMemo(() => {
    return Array.isArray(rawComments)
      ? rawComments
      : rawComments?.results || [];
  }, [rawComments]);

  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [inputHeight, setInputHeight] = useState("auto");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && postId) {
      dispatch(clearComments());
      dispatch(fetchComments({ postId, itemType }));
    }
  }, [isOpen, postId, itemType, dispatch]);

  useEffect(() => {
    if (commentsStatus === "succeeded" || commentsList.length > 0) {
      const realCount = countNodes(commentsList);
      if (onCommentCountUpdate) {
        onCommentCountUpdate(realCount);
      }
    }
  }, [commentsList, commentsStatus, onCommentCountUpdate]);

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
    const pos = e.target.selectionStart;
    setCursorPos(pos);

    if (replyTarget && !text.startsWith(`@${replyTarget.user}`)) {
      setReplyTarget(null);
    }

    // Check for @ mention trigger
    const textBeforeCursor = text.substring(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      // Trigger if @ is at start or after a space
      const charBeforeAt = textBeforeCursor.charAt(lastAtIndex - 1);
      const isStartOrSpace = lastAtIndex === 0 || /\s/.test(charBeforeAt);

      if (isStartOrSpace) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(" ")) {
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    setCommentText(text);
  };

  const handleSelectionChange = (e) => {
    setCursorPos(e.target.selectionStart);
  };

  const handleSelectMention = (username) => {
    const textBeforeCursor = commentText.substring(0, cursorPos);
    const textAfterCursor = commentText.substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const newText =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${username} ` +
      textAfterCursor;

    setCommentText(newText);
    setShowMentions(false);

    // Set focus back and move cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = lastAtIndex + username.length + 2; // +1 for @, +1 for space
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleLikeComment = (commentId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleCommentLike({ commentId, postId, itemType }));
  };

  const handleDeleteComment = async (commentId, _isReply) => {
    if (!isAuthenticated) return;

    try {
      if (itemType === "product") {
        await deleteProductComment(commentId);
      } else {
        await deleteContentComment(commentId);
      }
      dispatch(fetchComments({ postId, itemType }));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const trimmedText = commentText.trim();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!trimmedText || isPosting) {
      return;
    }

    setIsPosting(true);

    const finalCommentText =
      replyTarget && trimmedText.startsWith(`@${replyTarget.user}`)
        ? trimmedText.substring(`@${replyTarget.user} `.length).trim()
        : trimmedText;

    const currentUserName =
      currentUser?.username ||
      currentUser?.full_name ||
      currentUser?.name ||
      currentUser?.email ||
      "User";

    const newComment = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_name: currentUserName,
      userpic:
        currentUser?.profile_pic ||
        currentUser?.userpic ||
        currentUser?.image ||
        null,
      comment_text: finalCommentText,
      timeAgo: "Just now",
      like_count: 0,
      is_liked: false,
      replies: [],
      postId: postId,
      itemType: itemType,
      parent: replyTarget ? replyTarget.id : null,
      replyingTo: replyTarget ? replyTarget.user : null,
    };

    dispatch(addLocalComment(newComment));

    try {
      await dispatch(postComment(newComment)).unwrap();
    } catch (error) {
      console.error("Failed to post comment:", error);
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
          className="fixed inset-0 z-60 bg-black/50 flex justify-center items-end"
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
            <div className="relative p-4 border-b border-gray-200 shrink-0">
              <h2 className="text-center font-bold text-lg text-gray-800">
                {commentsList.length > 0
                  ? countNodes(commentsList)
                  : totalComments}{" "}
                comments
              </h2>
              <button
                onClick={onClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {commentsStatus === "loading" && commentsList.length === 0 && (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              )}
              {commentsStatus === "succeeded" && commentsList.length === 0 && (
                <p className="text-center text-gray-500">
                  Be the first to comment!
                </p>
              )}
              {commentsList.length > 0 &&
                commentsList.map((comment, index) => (
                  <CommentItem
                    key={
                      comment?.id
                        ? String(comment.id)
                        : `comment-${index}-${Date.now()}`
                    }
                    comment={comment}
                    onReply={handleReplyTag}
                    onLike={handleLikeComment}
                    onDelete={handleDeleteComment}
                    currentUserId={currentUserId}
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
              className="p-4 border-t border-gray-200 bg-white shrink-0 relative"
            >
              <MentionSuggestions
                isOpen={showMentions}
                onClose={() => setShowMentions(false)}
                inputValue={commentText}
                cursorPosition={cursorPos}
                onSelect={handleSelectMention}
              />
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
                <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0">
                  {(currentUser?.profile_pic ||
                    currentUser?.userpic ||
                    currentUser?.image) && (
                    <img
                      src={
                        currentUser.profile_pic ||
                        currentUser.userpic ||
                        currentUser.image
                      }
                      alt="You"
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={handleCommentChange}
                  onSelect={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  placeholder="Add a comment..."
                  rows={1}
                  style={{ height: inputHeight }}
                  className="flex-1 resize-none border-0 focus:ring-0 text-gray-800 p-2 rounded-lg bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isPosting}
                  className="p-2 rounded-full transition-colors shrink-0 disabled:bg-gray-200 disabled:text-gray-500 bg-lily text-white"
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
