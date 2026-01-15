import { useState, useRef, useEffect } from "react";
<<<<<<< HEAD
import { useMutation, useQueryClient } from "@tanstack/react-query";
=======
import { useMutation } from "@tanstack/react-query";
>>>>>>> origin/master
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import MediaCarousel from "../common/mediaCarousel";
import VideoPlayer from "./videoPlayer";
import CommentsModal from "./comments/commentsModal";
import ShareModal from "./share/shareModal";
<<<<<<< HEAD
import { likeProduct, likeContent, followUser } from "../../services/api";
=======
import {
  likeProduct,
  likeContent,
  followUser,
} from "../../services/api";
>>>>>>> origin/master

const DESCRIPTION_CHAR_LIMIT = 30;
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

<<<<<<< HEAD
const FeedItem = ({ post, onVideoInit }) => {
  const mediaRef = useRef(null);

  // --- DEBUG: Check for User ID ---
  // If this logs "undefined", the backend is definitely not sending it.
  useEffect(() => {
    if (!post.user_id && !post.userId) {
      console.warn(`[FeedItem] Warning: No UUID found for post ${post.id}. Follow feature disabled.`);
    }
  }, [post]);

  const mediaArray = Array.isArray(post?.media)
    ? post.media
    : post?.media
    ? [
        {
          src: post.media,
          type:
            typeof post.media === "string" &&
            (post.media.endsWith(".mp4") ||
              post.media.endsWith(".mov") ||
              post.media.endsWith(".webm"))
              ? "video"
              : "image",
        },
      ]
    : [];

  const isVideo =
    mediaArray[0]?.type === "video" ||
    (typeof mediaArray[0]?.src === "string" &&
      mediaArray[0].src.match(/\.(mp4|mov|webm)$/i));

  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  // State
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isFollowed, setIsFollowed] = useState(post.is_followed || false);
  
  const [likeCount, setLikeCount] = useState(
    post.like_count || post.likes_count || post.likes || 0
  );
  
  const commentCount = post.comment_count || post.comments_count || post.comments || 0;
=======
const FeedItem = ({ post, onVideoInit, isActive }) => {
  const mediaRef = useRef(null);

  // ========================================
  // BACKEND FIELD MAPPING (From serializers.py)
  // ========================================
  // Backend returns:
  // - all_media_urls: ["url1", "url2"] (array of strings)
  // - media_url: "single_url" (for products)
  // - image_url: "single_url" (for content)
  // ========================================

  const mediaArray = (() => {
    // Priority 1: all_media_urls (array from backend)
    if (Array.isArray(post?.all_media_urls) && post.all_media_urls.length > 0) {
      return post.all_media_urls.map(url => ({
        src: url,
        type: url.match(/\.(mp4|mov|webm)$/i) ? "video" : "image"
      }));
    }
    
    // Priority 2: media_url or image_url (single media)
    const singleUrl = post?.media_url || post?.image_url;
    if (singleUrl) {
      return [{
        src: singleUrl,
        type: singleUrl.match(/\.(mp4|mov|webm)$/i) ? "video" : "image"
      }];
    }
    
    // Fallback: empty array
    return [];
  })();

  const isVideo = mediaArray[0]?.type === "video";

  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  // ========================================
  // STATE INITIALIZATION - MATCH BACKEND
  // ========================================
  // Backend serializer returns:
  // - is_liked: boolean
  // - like_count: number (annotated)
  // - comment_count: number (annotated)
  // - views: number (from hit_count.hits)
  // - user: string (username)
  // - user_id: uuid
  // ========================================
  
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isFollowed, setIsFollowed] = useState(post.is_following || false);
  const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
  const [commentCount, setCommentCount] = useState(Number(post.comment_count || 0));
  const [viewCount, setViewCount] = useState(Number(post.views || 0));
>>>>>>> origin/master

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user_data } = useSelector((state) => state.auth);

<<<<<<< HEAD
  // User Data resolution
  const displayUsername = post.username || post.user || "Unknown User";
  
  // Try to find ANY ID. If post.user is a string (username), this will be wrong for the ID endpoint.
  const profileId = post.user_id || post.userId; 
  
  // Only enable profile link if we have an ID, otherwise standard link might fail
  const profileLink = profileId ? `/profile/${profileId}` : "#";

  const isOwnPost = user_data?.username === displayUsername;
  const isProduct = post.type === "product" || post.price != null;

  // --- LIKE MUTATION ---
=======
  // ========================================
  // USER INFO - MATCH BACKEND STRUCTURE
  // ========================================
  // Backend can return user as:
  // 1. String (username) - from StringRelatedField
  // 2. Object { id, username, ... } - from UserSerializer
  // ========================================
  
  const displayUsername = typeof post.user === 'string' 
    ? post.user 
    : post.user?.username || post.username || "Unknown User";
    
  const profilePic = post.user?.image_url || post.user?.profile_pic || "/profile-icon.svg";
  const profileId = post.user_id || post.user?.id;
  const profileLink = profileId ? `/profile/${profileId}` : "#";

  const isOwnPost = user_data?.username === displayUsername;
  
  // ========================================
  // DETERMINE POST TYPE
  // ========================================
  // Products: have 'price' field (number)
  // Content: have 'post_type' field ('FUN' or 'SELLING')
  // ========================================
  
  const isProduct = post.price !== null && post.price !== undefined;
  const isSellingContent = post.post_type === 'SELLING';

  // View tracking - optimistic UI update only (backend uses hitcount middleware)
  useEffect(() => {
    if (!isActive) return;
    
    let tracked = false;
    const timer = setTimeout(() => {
      if (!tracked) {
        tracked = true;
        setViewCount(prev => prev + 1);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isActive, post.id]);

>>>>>>> origin/master
  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      if (isProduct) {
        return likeProduct(post.id);
      } else {
        return likeContent(post.id);
      }
    },
    onMutate: async () => {
      if (!isAuthenticated) return;
      const previousIsLiked = isLiked;
<<<<<<< HEAD
      const previousLikeCount = Number(likeCount);

      // Optimistic update
      setIsLiked(!previousIsLiked);
      setLikeCount(
        !previousIsLiked
          ? previousLikeCount + 1
          : Math.max(0, previousLikeCount - 1)
      );
=======
      const previousLikeCount = likeCount;

      setIsLiked(!previousIsLiked);
      setLikeCount(!previousIsLiked ? previousLikeCount + 1 : Math.max(0, previousLikeCount - 1));
>>>>>>> origin/master

      return { previousIsLiked, previousLikeCount };
    },
    onSuccess: (data) => {
<<<<<<< HEAD
      // Sync state with server message
      if (data && data.message) {
        const msg = data.message.toLowerCase();
        if (msg.includes("unliked")) {
          setIsLiked(false);
        } else if (msg.includes("liked")) {
          setIsLiked(true);
        }
=======
      // Backend returns: { message: "Product liked" or "Product unliked" }
      if (data?.message) {
        const msg = data.message.toLowerCase();
        const nowLiked = msg.includes("liked") && !msg.includes("unliked");
        setIsLiked(nowLiked);
>>>>>>> origin/master
      }
    },
    onError: (err, variables, context) => {
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);
      }
<<<<<<< HEAD
    },
  });

  // --- FOLLOW MUTATION ---
  const { mutate: toggleFollow } = useMutation({
    mutationFn: async () => {
      // Fallback: If we have an ID, use it. If not, try username (which is 500ing, but better than nothing).
      if (profileId) {
         // This assumes you have a followUserById function, or followUser handles it
         // For now, we stick to the api.js function which currently uses username
         return followUser(displayUsername); 
      }
      return followUser(displayUsername);
=======
      console.error("Like error:", err);
    },
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async () => {
      return followUser(profileId);
>>>>>>> origin/master
    },
    onMutate: async () => {
      if (!isAuthenticated) return;
      const previousIsFollowed = isFollowed;
      setIsFollowed(!previousIsFollowed);
      return { previousIsFollowed };
    },
    onError: (err, variables, context) => {
      if (context) setIsFollowed(context.previousIsFollowed);
<<<<<<< HEAD
      alert("Follow failed. Please try again later.");
=======
      console.error("Follow error:", err);
>>>>>>> origin/master
    },
  });

  useEffect(() => {
    if (mediaRef.current && onVideoInit) {
      onVideoInit(mediaRef.current);
    }
  }, [onVideoInit]);

  const handleLike = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleLike();
  };

  const handleFollow = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleFollow();
  };

  const handleDoubleTap = () => {
    if (!isAuthenticated) return;
    if (!isLiked) {
      toggleLike();
    }
    setShowLikeAnimation(true);
  };

  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleOpenShare = () => {
    setShowShareModal(true);
  };

  const handleOpenMessage = () => {
    if (!isAuthenticated) return navigate("/login");
    if (profileId) {
      navigate(`/chat/${profileId}`);
    } else {
<<<<<<< HEAD
      alert("Cannot message this user (Missing User ID)");
=======
      alert("Cannot message this user");
>>>>>>> origin/master
    }
  };

  return (
    <div
      className="relative w-full h-full bg-lily text-white"
      onDoubleClick={handleDoubleTap}
    >
<<<<<<< HEAD
=======
      {/* Media Container */}
>>>>>>> origin/master
      <div className="media-container-cover w-full h-full bg-black">
        {mediaArray.length > 1 ? (
          <MediaCarousel
            ref={mediaRef}
            media={mediaArray}
            isFeedCarousel={true}
            containerClassName="media-container-cover w-full aspect-square"
            onDoubleClick={handleDoubleTap}
          />
        ) : isVideo ? (
          <VideoPlayer ref={mediaRef} src={mediaArray[0]?.src} />
        ) : (
          <img
            ref={mediaRef}
            src={mediaArray[0]?.src || "/placeholder-image.png"}
            alt={post.name || post.caption || "Post"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = "flex";
              }
            }}
          />
        )}
        <div className="hidden absolute inset-0 items-center justify-center bg-gray-900 text-gray-500">
          <p>Image Unavailable</p>
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Like Animation */}
>>>>>>> origin/master
      <AnimatePresence>
        {showLikeAnimation && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            onAnimationComplete={() => setShowLikeAnimation(false)}
          >
<<<<<<< HEAD
            <Heart
              className="w-24 h-24 text-lily drop-shadow-lg"
              fill="#4eb75e"
            />
=======
            <Heart className="w-24 h-24 text-lily drop-shadow-lg" fill="#4eb75e" />
>>>>>>> origin/master
          </motion.div>
        )}
      </AnimatePresence>

<<<<<<< HEAD
      <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 text-white z-20 pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-2 max-w-[calc(100%-60px)] pointer-events-auto">
=======
      {/* Content Overlay */}
      <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 text-white z-[5] pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-2 max-w-[calc(100%-60px)] pointer-events-auto">
            {/* User Info */}
>>>>>>> origin/master
            <div className="relative gap-3 flex items-center">
              <Link to={profileLink} className="relative block">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-ash flex items-center justify-center overflow-hidden">
                  <img
<<<<<<< HEAD
                    src={post.userpic || "/profile-icon.svg"}
                    alt={displayUsername}
                    className="w-full h-full object-contain"
=======
                    src={profilePic}
                    alt={displayUsername}
                    className="w-full h-full object-cover"
>>>>>>> origin/master
                  />
                </div>
              </Link>

<<<<<<< HEAD
              {/* Only show Follow button if NOT self AND we have a valid way to follow (ignoring 500 error hope) */}
              {!isOwnPost && (
                <button
                  onClick={handleFollow}
                  className="absolute top-[80%] left-3"
                >
                  <img
                    src={`${
                      isFollowed ? "/icons/followed.svg" : "/icons/follow.svg"
                    }`}
=======
              {!isOwnPost && (
                <button onClick={handleFollow} className="absolute top-[80%] left-3">
                  <img
                    src={isFollowed ? "/icons/followed.svg" : "/icons/follow.svg"}
>>>>>>> origin/master
                    alt={`Follow ${displayUsername}`}
                  />
                </button>
              )}

              <Link to={profileLink} className="flex items-center space-x-2">
                <h1 className="font-bold">{displayUsername}</h1>
              </Link>
            </div>

<<<<<<< HEAD
=======
            {/* Title/Name */}
>>>>>>> origin/master
            <h2 className="font-bold text-lg">
              {post.name || post.caption?.slice(0, 30) || "Untitled"}
            </h2>

<<<<<<< HEAD
            {post.price != null && (
              <p className="font-bold">
                ₦{Number(post.price).toLocaleString()}
              </p>
            )}

            <motion.p layout className="text-sm font-light">
              {isExpanded
                ? post.caption
                : `${post.caption?.substring(0, DESCRIPTION_CHAR_LIMIT) || ""}`}
              {post.caption?.length > DESCRIPTION_CHAR_LIMIT && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="font-semibold ml-1 opacity-80"
                >
                  {isExpanded ? "...less" : "...see more"}
                </button>
              )}
            </motion.p>

=======
            {/* Price - Show for Products AND Selling Content */}
            {(isProduct || (isSellingContent && post.product?.price)) && (
              <p className="font-bold">
                ₦{Number(isProduct ? post.price : post.product.price).toLocaleString()}
              </p>
            )}

            {/* Caption */}
            {post.caption && (
              <motion.p layout className="text-sm font-light">
                {isExpanded
                  ? post.caption
                  : `${post.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}`}
                {post.caption.length > DESCRIPTION_CHAR_LIMIT && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-semibold ml-1 opacity-80"
                  >
                    {isExpanded ? "...less" : "...see more"}
                  </button>
                )}
              </motion.p>
            )}

            {/* Music Track */}
>>>>>>> origin/master
            <p className="font-light flex items-center gap-1">
              <span>
                <img src="/icons/music.svg" alt="" />
              </span>
              {post.musicTrack || "Original Audio"}
            </p>

<<<<<<< HEAD
            <div className="flex items-center space-x-2 pt-2">
              <Link
                to={`/product-details/${post.id}`}
                className="bg-white text-black flex items-center font-normal p-2 gap-1 rounded-full text-sm"
              >
                <span>
                  <img src="/icons/bag-2.svg" alt="" />
                </span>
                Buy Now
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 pointer-events-auto">
            <button onClick={handleLike} className="flex flex-col items-center">
              <img
                src={`${isLiked ? "/icons/heart-red.svg" : "/icons/heart.svg"}`}
                alt=""
                className={`${isLiked ? "size-9" : ""}`}
              />
              <span className="text-xs font-semibold">
                {formatCount(likeCount)}
              </span>
            </button>
            <button
              onClick={handleOpenComments}
              className="flex flex-col items-center"
            >
              <img src="/icons/message-alt.svg" alt="" />
              <span className="text-xs font-semibold">
                {formatCount(commentCount)}
              </span>
            </button>
            <button
              onClick={handleOpenShare}
              className="flex flex-col items-center"
            >
              <img src="/icons/share.svg" alt="" />
              <span className="text-xs font-semibold">
                {formatCount(post.shares || 0)}
              </span>
            </button>
            <button
              onClick={handleOpenMessage}
              className="flex flex-col items-center"
            >
              <img src="/icons/send-alt.svg" alt="" />
              <span className="text-xs font-semibold">{`Message`}</span>
            </button>
            <button className="flex flex-col items-center">
              <img src="/icons/eye.svg" alt="View" />
              <span className="text-xs font-semibold">
                {formatCount(post.views || 0)}
              </span>
=======
            {/* Buy Now Button - For Products OR Selling Content with linked product */}
            {(isProduct || (isSellingContent && post.product)) && (
              <div className="flex items-center space-x-2 pt-2">
                <Link
                  to={`/product-details/${isProduct ? post.id : post.product.id}`}
                  className="bg-white text-black flex items-center font-normal p-2 gap-1 rounded-full text-sm"
                >
                  <span>
                    <img src="/icons/bag-2.svg" alt="" />
                  </span>
                  Buy Now
                </Link>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center space-y-4 pointer-events-auto">
            <button onClick={handleLike} className="flex flex-col items-center">
              <img
                src={isLiked ? "/icons/heart-red.svg" : "/icons/heart.svg"}
                alt="Like"
                className={isLiked ? "size-9" : ""}
              />
              <span className="text-xs font-semibold">{formatCount(likeCount)}</span>
            </button>

            <button onClick={handleOpenComments} className="flex flex-col items-center">
              <img src="/icons/message-alt.svg" alt="Comment" />
              <span className="text-xs font-semibold">{formatCount(commentCount)}</span>
            </button>

            <button onClick={handleOpenShare} className="flex flex-col items-center">
              <img src="/icons/share.svg" alt="Share" />
              <span className="text-xs font-semibold">{formatCount(post.shares || 0)}</span>
            </button>

            <button onClick={handleOpenMessage} className="flex flex-col items-center">
              <img src="/icons/send-alt.svg" alt="Message" />
              <span className="text-xs font-semibold">Message</span>
            </button>

            <button className="flex flex-col items-center">
              <img src="/icons/eye.svg" alt="View" />
              <span className="text-xs font-semibold">{formatCount(viewCount)}</span>
>>>>>>> origin/master
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Modals */}
>>>>>>> origin/master
      <AnimatePresence>
        {showCommentsModal && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
            postId={post.id}
            itemType={isProduct ? "product" : "content"}
            totalComments={commentCount}
<<<<<<< HEAD
=======
            onCommentCountUpdate={(newCount) => setCommentCount(newCount)}
>>>>>>> origin/master
          />
        )}

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
<<<<<<< HEAD
            postUrl={`https://lilyshops.com/${post.id}`}
=======
            postUrl={`https://lilyshops.com/${isProduct ? 'product' : 'content'}/${post.id}`}
>>>>>>> origin/master
            postCaption={post.caption}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;