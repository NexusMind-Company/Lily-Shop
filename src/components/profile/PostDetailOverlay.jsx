import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MoreHorizontal,
  MessageCircle,
  Send,
  Share2,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  likeProduct,
  likeContent,
  recordProductView,
  recordContentView,
  deleteProductComment,
  deleteContentComment,
  deleteContentPost,
  deleteProductPost,
  followUser,
  unfollowUser,
} from "../../services/api";
import MentionSuggestions from "../common/MentionSuggestions";
import CommentsModal from "../feed/comments/commentsModal";
import ShareModal from "../feed/share/shareModal";
import toast from "react-hot-toast";

const parseIsLiked = (p) =>
  p?.is_liked === true || p?.is_liked === "true" || p?.has_liked === true;

const EngagementActions = ({
  item,
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onOpenComments,
  onOpenShare,
  onOpenMessage,
  showCounts = true,
  iconSize = 26,
}) => {
  return (
    <div className="flex items-center gap-5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike(item);
        }}
        className="flex items-center gap-1.5 group hover:opacity-70 transition-opacity"
      >
        <Heart
          size={iconSize}
          className={`transition-all ${
            isLiked ? "text-red-500 fill-current" : "text-black"
          }`}
        />
        {showCounts && likeCount > 0 && (
          <span className="text-sm font-bold">
            {likeCount.toLocaleString()}
          </span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenComments(item);
        }}
        className="flex items-center gap-1.5 group hover:opacity-70 transition-opacity"
      >
        <MessageCircle size={iconSize} className="text-black" />
        {showCounts && commentCount > 0 && (
          <span className="text-sm font-bold">
            {commentCount.toLocaleString()}
          </span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenMessage(item);
        }}
        className="flex items-center group hover:opacity-70 transition-opacity"
      >
        <Send size={iconSize} className="text-black" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenShare(item);
        }}
        className="flex items-center group hover:opacity-70 transition-opacity"
      >
        <Share2 size={iconSize} className="text-black" />
      </button>
    </div>
  );
};

const PostDetailOverlay = ({
  posts,
  initialIndex,
  onClose,
  onDeleteSuccess,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPost, setDropdownPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef(null);
  const post = posts[currentIndex];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

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
  const [isLiked, setIsLiked] = useState(parseIsLiked(post));
  const [likeCount, setLikeCount] = useState(
    Number(post?.like_count || post?.likes_count || post?.likes || 0),
  );
  const [commentCount, setCommentCount] = useState(
    Number(post?.comment_count || post?.comments_count || post?.comments || 0),
  );
  const [isFollowing, setIsFollowing] = useState(post?.is_following || false);

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeModalPost, setActiveModalPost] = useState(null);

  const isProduct =
    post?.itemType === "product" ||
    post?.type?.toLowerCase() === "product" ||
    post?.price !== undefined ||
    post?.price_in_naira !== undefined;

  useEffect(() => {
    // Scroll to the initial post on mobile
    if (containerRef.current && window.innerWidth < 768) {
      const element = document.getElementById(
        `post-${posts[initialIndex]?.id}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [initialIndex, posts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setDropdownPost(null);
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

      setIsLiked(parseIsLiked(post));
      setLikeCount(
        Number(post.like_count || post.likes_count || post.likes || 0),
      );
      setCommentCount(
        Number(post.comment_count || post.comments_count || post.comments || 0),
      );
    }
  }, [post, isProduct, dispatch]);

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

  const { mutate: toggleLike } = useMutation({
    mutationFn: async (target) => {
      const isTargetProduct =
        target.itemType === "product" ||
        target.type?.toLowerCase() === "product" ||
        target.price !== undefined ||
        target.price_in_naira !== undefined;
      if (isTargetProduct) {
        return likeProduct(target.id);
      } else {
        return likeContent(target.id);
      }
    },
    onMutate: async (target) => {
      if (!isAuthenticated) return;

      const isCurrentPost = target.id === post?.id;

      if (isCurrentPost) {
        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;
        const newIsLiked = !previousIsLiked;
        const newLikeCount = newIsLiked
          ? previousLikeCount + 1
          : Math.max(0, previousLikeCount - 1);

        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);
        return { previousIsLiked, previousLikeCount, isCurrentPost: true };
      }

      return { isCurrentPost: false };
    },
    onError: (err, target, context) => {
      if (context?.isCurrentPost) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);
      }
      toast.error("Failed to update like");
    },
    onSuccess: (data, target) => {
      if (target.id === post?.id && data && data.like_count !== undefined) {
        setLikeCount(Number(data.like_count));
      }
    },
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async (userId) => {
      if (isFollowing) {
        return unfollowUser(userId);
      } else {
        return followUser(userId);
      }
    },
    onMutate: async () => {
      const prevFollowing = isFollowing;
      setIsFollowing(!prevFollowing);
      return { prevFollowing };
    },
    onError: (err, userId, context) => {
      setIsFollowing(context.prevFollowing);
      toast.error("Failed to update follow status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
    },
  });

  const handleFollow = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleFollow(post.user_id || post.user?.id);
  };

  const handleLike = (targetPost) => {
    if (!isAuthenticated) return navigate("/login");
    toggleLike(targetPost || post);
  };

  const handleOpenComments = (targetPost) => {
    setActiveModalPost(targetPost || post);
    setShowCommentsModal(true);
  };

  const handleOpenShare = (targetPost) => {
    setActiveModalPost(targetPost || post);
    setShowShareModal(true);
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
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
      setCommentCount((prev) => prev + 1);
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
      setCommentCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    const postToDelete = dropdownPost || post;
    if (!isAuthenticated || isDeleting || !postToDelete) return;

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      const isTargetProduct =
        postToDelete?.itemType === "product" ||
        postToDelete?.type?.toLowerCase() === "product" ||
        postToDelete?.price !== undefined ||
        postToDelete?.price_in_naira !== undefined;
      if (isTargetProduct) {
        await deleteProductPost(postToDelete.id);
      } else {
        await deleteContentPost(postToDelete.id);
      }
      toast.success("Post deleted successfully");
      setShowDropdown(false);
      setDropdownPost(null);
      if (onDeleteSuccess) {
        onDeleteSuccess(postToDelete.id);
      }
      if (window.innerWidth >= 768) {
        onClose();
      }
    } catch (error) {
      toast.error("Failed to delete post");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const MobilePostItem = ({ item }) => {
    const itemMediaSrc =
      item.image_url || item.media || item.image || "/placeholder.png";
    const itemIsVideo =
      item.is_video ||
      (typeof itemMediaSrc === "string" && itemMediaSrc.endsWith(".mp4"));

    const [localIsLiked, setLocalIsLiked] = useState(parseIsLiked(item));
    const [localLikeCount, setLocalLikeCount] = useState(
      Number(item.like_count || item.likes_count || item.likes || 0),
    );

    const handleLocalLike = async (target) => {
      if (!isAuthenticated) return navigate("/login");

      const prevLiked = localIsLiked;
      const prevCount = localLikeCount;

      setLocalIsLiked(!prevLiked);
      setLocalLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

      try {
        const isTargetProduct =
          target.itemType === "product" ||
          target.type?.toLowerCase() === "product" ||
          target.price !== undefined ||
          target.price_in_naira !== undefined;

        if (isTargetProduct) {
          await likeProduct(target.id);
        } else {
          await likeContent(target.id);
        }
      } catch (error) {
        setLocalIsLiked(prevLiked);
        setLocalLikeCount(prevCount);
        toast.error("Failed to update like");
      }
    };

    return (
      <div
        id={`post-${item.id}`}
        className="bg-white border-b border-gray-100 last:border-b-0 pb-6"
      >
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <img
              src={item.userpic || "/profile-icon.svg"}
              alt={item.username}
              className="w-8 h-8 rounded-full object-cover border border-gray-100"
            />
            <span className="font-bold text-sm">@{item.username}</span>
          </div>
          <button
            onClick={() => {
              setDropdownPost(item);
              setShowDropdown(true);
            }}
            className="text-black"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Media */}
        <div className="w-full bg-white aspect-square flex items-center justify-center overflow-hidden">
          {itemIsVideo ? (
            <video
              src={itemMediaSrc}
              className="w-full h-full object-cover"
              controls
              muted
            />
          ) : (
            <img
              src={itemMediaSrc}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <EngagementActions
            item={item}
            isLiked={localIsLiked}
            likeCount={localLikeCount}
            commentCount={Number(
              item.comment_count || item.comments_count || item.comments || 0,
            )}
            onLike={handleLocalLike}
            onOpenComments={handleOpenComments}
            onOpenShare={handleOpenShare}
            onOpenMessage={() => navigate(`/chat/${item.user_id}`)}
          />
        </div>

        {/* Caption */}
        <div className="px-4 text-sm leading-snug">
          <span className="font-bold mr-2">@{item.username}</span>
          <span className="text-black">
            {item.caption || item.name}
            {(item.caption || item.name)?.length > 60 && (
              <button className="text-gray-500 ml-1">... more</button>
            )}
          </span>
        </div>

        {/* Date */}
        <div className="px-4 mt-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            {new Date(item.created_at).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    );
  };

  const mediaSrc =
    post?.image_url || post?.media || post?.image || "/placeholder.png";

  const isVideo =
    post?.is_video ||
    (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-0 md:p-4 lg:p-10"
      onClick={onClose}
    >
      {/* Close Button - Desktop Only */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-60 hidden md:block"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Navigation Carets - Desktop Only */}
      {currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-60 hidden md:block"
          onClick={handlePrev}
        >
          <ChevronLeft size={48} />
        </button>
      )}
      {currentIndex < posts.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-60 hidden md:block"
          onClick={handleNext}
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Main Container */}
      <div
        ref={containerRef}
        className="flex flex-col md:flex-row w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-white overflow-y-auto md:overflow-hidden md:rounded-2xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Title Bar */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-30">
          <button onClick={onClose} className="p-1 -ml-1">
            <ChevronLeft size={28} className="text-black" />
          </button>
          <h2 className="font-bold text-lg">Post</h2>
          <div className="w-7" /> {/* Spacer */}
        </div>

        {/* Mobile View: Scrollable Feed */}
        <div className="md:hidden flex-1 pb-24">
          {posts.map((item) => (
            <MobilePostItem key={item.id} item={item} />
          ))}
        </div>

        {/* Desktop View: Side-by-Side (Hidden on Mobile) */}
        <div className="hidden md:flex w-full h-full">
          {/* Left Side: Media */}
          <div className="w-full md:flex-1 bg-white flex items-center justify-center relative min-h-75 md:min-h-0">
            {isVideo ? (
              <video
                src={mediaSrc}
                className="w-full md:max-w-full md:max-h-full object-contain"
                controls
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                src={mediaSrc}
                alt="Post media"
                className="w-full md:max-w-full md:max-h-full object-contain"
              />
            )}
          </div>

          {/* Right Side: Info & Comments */}
          <div className="w-full md:w-112.5 bg-white flex flex-col md:border-l border-gray-100 text-black">
            {/* Header - Desktop Only */}
            <div className="hidden md:flex p-4 items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={post.userpic || "/profile-icon.svg"}
                  alt={post.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <span className="font-bold text-[15px]">@{post.username}</span>
                {currentUserId !== (post.user_id || post.user?.id) && (
                  <>
                    <span className="text-black">•</span>
                    <button
                      onClick={handleFollow}
                      className="text-lily text-sm font-bold hover:opacity-80 transition-opacity"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownPost(post);
                    setShowDropdown(true);
                  }}
                  className="text-black"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Body: Caption & Comments */}
            <div className="flex-1 md:overflow-y-auto p-4 custom-scrollbar">
              {/* Caption */}
              <div className="flex gap-3 mb-6">
                <img
                  src={post.userpic || "/profile-icon.svg"}
                  alt={post.username}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
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
            <div className="p-4 border-t border-gray-100 space-y-3 bg-white relative">
              <div className="flex items-center justify-between">
                <EngagementActions
                  item={post}
                  isLiked={isLiked}
                  likeCount={likeCount}
                  commentCount={commentCount}
                  onLike={handleLike}
                  onOpenComments={handleOpenComments}
                  onOpenShare={handleOpenShare}
                  onOpenMessage={() => navigate(`/chat/${post.user_id}`)}
                />
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
                className="pt-3 flex items-center gap-3 border-t border-gray-100 mt-2"
              >
                <div className="w-8 h-8 rounded-full bg-white overflow-hidden shrink-0 border border-gray-100">
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
      </div>

      {/* Centered Menu Modal */}
      <AnimatePresence>
        {showDropdown && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
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
              className="bg-white rounded-2xl overflow-hidden w-full max-w-sm z-10 border border-gray-100"
            >
              {currentUserId === post.user_id ? (
                <>
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full py-4 text-red-600 font-bold border-b border-gray-100 hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full py-4 text-red-600 font-bold border-b border-gray-100 hover:bg-white transition-colors">
                    Report
                  </button>
                  <button className="w-full py-4 text-black border-b border-gray-100 hover:bg-white transition-colors">
                    Unfollow
                  </button>
                </>
              )}
              <button className="w-full py-4 text-black border-b border-gray-100 hover:bg-white transition-colors">
                Share to...
              </button>
              <button
                className="w-full py-4 text-black border-b border-gray-100 hover:bg-white transition-colors"
                onClick={() => {
                  const postUrl = `${window.location.origin}/product/${post.id}`;
                  navigator.clipboard.writeText(postUrl);
                  toast.success("Link copied!");
                  setShowDropdown(false);
                }}
              >
                Copy link
              </button>
              <button
                className="w-full py-4 text-black font-bold hover:bg-white transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCommentsModal && activeModalPost && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={() => {
              setShowCommentsModal(false);
              setActiveModalPost(null);
            }}
            postId={activeModalPost.id}
            itemType={
              activeModalPost.itemType === "product" ||
              activeModalPost.type?.toLowerCase() === "product" ||
              activeModalPost.price !== undefined ||
              activeModalPost.price_in_naira !== undefined
                ? "product"
                : "content"
            }
          />
        )}

        {showShareModal && activeModalPost && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setActiveModalPost(null);
            }}
            postUrl={`${window.location.origin}/?postId=${activeModalPost.id}`}
            postCaption={activeModalPost.caption || activeModalPost.name}
            post={activeModalPost}
            isProduct={
              activeModalPost.itemType === "product" ||
              activeModalPost.type?.toLowerCase() === "product" ||
              activeModalPost.price !== undefined ||
              activeModalPost.price_in_naira !== undefined
            }
          />
        )}
      </AnimatePresence>

      <style>{`
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
