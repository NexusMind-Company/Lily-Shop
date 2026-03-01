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
import {
  likeProduct,
  likeContent,
  followUser,
  recordProductView,
  recordContentView,
} from "../../services/api";

const DESCRIPTION_CHAR_LIMIT = 30;
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

const FeedItem = ({ post, onVideoInit, isActive }) => {
  const mediaRef = useRef(null);
  const queryClient = useQueryClient();

  const rawMedia =
    post.all_media_urls?.length > 0
      ? post.all_media_urls
      : post.media?.length > 0
        ? post.media
        : post.media || post.media_url || post.image_url;

  const mediaArray = Array.isArray(rawMedia)
    ? rawMedia.map((item) => {
        const srcString =
          typeof item === "string"
            ? item
            : item.src || item.url || item.image_url || item.media_url || item;
        const isVid =
          typeof srcString === "string" &&
          srcString.match(/\.(mp4|mov|webm)$/i);
        return {
          src: srcString,
          type: item.type ? item.type : isVid ? "video" : "image",
        };
      })
    : rawMedia
      ? [
          {
            src: rawMedia,
            type:
              typeof rawMedia === "string" &&
              rawMedia.match(/\.(mp4|mov|webm)$/i)
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
  const [currentPostId, setCurrentPostId] = useState(post.id);

  const [isLiked, setIsLiked] = useState(
    post.is_liked === true ||
      post.is_liked === "true" ||
      post.has_liked === true,
  );
  const [isFollowed, setIsFollowed] = useState(
    post.is_followed === true || post.has_followed === true,
  );

  const [likeCount, setLikeCount] = useState(
    Number(post.like_count || post.likes_count || post.likes || 0),
  );

  const [commentCount, setCommentCount] = useState(
    Number(post.comment_count || post.comments_count || post.comments || 0),
  );

  const [viewCount, setViewCount] = useState(
    Number(post.visit_count || post.view_count || post.views || 0),
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user_data } = useSelector((state) => state.auth);

  const displayUsername = post.username || post.user || "Unknown User";
  const profileId = post.user_id || post.userId;
  const profileLink = profileId ? `/profile/${profileId}` : "#";

  const isOwnPost = user_data?.username === displayUsername;

  const isProduct =
    post.type?.toLowerCase() === "product" ||
    post.price_in_naira !== undefined ||
    post.price !== undefined ||
    post.name !== undefined ||
    post.productName !== undefined;

  const hasLinkedProduct = !isProduct && post.product != null;

  useEffect(() => {
    if (post.id !== currentPostId) {
      setCurrentPostId(post.id);
      setHasViewed(false);
      setViewCount(
        Number(post.visit_count || post.view_count || post.views || 0),
      );
    } else {
      setViewCount((prev) => {
        const incomingCount = Number(
          post.visit_count || post.view_count || post.views || 0,
        );
        return incomingCount > prev ? incomingCount : prev;
      });
    }

    setIsLiked(
      post.is_liked === true ||
        post.is_liked === "true" ||
        post.has_liked === true,
    );
    setIsFollowed(
      post.is_followed === true ||
        post.is_followed === "true" ||
        post.has_followed === true,
    );
    setLikeCount(
      Number(post.like_count || post.likes_count || post.likes || 0),
    );
    setCommentCount(
      Number(post.comment_count || post.comments_count || post.comments || 0),
    );
  }, [post, currentPostId]);

  useEffect(() => {
    let timer;
    if (isActive && !hasViewed) {
      timer = setTimeout(() => {
        setViewCount((prev) => prev + 1);
        setHasViewed(true);

        const recordView = isProduct ? recordProductView : recordContentView;

        recordView(post.id)
          .then(() => {
            queryClient.setQueriesData({ queryKey: ["feed"] }, (oldData) => {
              if (!oldData || !oldData.pages) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  items:
                    page.items?.map((item) => {
                      if (item.id === post.id) {
                        const currentViews = Number(
                          item.views ||
                            item.view_count ||
                            item.visit_count ||
                            0,
                        );
                        return {
                          ...item,
                          views: currentViews + 1,
                          view_count: currentViews + 1,
                          visit_count: currentViews + 1,
                        };
                      }
                      return item;
                    }) || [],
                })),
              };
            });
          })
          .catch((err) => {
            console.error(err);
            setViewCount((prev) => Math.max(0, prev - 1));
            setHasViewed(false);
          });
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isActive, post.id, isProduct, hasViewed, queryClient]);

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
      const previousLikeCount = likeCount;
      const newIsLiked = !previousIsLiked;
      const newLikeCount = newIsLiked
        ? previousLikeCount + 1
        : Math.max(0, previousLikeCount - 1);

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      queryClient.setQueriesData({ queryKey: ["feed"] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items:
              page.items?.map((item) => {
                if (item.id === post.id) {
                  return {
                    ...item,
                    is_liked: newIsLiked,
                    like_count: newLikeCount,
                  };
                }
                return item;
              }) || [],
          })),
        };
      });

      return { previousIsLiked, previousLikeCount };
    },
    onSuccess: (data) => {
      if (data && data.like_count !== undefined) {
        setLikeCount(Number(data.like_count));
      }
    },
    onError: (err, variables, context) => {
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);

        queryClient.setQueriesData({ queryKey: ["feed"] }, (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items:
                page.items?.map((item) => {
                  if (item.id === post.id) {
                    return {
                      ...item,
                      is_liked: context.previousIsLiked,
                      like_count: context.previousLikeCount,
                    };
                  }
                  return item;
                }) || [],
            })),
          };
        });
      }
      console.error(`[Post ${post.id}] Like error:`, err);
    },
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async () => {
      return followUser(profileId);
    },
    onMutate: async () => {
      if (!isAuthenticated) return;
      const previousIsFollowed = isFollowed;
      setIsFollowed(!previousIsFollowed);
      return { previousIsFollowed };
    },
    onError: (err, variables, context) => {
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
    if (profileId) {
      navigate(`/chat/${profileId}`);
    } else {
      alert("Cannot message this user");
    }
  };

  const shareUrl = `${window.location.origin}/?postId=${post.id}`;

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
            alt={post.name || post.productName || post.caption || "Post"}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (!e.target.src.includes("/feed-image.png")) {
                e.target.src = "/feed-image.png";
              }
            }}
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

      <div className="absolute bottom-5 left-0 right-0 p-4 pb-20 md:pb-5 text-white z-5 pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-2 max-w-[calc(100%-60px)] pointer-events-auto">
            <div className="relative gap-3 flex items-center">
              <Link to={profileLink} className="relative block">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-ash flex items-center justify-center overflow-hidden">
                  <img
                    src={post.userpic || "/profile-icon.svg"}
                    alt={displayUsername}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {!isOwnPost && (
                <button
                  onClick={handleFollow}
                  className="absolute top-[80%] left-3"
                >
                  <img
                    src={
                      isFollowed ? "/icons/followed.svg" : "/icons/follow.svg"
                    }
                    alt={`Follow ${displayUsername}`}
                  />
                </button>
              )}

              <Link to={profileLink} className="flex items-center space-x-2">
                <h1 className="font-bold">{displayUsername}</h1>
              </Link>
            </div>

            <h2 className="font-bold text-lg">
              {post.name ||
                post.productName ||
                post.caption?.slice(0, 30) ||
                "Untitled"}
            </h2>

            {(isProduct ||
              (hasLinkedProduct &&
                (post.product?.price_in_naira || post.product?.price))) && (
              <p className="font-bold">
                ₦
                {Number(
                  isProduct
                    ? post.price_in_naira || post.price
                    : post.product.price_in_naira || post.product.price,
                ).toLocaleString()}
              </p>
            )}

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

            <p className="font-light flex items-center gap-1">
              <span>
                <img src="/icons/music.svg" alt="" />
              </span>
              {post.musicTrack || "Original Audio"}
            </p>

            {(isProduct || hasLinkedProduct) && (
              <div className="flex items-center space-x-2 pt-2">
                <Link
                  to={`/product/${isProduct ? post.id : post.product.id}`}
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

          <div className="flex flex-col items-center space-y-4 pointer-events-auto">
            <button onClick={handleLike} className="flex flex-col items-center">
              <img
                src={isLiked ? "/icons/heart-red.svg" : "/icons/heart.svg"}
                alt="Like"
                className={isLiked ? "size-9" : ""}
              />
              <span className="text-xs font-semibold">
                {formatCount(likeCount)}
              </span>
            </button>

            <button
              onClick={handleOpenComments}
              className="flex flex-col items-center"
            >
              <img src="/icons/message-alt.svg" alt="Comment" />
              <span className="text-xs font-semibold">
                {formatCount(commentCount)}
              </span>
            </button>

            <button
              onClick={handleOpenShare}
              className="flex flex-col items-center"
            >
              <img src="/icons/share.svg" alt="Share" />
              <span className="text-xs font-semibold">
                {formatCount(post.shares || 0)}
              </span>
            </button>

            <button
              onClick={handleOpenMessage}
              className="flex flex-col items-center"
            >
              <img src="/icons/send-alt.svg" alt="Message" />
              <span className="text-xs font-semibold">Message</span>
            </button>

            <button className="flex flex-col items-center">
              <img src="/icons/eye.svg" alt="View" />
              <span className="text-xs font-semibold">
                {formatCount(viewCount)}
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
            totalComments={commentCount}
            onCommentCountUpdate={(newCount) => setCommentCount(newCount)}
          />
        )}

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            postUrl={shareUrl}
            postCaption={post.caption}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
