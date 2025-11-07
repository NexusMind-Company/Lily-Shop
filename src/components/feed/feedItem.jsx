import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
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
  const isVideo = post?.media?.[0]?.type === "video";
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: toggleLike } = useMutation({
    mutationFn: () => {
      if (post.type === "product") {
        return likeProduct(post.id);
      } else {
        return likeContent(post.id);
      }
    },
    onMutate: async () => {
      const previousIsLiked = isLiked;
      const previousLikeCount = likeCount;

      setIsLiked(!previousIsLiked);
      setLikeCount(
        !previousIsLiked ? previousLikeCount + 1 : previousLikeCount - 1
      );

      return { previousIsLiked, previousLikeCount };
    },
    onError: (err, newTodo, context) => {
      setIsLiked(context.previousIsLiked);
      setLikeCount(context.previousLikeCount);
      console.error("Failed to like post", err);
    },
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: () => followUser(post.username),
    onMutate: async () => {
      const previousIsFollowed = isFollowed;
      setIsFollowed(!previousIsFollowed);
      return { previousIsFollowed };
    },
    onError: (err, newTodo, context) => {
      setIsFollowed(context.previousIsFollowed);
      console.error("Failed to follow user", err);
    },
  });

  useEffect(() => {
    if (mediaRef.current && onVideoInit) {
      onVideoInit(mediaRef.current);
    }
  }, [onVideoInit]);

  const handleLike = () => {
    toggleLike();
  };

  const handleFollow = () => {
    toggleFollow();
  };

  const handleDoubleTap = () => {
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
    navigate(`/chat/${post.userId}`);
  };

  return (
    <div
      className="relative w-full h-full bg-lily text-white"
      onDoubleClick={handleDoubleTap}
    >
      <div className="media-container-cover w-full h-full">
        {post?.media && post.media.length > 1 ? (
          <MediaCarousel
            ref={mediaRef}
            media={post.media}
            isFeedCarousel={true}
            containerClassName="media-container-cover w-full aspect-square"
            onDoubleClick={handleDoubleTap}
          />
        ) : isVideo ? (
          <VideoPlayer ref={mediaRef} src={post.media[0].src} />
        ) : (
          <img
            ref={mediaRef}
            src={post.media?.[0]?.src}
            alt={post.productName}
            className="w-full h-full object-cover"
          />
        )}
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
              <div className="w-10 h-10 rounded-full border-2 border-white bg-ash flex items-center justify-center overflow-hidden">
                <img
                  src={post.userpic}
                  alt={post.username}
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={handleFollow}
                className="absolute top-[80%] left-3"
              >
                <img
                  src={`${
                    isFollowed ? "/icons/followed.svg" : "/icons/follow.svg"
                  }`}
                  alt={`Follow ${post.username}`}
                />
              </button>
              <button className="flex items-center space-x-2">
                <h1 className="font-bold">{post.username}</h1>
              </button>
            </div>
            <h2 className="font-bold text-lg">
              {post.productName || post.caption.slice(0, 30)}
            </h2>
            <p className="font-bold">₦{post.price.toLocaleString()}</p>
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

            <p className="font-light flex items-center gap-1">
              <span>
                <img src="/icons/music.svg" alt="" />
              </span>
              {post.musicTrack}
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
                {formatCount(post.comments)}
              </span>
            </button>
            <button
              onClick={handleOpenShare}
              className="flex flex-col items-center"
            >
              <img src="/icons/share.svg" alt="" />
              <span className="text-xs font-semibold">
                {formatCount(post.shares)}
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
                {formatCount(post.views)}
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
            itemType={post.type}
            totalComments={post.comments}
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

        {showMessageModal && (
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            recipientId={post.userId}
            recipientUsername={post.username}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
