import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  postComment,
  addLocalComment,
  clearComments,
  toggleCommentLike,
} from "../../redux/feedCommentSlice";
import CommentItem from "../feed/comments/commentItem";
import { CommentSkeleton } from "../common/skeletons";
import { useNavigate } from "react-router-dom";
import {
  likeProduct,
  likeContent,
  recordProductView,
  recordContentView,
  deleteProductComment,
  deleteContentComment,
} from "../../services/api";
import MentionSuggestions from "../common/MentionSuggestions";
import toast from "react-hot-toast";

const PostDetailOverlay = ({ posts, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showDropdown, setShowDropdown] = useState(false);
  const post = posts[currentIndex];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  const authState = useSelector((state) => state.auth);
  const profileState = useSelector((state) => state.profile);
  const { comments, commentsStatus } = useSelector(
    (state) => state.feedComments,
  );

  const currentUserId =
    profileState?.data?.user?.id || authState?.user_data?.id;
  const currentUser = profileState?.data?.user || authState?.user_data || null;
  const isAuthenticated = authState?.isAuthenticated;

  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLiked, setIsLiked] = useState(post?.is_liked);
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  const isProduct = post?.itemType === "product" || post?.type === "product";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (post?.id) {
      dispatch(clearComments());
      dispatch(
        fetchComments({
          postId: post.id,
          itemType: isProduct ? "product" : "content",
        }),
      );

      // Record view
      const recordView = isProduct ? recordProductView : recordContentView;
      recordView(post.id).catch(console.error);

      setIsLiked(post.is_liked);
      setLikeCount(post.like_count || 0);
    }
  }, [post?.id, isProduct, dispatch]);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return navigate("/login");

    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      if (isProduct) {
        await likeProduct(post.id);
      } else {
        await likeContent(post.id);
      }
    } catch (error) {
      setIsLiked(prevLiked);
      setLikeCount(post.like_count || 0);
      toast.error("Failed to update like");
    }
  };

  const handleCommentChange = (e) => {
    const text = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPos(pos);
    setCommentText(text);

    // Basic mention trigger logic (simplified from CommentsModal)
    const textBeforeCursor = text.substring(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const charBeforeAt = textBeforeCursor.charAt(lastAtIndex - 1);
      if (lastAtIndex === 0 || /\s/.test(charBeforeAt)) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(" ")) {
          setShowMentions(true);
          return;
        }
      }
    }
    setShowMentions(false);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isPosting || !isAuthenticated) return;

    setIsPosting(true);
    const newComment = {
      id: `local_${Date.now()}`,
      user_name: currentUser?.username || "User",
      userpic: currentUser?.profile_pic || null,
      comment_text: commentText.trim(),
      timeAgo: "Just now",
      like_count: 0,
      is_liked: false,
      replies: [],
      postId: post.id,
      itemType: isProduct ? "product" : "content",
    };

    dispatch(addLocalComment(newComment));
    try {
      await dispatch(postComment(newComment)).unwrap();
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    if (!isAuthenticated) return navigate("/login");
    dispatch(
      toggleCommentLike({
        commentId,
        postId: post.id,
        itemType: isProduct ? "product" : "content",
      }),
    );
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) return;
    try {
      if (isProduct) {
        await deleteProductComment(commentId);
      } else {
        await deleteContentComment(commentId);
      }
      dispatch(
        fetchComments({
          postId: post.id,
          itemType: isProduct ? "product" : "content",
        }),
      );
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const mediaSrc =
    post?.image_url || post?.media || post?.image || "/placeholder.png";

  const isVideo =
    post?.is_video ||
    (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-10"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-60"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Navigation Carets */}
      {currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-60"
          onClick={handlePrev}
        >
          <ChevronLeft size={48} />
        </button>
      )}
      {currentIndex < posts.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-60"
          onClick={handleNext}
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Main Container */}
      <div
        className="flex flex-col md:flex-row w-full max-w-6xl h-full max-h-[90vh] bg-white overflow-hidden rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Media */}
        <div className="flex-1 bg-white flex items-center justify-center relative min-h-[300px] md:min-h-0">
          {isVideo ? (
            <video
              src={mediaSrc}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              loop
              muted
            />
          ) : (
            <img
              src={mediaSrc}
              alt="Post media"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Right Side: Info & Comments */}
        <div className="w-full md:w-[450px] bg-white flex flex-col border-l border-black text-black">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-black">
            <div className="flex items-center gap-3">
              <img
                src={post.userpic || "/profile-icon.svg"}
                alt={post.username}
                className="w-10 h-10 rounded-full object-cover border border-black"
              />
              <span className="font-bold text-[15px]">@{post.username}</span>
              <span className="text-black">•</span>
              <button className="text-lily text-sm font-bold hover:opacity-80 transition-opacity">
                Follow
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(true)}
                className="text-black"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Body: Caption & Comments */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Caption */}
            <div className="flex gap-3 mb-6">
              <img
                src={post.userpic || "/profile-icon.svg"}
                alt={post.username}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-black"
              />
              <div className="text-[15px] leading-snug">
                <span className="font-bold mr-2">@{post.username}</span>
                <span className="text-black whitespace-pre-wrap">
                  {post.caption || post.name}
                </span>
                <div className="mt-2 text-xs text-gray-500 font-bold">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-1">
              {commentsStatus === "loading" && <CommentSkeleton count={3} />}
              {commentsStatus === "succeeded" && comments.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-10">
                  Be the first to comment!
                </p>
              )}
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={{
                    ...comment,
                    comment_text: comment.comment_text || comment.text,
                  }}
                  currentUserId={currentUserId}
                  onLike={() => handleLikeComment(comment.id)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onReply={() => {
                    setCommentText(`@${comment.user_name} `);
                    textareaRef.current?.focus();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer: Actions & Input */}
          <div className="p-4 border-t border-black space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Heart
                    size={26}
                    className={
                      isLiked ? "text-lily fill-current" : "text-black"
                    }
                  />
                </button>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-bold text-black">
                {likeCount.toLocaleString()} likes
              </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleSubmitComment}
              className="pt-3 flex items-center gap-3 border-t border-black mt-2"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-black">
                {currentUser?.profile_pic && (
                  <img
                    src={currentUser.profile_pic}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-1 resize-none max-h-24 text-black placeholder:text-gray-400 font-medium"
                rows={1}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isPosting}
                className="text-lily font-bold text-sm disabled:opacity-30 hover:opacity-80 transition-opacity"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Centered Menu Modal */}
      <AnimatePresence>
        {showDropdown && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl overflow-hidden w-full max-w-sm z-10 border border-black"
            >
              {currentUserId === post.user_id && (
                <>
                  <button className="w-full py-4 text-red-600 font-bold border-b border-black hover:bg-gray-50 transition-colors">
                    Delete
                  </button>
                  <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                    Hide like count to others
                  </button>
                  <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                    Turn off commenting
                  </button>
                </>
              )}
              <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                Go to post
              </button>
              <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                Share to...
              </button>
              <button
                className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const postUrl = `${window.location.origin}/product/${post.id}`;
                  navigator.clipboard.writeText(postUrl);
                  toast.success("Link copied!");
                  setShowDropdown(false);
                }}
              >
                Copy link
              </button>
              <button className="w-full py-4 text-black border-b border-black hover:bg-gray-50 transition-colors">
                About this account
              </button>
              <button
                className="w-full py-4 text-black font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e5e5e5;
        }
      `}</style>
    </div>
  );
};

export default PostDetailOverlay;
