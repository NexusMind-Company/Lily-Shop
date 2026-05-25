import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  VolumeX,
  Volume2,
  Heart,
  MoreVertical,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { addToCart } from "../../../redux/cartSlice";
import {
  likeProduct,
  followUser,
  recordProductView,
} from "../../../services/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate, Link } from "react-router-dom";
import ProductReview from "./productReview";
import { Star } from "lucide-react";
import MentionText from "../../common/MentionText";
import ReviewModal from "../../common/ReviewModal";

const DESCRIPTION_CHAR_LIMIT = 100;

const ReviewStars = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }
      />
    ))}
  </div>
);

// --- Sub-component: Video Player for Carousel ---
const CarouselVideoPlayer = ({ src, poster }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync React state with HTML video element mute property
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  // Track play/pause state for UI overlay rendering
  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    videoNode.addEventListener("play", onPlay);
    videoNode.addEventListener("pause", onPause);

    return () => {
      videoNode.removeEventListener("play", onPlay);
      videoNode.removeEventListener("pause", onPause);
    };
  }, []);

  const handlePlayPause = (e) => {
    e.stopPropagation(); // Prevent swiper from triggering a slide change
    if (videoRef.current?.paused) videoRef.current?.play();
    else videoRef.current?.pause();
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full bg-black" onClick={handlePlayPause}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <div className="relative pointer-events-auto">
            <div className="bg-black/50 rounded-full p-3">
              <Play size={60} className="text-white" fill="white" />
            </div>
            <button
              onClick={toggleMute}
              className="absolute -top-1 -right-1 bg-white text-black rounded-full p-2 shadow-lg"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component: Product Details Item ---
const ProductItem = ({ product }) => {
  // Variant selections
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");

  // UI interaction states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  // Social & Engagement states (initialized from product props)
  const [isLiked, setIsLiked] = useState(
    product.is_liked === true ||
      product.is_liked === "true" ||
      product.has_liked === true,
  );
  const [isFollowed, setIsFollowed] = useState(
    product.is_followed === true ||
      product.is_followed === "true" ||
      product.has_followed === true,
  );

  // Stock status logic
  const isOutOfStock =
    product.in_stock === false ||
    product.in_stock === "false" ||
    Number(product.quantity_available) <= 0;

  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // --- Data Normalization ---
  // Handle varying backend media structures (string vs array)
  const rawMedia =
    product.all_media_urls?.length > 0
      ? product.all_media_urls
      : product.media || product.media_url || product.image_url;

  // Format media into a consistent array of objects with type checking
  const mediaArray = Array.isArray(rawMedia)
    ? rawMedia.map((item) => ({
        src: typeof item === "string" ? item : item.src || item,
        type:
          typeof item === "string" && item.match(/\.(mp4|mov|webm)$/i)
            ? "video"
            : "image",
      }))
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

  const displayPrice = product.price_in_naira || product.price || 0;

  // Dynamic API Data Mapping
  const vendorDescription =
    product.shop_description ||
    product.vendorDetail ||
    product.shop?.description ||
    "No description provided by the vendor.";
  const productRating = product.rating || product.avg_rating || "0.0";
  const productReviewsCount = product.reviews || product.comment_count || "0";

  // --- Side Effects ---
  // Record a "view" only after the user has been on the page for 2 seconds
  useEffect(() => {
    let timer;
    if (!hasViewed && product?.id) {
      timer = setTimeout(() => {
        setHasViewed(true);
        recordProductView(product.id).catch((err) => {
          console.error(err);
          setHasViewed(false);
        });
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [product?.id, hasViewed]);

  // --- API Mutations ---
  const { mutate: toggleLike } = useMutation({
    mutationFn: () => likeProduct(product.id),
    onMutate: () => {
      if (!isAuthenticated) return;
      setIsLiked((prev) => !prev); // Optimistic UI update
    },
    onError: () => setIsLiked((prev) => !prev), // Revert on error
  });

  const { mutate: toggleFollow } = useMutation({
    mutationFn: () =>
      followUser(
        product.username || product.vendorName || product.user || "unknown",
      ),
    onMutate: () => {
      if (!isAuthenticated) return;
      setIsFollowed((prev) => !prev); // Optimistic UI update
    },
    onError: () => setIsFollowed((prev) => !prev), // Revert on error
  });

  // --- Handlers ---
  const handleLike = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleLike();
  };

  const handleFollow = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleFollow();
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate("/login");

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ product_id: product.id, quantity })).unwrap();
      setIsAddedToCart(true);
      setIsAddingToCart(false);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAddedToCart(false);
      setIsAddingToCart(false);
      alert(
        error?.quantity ||
          error?.message ||
          (typeof error === "string" ? error : "Failed to add to cart."),
      );
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/checkout", {
      state: {
        directBuy: true,
        product: product,
        quantity: quantity,
      },
    });
  };

  const handleViewAll = () => {
    setShowAllReviews((prev) => !prev);
  };

  const formatPrice = (price) => Number(price).toLocaleString();

  // Review pagination/display logic
  const reviewsArray = product.reviewsData || [];
  const reviewsToShow = showAllReviews
    ? reviewsArray
    : reviewsArray.slice(0, 3);
  const hasMoreReviews = reviewsArray.length > 3;

  // Vendor profile mapping
  const displayUsername =
    product.shop_name || product.username || product.user || "Unknown Vendor";
  const profileLink = product.shop
    ? `/shop/${product.shop}`
    : `/profile/${product.user_id || product.userId}`;

  return (
    <div className="relative w-full md:max-w-xl mx-auto min-h-screen pb-35 flex flex-col">
      {/* --- Edge-to-Edge Media Carousel --- */}
      <div className="w-full aspect-4/5 relative group bg-gray-100 overflow-hidden shrink-0">
        {mediaArray.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            loop={mediaArray.length > 1}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            className="w-full h-full bg-black"
          >
            {mediaArray.map((item, index) => (
              <SwiperSlide key={index}>
                {item.type === "video" ? (
                  <CarouselVideoPlayer src={item.src} poster={item.poster} />
                ) : (
                  <img
                    src={item.src}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {mediaArray.length > 1 && (
          <>
            <div className="swiper-button-prev absolute top-1/2 left-2 z-10 md:-translate-y-1/2 bg-black/40 rounded-full p-1 text-white cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
              <ChevronLeft size={28} />
            </div>
            <div className="swiper-button-next absolute top-1/2 right-2 z-10 md:-translate-y-1/2 bg-black/40 rounded-full p-1 text-white cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
              <ChevronRight size={28} />
            </div>
          </>
        )}

        {/* Floating Top Actions */}
        <button
          onClick={() => navigate(-1)}
          className="bg-white/80 absolute top-4 left-4 z-20 rounded-full p-1.5 cursor-pointer text-black hover:bg-white shadow-sm"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <button className="bg-white/80 absolute top-4 right-4 z-20 rounded-full p-1.5 cursor-pointer text-black hover:bg-white shadow-sm">
          <MoreVertical size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* --- Padded Content Section --- */}
      <div className="p-4 space-y-4 grow">
        {/* Title, Rating, and Price Header */}
        <div>
          <div className="flex justify-between items-start pt-2">
            <h2 className="font-bold text-lg text-gray-800 leading-tight w-3/4">
              {product.productName ||
                product.title ||
                product.name ||
                "Untitled Product"}
            </h2>
            <div className="flex items-center text-sm font-medium shrink-0 ml-2 pt-1 text-gray-800">
              <img src="/icons/star2.svg" alt="" className="mr-1 w-4 h-4" />
              {productRating}{" "}
              <span className="font-normal text-gray-500 ml-1">
                ({productReviewsCount})
              </span>
            </div>
          </div>

          {isOutOfStock && (
            <div className="mt-1">
              <span className="inline-block px-2 py-1 bg-pink/10 text-pink rounded text-xs font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <p className="text-green-500 font-bold text-lg">{`₦${formatPrice(displayPrice)}`}</p>
            <button onClick={handleLike} className="p-1">
              <Heart
                size={26}
                fill={isLiked ? "red" : "none"}
                color={isLiked ? "red" : "black"}
              />
            </button>
          </div>
        </div>

        {/* Description (Expandable) */}
        {product.caption && (
          <motion.p
            layout
            className="text-sm font-normal text-gray-800 leading-relaxed"
          >
            {isExpanded ? (
              <MentionText text={product.caption} />
            ) : (
              <MentionText
                text={product.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}
              />
            )}
            {product.caption.length > DESCRIPTION_CHAR_LIMIT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-medium ml-1 text-green-600 hover:underline"
              >
                {isExpanded ? "...less" : "...see more"}
              </button>
            )}
          </motion.p>
        )}

        {/* Logistics Information */}
        <div className="space-y-1 pt-1">
          {product.estDelivery && (
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Est delivery:</span>{" "}
              {product.estDelivery}
            </p>
          )}

          {product.deliveryLocation && (
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Delivery locations:</span>{" "}
              {product.deliveryLocation}
            </p>
          )}
        </div>

        {/* --- Variant Selectors (Quantity, Color, Size) --- */}
        <div className="flex items-center gap-4 py-1">
          <span className="font-semibold text-gray-800 text-sm w-16">
            Quantity
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600 font-bold text-lg pb-0.5 transition-colors"
            >
              -
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white font-bold text-lg pb-0.5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-4 pt-1">
            <span className="font-semibold text-gray-800 text-sm w-16">
              Color
            </span>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedColor === color
                      ? "bg-yellow-200 text-black"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-4 pt-1">
            <span className="font-semibold text-gray-800 text-sm w-16">
              Size
            </span>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedSize === size
                      ? "bg-yellow-200 text-black"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- Reviews Section --- */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 space-y-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-gray-900">
                Customer Reviews
              </h2>
              {productReviewsCount > 0 && (
                <span className="bg-lily/10 text-lily text-xs font-bold px-2 py-0.5 rounded-full">
                  {productReviewsCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-semibold text-lily hover:text-lily/80 transition-colors px-3 py-1.5 rounded-full border border-lily/30 hover:bg-lily/5"
            >
              Write Review
            </button>
          </div>

          {/* Rating Summary */}
          {reviewsArray.length > 0 && (
            <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
              <div className="text-center px-4 py-2 bg-lily rounded-xl">
                <p className="text-3xl font-black text-white">
                  {Number(productRating).toFixed(1)}
                </p>
                <div className="flex items-center justify-center mt-1">
                  <ReviewStars
                    rating={Math.round(Number(productRating))}
                    size={12}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-2">
                  Based on {productReviewsCount} reviews
                </p>
                <div className="flex items-center gap-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 w-4">{star}</span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {reviewsToShow.map((review) => (
              <ProductReview key={review.id} review={review} />
            ))}
          </div>

          {reviewsArray.length === 0 && (
            <div className="text-center py-6 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <ReviewStars rating={0} size={20} />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                No reviews yet
              </p>
              <p className="text-xs text-gray-400">
                Be the first to share your thoughts!
              </p>
            </div>
          )}

          {hasMoreReviews && (
            <button
              onClick={handleViewAll}
              className="w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-lily hover:bg-lily/5 rounded-xl transition-colors border border-gray-200 hover:border-lily/30"
            >
              {showAllReviews
                ? "Show Less"
                : `View All ${productReviewsCount} Reviews`}
            </button>
          )}
        </div>

        {/* --- Vendor Details Section --- */}
        <div className="pt-6 pb-15 border-t border-gray-200 space-y-3">
          <h3 className="font-bold text-md text-gray-900">Vendor details</h3>
          <div className="flex items-center space-x-3 mt-1">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/icons/user.svg"
                alt="vendor avatar"
                className="w-5 h-5 opacity-60"
              />
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <Link
                  to={profileLink}
                  className="font-bold text-gray-900 hover:underline"
                >
                  {displayUsername}
                </Link>
                <img
                  src="/icons/verified.svg"
                  alt="verified"
                  className="w-4 h-4"
                />
              </div>
              <button
                onClick={handleFollow}
                className={`px-3 py-0.5 rounded-full text-xs font-semibold transition-colors border ${
                  isFollowed
                    ? "bg-green-600 text-white border-green-600"
                    : "text-green-600 border-green-600 bg-white hover:bg-green-50"
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-800 leading-relaxed pt-1">
            {vendorDescription}
          </p>

          <div className="flex space-x-6 text-sm text-gray-800 pt-3 pb-2">
            <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
              <img src="/icons/mail2.svg" alt="Message" className="w-5 h-5" />
              <span className="font-medium">Message</span>
            </button>
            {product.vendorNumber && (
              <a
                href={`tel:${product.vendorNumber}`}
                className="flex items-center space-x-2 hover:text-green-600 transition-colors"
              >
                <img src="/icons/phone.svg" alt="Call" className="w-5 h-5" />
                <span className="font-medium">Call {product.vendorNumber}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* --- Fixed Bottom Call-To-Action Actions --- */}
      <div className="fixed bottom-0 w-full md:max-w-xl z-30 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="p-4 w-full">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || isAddedToCart || isOutOfStock}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                isOutOfStock
                  ? "border-2 border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                  : isAddedToCart
                    ? "border-2 border-gray-300 text-gray-500 bg-gray-50 opacity-70 cursor-not-allowed"
                    : isAddingToCart
                      ? "border-2 border-gray-300 text-gray-500 bg-gray-50 opacity-70 cursor-wait"
                      : "border-2 border-lily text-lily hover:bg-green-50"
              }`}
            >
              {isAddingToCart ? (
                "Adding..."
              ) : isAddedToCart ? (
                <>
                  <img src="/icons/cart-tick.svg" className="size-8 mr-2" />
                  Added to cart
                </>
              ) : (
                <>
                  <img src="/icons/cart-add2.svg" className="size-8 mr-2" />
                  Add to cart
                </>
              )}
            </button>
            <button
              onClick={handleCheckout}
              disabled={isOutOfStock}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-lily text-white shadow-md hover:bg-green-700 hover:shadow-lg"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        shopId={product.shop}
        shopName={product.shop_name || product.name || product.title}
      />
    </div>
  );
};

export default ProductItem;
