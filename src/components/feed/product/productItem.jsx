import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { motion as Motion } from "framer-motion";
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
import toast from "react-hot-toast";
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

const DESCRIPTION_CHAR_LIMIT = 100;

// Utility to format large numbers (e.g., 1500 -> 1.5k)
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
  const [viewCount, setViewCount] = useState(
    Number(product.visit_count || product.view_count || product.views || 0),
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

  const displayPrice =
    product.price_in_naira ??
    (product.price_kobo !== undefined ? Number(product.price_kobo) / 100 : null) ??
    product.price ??
    0;
  const productOwnerId =
    product.user_id || product.user?.id || product.shop?.owner?.id || null;

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
        setViewCount((prev) => prev + 1);
        setHasViewed(true);

        recordProductView(product.id).catch((err) => {
          console.log(err);
          // Rollback view count on failure
          setViewCount((prev) => Math.max(0, prev - 1));
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
    mutationFn: () => {
      if (!productOwnerId) {
        throw new Error("Product owner not found");
      }
      return followUser(productOwnerId);
    },
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
      toast.success("Added to cart.");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAddedToCart(false);
      setIsAddingToCart(false);
      toast.error(
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
  const profileLink =
    typeof product.shop === "string" || typeof product.shop === "number"
      ? `/shop/${product.shop}`
      : product.shop?.id
        ? `/shop/${product.shop.id}`
        : `/profile/${productOwnerId || ""}`;

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
            <div>
              <p className="text-green-500 font-bold text-lg">
                {`${"\u20A6"}${formatPrice(displayPrice)}`}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
                {viewCount.toLocaleString()} views
              </p>
            </div>
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
          <Motion.p
            layout
            className="text-sm font-normal text-gray-800 leading-relaxed"
          >
            {isExpanded
              ? product.caption
              : `${product.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}`}
            {product.caption.length > DESCRIPTION_CHAR_LIMIT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-medium ml-1 text-green-600 hover:underline"
              >
                {isExpanded ? "...less" : "...see more"}
              </button>
            )}
          </Motion.p>
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
        <div className="space-y-4 pt-6">
          <div className="flex justify-between items-center w-full">
            <h2 className="font-bold text-md text-gray-900">
              Reviews ({productReviewsCount})
            </h2>
            {hasMoreReviews && (
              <button
                onClick={handleViewAll}
                className="text-pink-500 text-sm font-medium hover:underline"
              >
                {showAllReviews ? "Collapse" : "View all"}
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {reviewsToShow.map((review) => (
              <ProductReview key={review.id} review={review} />
            ))}
          </div>
          {reviewsArray.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No reviews yet for this product.
            </p>
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
    </div>
  );
};

export default ProductItem;
