import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { addToCart } from "../../redux/cartSlice";
import toast from "react-hot-toast";
import MediaCarousel from "../common/mediaCarousel";
import VideoPlayer from "./videoPlayer";
import CommentsModal from "./comments/commentsModal";
import ShareModal from "./share/shareModal";
import MentionText from "../common/MentionText";
import {
  likeProduct,
  likeContent,
  followUser,
  recordProductView,
  recordContentView,
  fetchProductViewCount,
  fetchContentViewCount,
} from "../../services/api";

const DESCRIPTION_CHAR_LIMIT = 30;
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

// --- Helper Functions for Robust Cache Updates ---
const feedQueryPredicate = (query) => {
  const keys = query.queryKey;
  if (!Array.isArray(keys)) return false;
  return keys.some(
    (k) =>
      typeof k === "string" &&
      ["feed", "nearby", "search", "products", "profile"].includes(k),
  );
};

const updateItemLikes = (oldData, postId, newIsLiked, newLikeCount) => {
  if (!oldData) return oldData;

  const updateItem = (item) => {
    if (item.id === postId) {
      return { ...item, is_liked: newIsLiked, like_count: newLikeCount };
    }
    return item;
  };

  if (oldData.pages) {
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        items: page.items ? page.items.map(updateItem) : [],
        results: page.results ? page.results.map(updateItem) : [],
      })),
    };
  }
  if (oldData.results && Array.isArray(oldData.results)) {
    return { ...oldData, results: oldData.results.map(updateItem) };
  }
  if (Array.isArray(oldData)) {
    return oldData.map(updateItem);
  }
  return oldData;
};

const updateItemFollows = (oldData, profileId, newIsFollowed) => {
  if (!oldData) return oldData;

  const updateItem = (item) => {
    if (item.user_id === profileId || item.userId === profileId) {
      return {
        ...item,
        is_followed: newIsFollowed,
        has_followed: newIsFollowed,
      };
    }
    return item;
  };

  if (oldData.pages) {
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        items: page.items ? page.items.map(updateItem) : [],
        results: page.results ? page.results.map(updateItem) : [],
      })),
    };
  }
  if (oldData.results && Array.isArray(oldData.results)) {
    return { ...oldData, results: oldData.results.map(updateItem) };
  }
  if (Array.isArray(oldData)) {
    return oldData.map(updateItem);
  }
  return oldData;
};

const FeedItem = ({ post, onVideoInit, isActive }) => {
  const mediaRef = useRef(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

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

  // Initial fallback count from feed API (usually 0)
  const [viewCount, setViewCount] = useState(
    Number(post.visit_count || post.view_count || post.views || 0),
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user_data } = useSelector((state) => state.auth);

  const resolvedUser = typeof post.user === "object" ? post.user : null;
  const displayUsername =
    post.username ||
    post.author_name ||
    resolvedUser?.username ||
    resolvedUser?.full_name ||
    (typeof post.user === "string" ? post.user : "Unknown User");

  const profileId =
    post.user_id ||
    post.userId ||
    post.author_id ||
    resolvedUser?.id ||
    post.shop?.user_id ||
    post.shop_id ||
    displayUsername;

  const isProduct =
    post.type?.toLowerCase() === "product" ||
    post.price_in_naira !== undefined ||
    post.price !== undefined ||
    post.name !== undefined ||
    post.productName !== undefined;

  const profileLink = profileId ? `/profile/${profileId}` : "#";

  const currentUserId = user_data?.id || user_data?.user?.id;
  const currentUsername = user_data?.username || user_data?.user?.username;

  const isOwnPost =
    (currentUsername && currentUsername === displayUsername) ||
    (currentUserId && currentUserId === profileId);

  const hasLinkedProduct = !isProduct && post.product != null;

  // ==================== PREFETCHING ====================
  // This runs immediately when the component renders (even off-screen).
  // By the time the user scrolls to it, we already have the real number!
  const { data: prefetchedViews } = useQuery({
    queryKey: ["viewCount", isProduct ? "product" : "content", post.id],
    queryFn: () =>
      isProduct
        ? fetchProductViewCount(post.id)
        : fetchContentViewCount(post.id),
    staleTime: 1000 * 60 * 5, // Keep cached for 5 minutes
    retry: 1,
  });

  // Sync prefetched data silently into UI
  useEffect(() => {
    if (prefetchedViews && prefetchedViews.view_count !== undefined) {
      setViewCount(Number(prefetchedViews.view_count));
    }
  }, [prefetchedViews]);
  // ===================================================

  useEffect(() => {
    if (post.id !== currentPostId) {
      setCurrentPostId(post.id);
      // We only fallback to the post object if we haven't prefetched it
      if (!prefetchedViews) {
        setViewCount(
          Number(post.visit_count || post.view_count || post.views || 0),
        );
      }
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
  }, [post, currentPostId, prefetchedViews]);

  // ==================== THE BAM! EFFECT ====================
  useEffect(() => {
    // We use a ref so we don't accidentally fire the view multiple times
    // if the component unmounts and remounts quickly.
    let hasViewed = false;

    if (isActive && !hasViewed) {
      hasViewed = true;

      // 1. INSTANT OPTIMISTIC UI: Add 1 instantly
      setViewCount((prev) => prev + 1);

      // 2. BACKGROUND FIRE-AND-FORGET: Send POST to backend silently
      const recordView = isProduct ? recordProductView : recordContentView;
      recordView(post.id).catch((err) => {
        console.error(`[Post ${post.id}] Background view record failed:`, err);
      });
    }

    return () => {
      hasViewed = false; // Reset when post goes off screen
    };
  }, [isActive, post.id, isProduct]);
  // ==========================================================

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

      queryClient.setQueriesData({ predicate: feedQueryPredicate }, (oldData) =>
        updateItemLikes(oldData, post.id, newIsLiked, newLikeCount),
      );

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

        queryClient.setQueriesData(
          { predicate: feedQueryPredicate },
          (oldData) =>
            updateItemLikes(
              oldData,
              post.id,
              context.previousIsLiked,
              context.previousLikeCount,
            ),
        );
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
      const newIsFollowed = !previousIsFollowed;

      setIsFollowed(newIsFollowed);

      queryClient.setQueriesData({ predicate: feedQueryPredicate }, (oldData) =>
        updateItemFollows(oldData, profileId, newIsFollowed),
      );

      return { previousIsFollowed };
    },
    onSuccess: () => {
      dispatch(fetchProfile());
    },
    onError: (err, variables, context) => {
      if (context) {
        setIsFollowed(context.previousIsFollowed);

        queryClient.setQueriesData(
          { predicate: feedQueryPredicate },
          (oldData) =>
            updateItemFollows(oldData, profileId, context.previousIsFollowed),
        );
      }
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

  const handleFollow = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!isAuthenticated) return navigate("/login");
    if (!profileId) return;
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
      toast.error("Cannot message this user");
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return navigate("/login");
    }

    const productId = isProduct ? post.id : post.product?.id;
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    dispatch(addToCart({ product_id: productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success("Added to cart!");
      })
      .catch((error) => {
        toast.error(error || "Failed to add to cart");
      });
  };

  const shareUrl = `${window.location.origin}/?postId=${post.id}`;

  return (
    <div
      className="relative w-full h-full bg-black text-white overflow-hidden"
      onDoubleClick={handleDoubleTap}
    >
      <div className="media-box w-full h-full flex items-center justify-center">
        {mediaArray.length > 1 ? (
          <MediaCarousel
            ref={mediaRef}
            media={mediaArray}
            isFeedCarousel={true}
            containerClassName="media-box"
            onDoubleClick={handleDoubleTap}
          />
        ) : isVideo ? (
          <VideoPlayer
            ref={mediaRef}
            src={mediaArray[0]?.src}
            isActive={isActive}
          />
        ) : (
          <img
            ref={mediaRef}
            src={mediaArray[0]?.src || "/feed-image.png"}
            alt={post.name || post.productName || post.caption || "Post"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/feed-image.png";
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {showLikeAnimation && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
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

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 md:pb-6 text-white z-10 pointer-events-none bg-linear-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex justify-between items-end gap-3">
          <div className="flex-1 flex flex-col justify-end space-y-3 min-w-0 pr-2 pointer-events-auto">
            <div className="relative gap-3 flex items-center shrink-0">
              <div className="relative block shrink-0">
                <Link
                  to={profileLink}
                  className="w-11 h-11 rounded-full border-[2.5px] border-white bg-ash flex items-center justify-center overflow-hidden shrink-0 shadow-lg"
                >
                  <img
                    src={post.userpic || "/profile-icon.svg"}
                    alt={displayUsername}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {!isOwnPost && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleFollow}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-20 w-6 h-6 bg-lily rounded-full flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <img
                      src={
                        isFollowed ? "/icons/followed.svg" : "/icons/plus.svg"
                      }
                      alt={`Follow ${displayUsername}`}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </motion.button>
                )}
              </div>

              <Link
                to={profileLink}
                className="flex items-center space-x-2 truncate"
              >
                <h1 className="font-bold text-[15px] truncate">
                  {displayUsername}
                </h1>
              </Link>
            </div>

            <h2 className="font-bold text-lg leading-tight line-clamp-2">
              {post.name ||
                post.productName ||
                post.caption?.slice(0, 30) ||
                "Untitled"}
            </h2>

            {(isProduct ||
              (hasLinkedProduct &&
                (post.product?.price_in_naira || post.product?.price))) && (
              <p className="font-bold text-base">
                ₦
                {Number(
                  isProduct
                    ? post.price_in_naira || post.price
                    : post.product.price_in_naira || post.product.price,
                ).toLocaleString()}
              </p>
            )}

            {post.caption && (
              <motion.p
                layout
                className={`text-sm font-normal leading-relaxed ${isExpanded ? "max-h-[22vh] overflow-y-auto no-scrollbar pointer-events-auto" : "line-clamp-2"}`}
              >
                {isExpanded ? (
                  <MentionText text={post.caption} />
                ) : (
                  <MentionText
                    text={post.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}
                  />
                )}
                {post.caption.length > DESCRIPTION_CHAR_LIMIT && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-semibold ml-1 text-white/80 hover:text-white"
                  >
                    {isExpanded ? "less" : "...more"}
                  </button>
                )}
              </motion.p>
            )}

            <p className="font-light flex items-center gap-2 text-sm text-white/70">
              <span className="shrink-0">
                <img
                  src="/icons/music.svg"
                  alt=""
                  className="w-4 h-4"
                  style={{ backgroundColor: "transparent" }}
                />
              </span>
              <span className="truncate">
                {post.musicTrack || "Original Audio"}
              </span>
            </p>

            {(isProduct || hasLinkedProduct) && (
              <div className="flex items-center space-x-3 pt-1 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="bg-lily text-white inline-flex w-fit items-center font-medium px-4 py-2 gap-2 rounded-full text-sm hover:bg-lily/90 transition-colors shadow-lg shadow-lily/25"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </motion.button>
                <Link
                  to={`/product/${isProduct ? post.id : post.product.id}`}
                  state={{ itemType: isProduct ? "product" : "content", post }}
                  className="bg-white text-black inline-flex w-fit items-center font-medium px-4 py-2 gap-2 rounded-full text-sm hover:bg-white/90 transition-colors"
                >
                  <span>
                    <img src="/icons/bag-2.svg" alt="" className="w-4 h-4" />
                  </span>
                  Buy Now
                </Link>
              </div>
            )}
          </div>

          <div className="absolute right-3 bottom-28 md:bottom-20 flex flex-col items-center gap-4 pointer-events-auto shrink-0 bg-transparent">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex flex-col items-center group bg-transparent"
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={isLiked ? "/icons/heart-red.svg" : "/icons/heart.svg"}
                  alt="Like"
                  className={`w-8 h-8 transition-all group-hover:scale-110 ${isLiked ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : ""}`}
                  style={{ backgroundColor: "transparent" }}
                />
              </motion.div>
              <span className="text-xs font-semibold drop-shadow-md mt-1">
                {formatCount(likeCount)}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenComments}
              className="flex flex-col items-center group bg-transparent"
            >
              <img
                src="/icons/message-alt.svg"
                alt="Comment"
                className="w-8 h-8 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "transparent" }}
              />
              <span className="text-xs font-semibold drop-shadow-md mt-1">
                {formatCount(commentCount)}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenShare}
              className="flex flex-col items-center group bg-transparent"
            >
              <img
                src="/icons/share.svg"
                alt="Share"
                className="w-8 h-8 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "transparent" }}
              />
              <span className="text-xs font-semibold drop-shadow-md mt-1">
                {formatCount(post.shares || 0)}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenMessage}
              className="flex flex-col items-center group bg-transparent"
            >
              <img
                src="/icons/send-alt.svg"
                alt="Message"
                className="w-8 h-8 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "transparent" }}
              />
              <span className="text-xs font-semibold drop-shadow-md mt-1">
                Message
              </span>
            </motion.button>

            <div className="flex flex-col items-center bg-transparent">
              <img
                src="/icons/eye.svg"
                alt="View"
                className="w-8 h-8"
                style={{ backgroundColor: "transparent" }}
              />
              <span className="text-xs font-semibold drop-shadow-md mt-1">
                {formatCount(viewCount)}
              </span>
            </div>
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
            postCaption={post.caption || post.name}
            post={post}
            isProduct={isProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
