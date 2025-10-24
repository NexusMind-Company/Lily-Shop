import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

// Local component imports
import MediaCarousel from "../common/mediaCarousel";
import VideoPlayer from "./videoPlayer"
import CommentsModal from "./comments/commentsModal";
import ShareModal from "./share/shareModal";

// Redux imports
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../redux/cartSlice";

const DESCRIPTION_CHAR_LIMIT = 100;
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

  // const dispatch = useDispatch();

  // When the component mounts, pass the media ref's value up to the parent.
  useEffect(() => {
    if (mediaRef.current && onVideoInit) {
      onVideoInit(mediaRef.current);
    }
  }, [onVideoInit]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
  };

  const handleDoubleTap = () => {
    if (!isLiked) handleLike();
    setShowLikeAnimation(true);
  };

  // const handleAddToCart = () => {
  //   const itemToAdd = {
  //     id: post.id,
  //     productName: post.productName || post.caption.slice(0, 30),
  //     price: post.price,
  //     username: post.username,
  //     quantity: 1,
  //     mediaSrc: post.media?.[0]?.src,
  // pickupAddress: post.pickupAddress,
  // deliveryAddress: post.deliveryAddress,
  // deliveryCharge: post.deliveryCharge,
  // serviceCharge: post.serviceCharge,
  //   };

  //   // Dispatch the action using the action creator from cartSlice
  //   dispatch(addItemToCart(itemToAdd));
  // };

  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleOpenShare = () => {
    setShowShareModal(true);
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
            containerClassName="media-container-cover w-full h-full"
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

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 text-white z-20 pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-2 max-w-[calc(100%-60px)] pointer-events-auto">
            {/* Profile Pic and follow button */}
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
              {/* Username */}
              <div className="flex items-center space-x-2">
                <h1 className="font-bold">{post.username}</h1>
              </div>
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

            {/* music Track */}
            <p className="font-light flex items-center gap-1">
              <span>
                <img src="/icons/music.svg" alt="" />
              </span>
              {post.musicTrack}
            </p>

            {/* Add to cart and buy now */}
            <div className="flex items-center space-x-2 pt-2">
              {/* <button
                onClick={handleAddToCart} // THIS CONNECTS TO THE REDUX LOGIC
                className="flex items-center bg-white rounded-full p-2"
              >
                <img src="/icons/cart-add.svg" alt="Add to cart" />
              </button> */}
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
            {/* Like Icon */}
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
            {/* Comments Icon - MODIFIED to open modal */}
            <button
              onClick={handleOpenComments}
              className="flex flex-col items-center"
            >
              <img src="/icons/message-alt.svg" alt="" />
              <span className="text-xs font-semibold">
                {formatCount(post.comments)}
              </span>
            </button>
            {/* Share Icon */}
            <button
              onClick={handleOpenShare}
              className="flex flex-col items-center"
            >
              <img src="/icons/send-alt.svg" alt="" />
              <span className="text-xs font-semibold">
                {formatCount(post.shares)}
              </span>
            </button>
            {/* Promote Icon
            <button className="flex flex-col items-center">
              <img src="/icons/loudspeaker.svg" alt="" />
              <span className="text-xs text-white font-semibold">
                {`Promote`}
              </span>
            </button>
            Message Trader Icon
            <button className="flex flex-col items-center">
              <img src="/icons/mail.svg" alt="" />
              <span className="text-xs font-semibold">{`Message`}</span>
            </button> */}
            {/* Views Icon */}
            <button className="flex flex-col items-center">
              <img src="/icons/eye.svg" alt="View" />
              <span className="text-xs font-semibold">
                {formatCount(post.views)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER THE COMMENTS MODAL */}
      <AnimatePresence>
        {showCommentsModal && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
            postId={post.id} // Pass the unique ID of the post
            totalComments={post.comments} // Pass the total count for the header
          />
        )}

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            postUrl={`https://lilyshop.com/post/${post.id}`} // Example URL structure
            postCaption={post.caption}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
