import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import MediaCarousel from "../common/mediaCarousel";
import VideoPlayer from "./videoPlayer";
import CommentsModal from "./comments/commentsModal";
import ShareModal from "./share/shareModal";
import { likeProduct, likeContent, followUser } from "../../services/api";

const DESCRIPTION_CHAR_LIMIT = 30;
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

const FeedItem = ({ post, onVideoInit }) => {
  const mediaRef = useRef(null);

  // Robust Media Handling
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

  // Use backend fields if available, otherwise default
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isFollowed, setIsFollowed] = useState(post.is_followed || false);
  const [likeCount, setLikeCount] = useState(
    post.likes_count || post.likes || 0
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  // Prefer the explicit 'user_id' from backend, fallback to 'user' if missing
  const displayUsername = post.username || post.user || "Unknown User";
  const profileId = post.user_id || post.userId || post.user;
  const profileLink = `/profile/${profileId}`;

  // Determine type: Use explicit 'type' from backend, or guess based on price
  const isProduct = post.type === "product" || post.price != null;

  const { mutate: toggleLike } = useMutation({
    mutationFn: () => {
      if (isProduct) {
        return likeProduct(post.id);
      } else {
        return likeContent(post.id);
      }
    },
    onMutate: async () => {
      if (!isAuthenticated) return;

      const previousIsLiked = isLiked;
      const previousLikeCount = likeCount;

      setIsLiked(!previousIsLiked);
      setLikeCount(
        !previousIsLiked
          ? (previousLikeCount || 0) + 1
          : Math.max(0, (previousLikeCount || 0) - 1)
      );

      return { previousIsLiked, previousLikeCount };
    },
    onError: (err, newTodo, context) => {
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);
      }
      console.error("Failed to like post", err);
    },
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: () => followUser(displayUsername),
    onMutate: async () => {
      if (!isAuthenticated) return;
      const previousIsFollowed = isFollowed;
      setIsFollowed(!previousIsFollowed);
      return { previousIsFollowed };
    },
    onError: (err, newTodo, context) => {
      if (context) setIsFollowed(context.previousIsFollowed);
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
    // Use the UUID if available for safer messaging
    navigate(`/chat/${profileId}`);
  };

  return (
    <div
      className="relative w-full h-full bg-lily text-white"
      onDoubleClick={handleDoubleTap}
    >
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

      <AnimatePresence>
        {showLikeAnimation && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            onAnimationComplete={() => setShowLikeAnimation(false)}
          >
            <Heart
              className="w-24 h-24 text-lily drop-shadow-lg"
              fill="#4eb75e"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 text-white z-20 pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-2 max-w-[calc(100%-60px)] pointer-events-auto">
            <div className="relative gap-3 flex items-center">
              {/* Linked Profile Pic */}
              <Link to={profileLink} className="relative block">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-ash flex items-center justify-center overflow-hidden">
                  <img
                    src={post.userpic || "/profile-icon.svg"}
                    alt={displayUsername}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>

              <button
                onClick={handleFollow}
                className="absolute top-[80%] left-3"
              >
                <img
                  src={`${
                    isFollowed ? "/icons/followed.svg" : "/icons/follow.svg"
                  }`}
                  alt={`Follow ${displayUsername}`}
                />
              </button>

              {/* Linked Username */}
              <Link to={profileLink} className="flex items-center space-x-2">
                <h1 className="font-bold">{displayUsername}</h1>
              </Link>
            </div>

            <h2 className="font-bold text-lg">
              {post.name || post.caption?.slice(0, 30) || "Untitled"}
            </h2>

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

            <p className="font-light flex items-center gap-1">
              <span>
                <img src="/icons/music.svg" alt="" />
              </span>
              {post.musicTrack || "Original Audio"}
            </p>

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
                {formatCount(post.comments || 0)}
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
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCommentsModal && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
            postId={post.id}
            itemType={isProduct ? "product" : "content"}
            totalComments={post.comments || 0}
          />
        )}

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            postUrl={`https://lilyshops.com/${post.id}`}
            postCaption={post.caption}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
