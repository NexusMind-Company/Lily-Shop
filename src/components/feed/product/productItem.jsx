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
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { addToCart } from "../../../redux/cartSlice";
import { likeProduct, followUser } from "../../../services/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate, Link } from "react-router-dom";
import ProductReview from "./productReview";

const DESCRIPTION_CHAR_LIMIT = 100;

const CarouselVideoPlayer = ({ src, poster }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

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
    e.stopPropagation();
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

const ProductItem = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");

  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Interaction States
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Robust Media Extraction mapping backend response correctly
  const rawMedia =
    product.all_media_urls?.length > 0
      ? product.all_media_urls
      : product.media || product.media_url || product.image_url;

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

  // --- Like Mutation ---
  const { mutate: toggleLike } = useMutation({
    mutationFn: () => likeProduct(product.id),
    onMutate: () => {
      if (!isAuthenticated) return;
      setIsLiked((prev) => !prev);
    },
    onError: () => setIsLiked((prev) => !prev),
  });

  // --- Follow Mutation ---
  const { mutate: toggleFollow } = useMutation({
    mutationFn: () =>
      followUser(
        product.username || product.vendorName || product.user || "unknown",
      ),
    onMutate: () => {
      if (!isAuthenticated) return;
      setIsFollowed((prev) => !prev);
    },
    onError: () => setIsFollowed((prev) => !prev),
  });

  const handleLike = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleLike();
  };

  const handleFollow = () => {
    if (!isAuthenticated) return navigate("/login");
    toggleFollow();
  };

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    dispatch(addToCart({ product_id: product.id, quantity }));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) return navigate("/login");
    // Send standard direct buy format matched with CheckoutPage logic
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

  const formatPrice = (price) => {
    return Number(price).toLocaleString();
  };

  const reviewsArray = product.reviewsData || [];
  const reviewsToShow = showAllReviews
    ? reviewsArray
    : reviewsArray.slice(0, 3);
  const hasMoreReviews = reviewsArray.length > 3;

  // Safe Username Display & Navigation
  const displayUsername =
    product.shop_name || product.username || product.user || "Unknown Vendor";
  const profileLink = product.shop
    ? `/shop/${product.shop}`
    : `/profile/${product.user_id || product.userId}`;

  return (
    <div className="relative bg-white w-full md:max-w-xl mx-auto h-full min-h-screen shadow-sm">
      <div className="p-4 space-y-3 pb-28">
        <div className="w-full aspect-8/10 relative group bg-gray-100 rounded-lg overflow-hidden">
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
              className="w-full h-full bg-black rounded-lg"
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
          <button
            onClick={() => navigate(-1)}
            className="bg-ash/70 absolute top-2 left-2 z-20 rounded-full p-1 cursor-pointer text-white"
          >
            <ChevronLeft size={28} />
          </button>
        </div>

        <div className="flex justify-between items-start pt-2">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">
              {product.productName ||
                product.title ||
                product.name ||
                "Untitled Product"}
            </h2>
            <span className="text-ash flex items-center mt-1">
              <img src="/icons/star2.svg" alt="" className="mr-1 w-4 h-4" />
              {product.rating || 0} ({product.reviews || 0})
            </span>
          </div>

          <button onClick={handleLike} className="p-2">
            <Heart
              size={28}
              fill={isLiked ? "red" : "none"}
              color={isLiked ? "red" : "black"}
            />
          </button>
        </div>

        <p className="text-green-600 font-bold text-xl">{`₦${formatPrice(displayPrice)}`}</p>

        {product.caption && (
          <motion.p layout className="text-sm font-normal text-gray-600">
            {isExpanded
              ? product.caption
              : `${product.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}`}
            {product.caption.length > DESCRIPTION_CHAR_LIMIT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-semibold ml-1 opacity-80 text-lily hover:underline"
              >
                {isExpanded ? "...less" : "...see more"}
              </button>
            )}
          </motion.p>
        )}

        {product.estDelivery && (
          <p className="font-semibold text-sm">
            Est delivery:{" "}
            <span className="font-normal text-gray-600">
              {product.estDelivery}
            </span>
          </p>
        )}

        {product.deliveryLocation && (
          <p className="font-semibold text-sm">
            Delivery Location:{" "}
            <span className="font-normal text-gray-600">
              {product.deliveryLocation}
            </span>
          </p>
        )}

        <div className="flex items-center gap-4 py-2">
          <span className="font-medium text-gray-700">Quantity</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-1 font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {product.colors && product.colors.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Color:</span>
            <div className="flex gap-2 mt-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                    selectedColor === color
                      ? "bg-green-600 text-white border-green-600"
                      : "hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Size:</span>
            <div className="flex gap-2 mt-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1.5 border rounded-full text-sm transition-colors ${
                    selectedSize === size
                      ? "bg-green-600 text-white border-green-600"
                      : "hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-6">
          <div className="flex justify-between items-center w-full">
            <h2 className="font-semibold text-lg text-gray-800">
              Reviews ({product.reviews || 0})
            </h2>
            {hasMoreReviews && (
              <button
                onClick={handleViewAll}
                className="text-lily font-semibold flex items-center hover:underline"
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

        <div className="pt-6 border-t border-gray-200 space-y-3">
          <h3 className="font-semibold text-md text-gray-800">
            Vendor Details
          </h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link
                to={profileLink}
                className="font-bold text-gray-800 hover:underline"
              >
                {displayUsername}
              </Link>
              <button
                onClick={handleFollow}
                className={`${
                  isFollowed
                    ? "bg-lily text-white"
                    : "text-lily border border-lily hover:bg-green-50"
                } px-3 py-1 rounded-full text-xs font-medium transition-colors`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </div>
          </div>
          {product.vendorDetail && (
            <p className="text-sm text-gray-600">{product.vendorDetail}</p>
          )}
          <div className="flex space-x-6 text-sm text-gray-700 pt-2">
            <button className="flex items-center space-x-2 hover:text-lily transition-colors">
              <img src="/icons/mail2.svg" alt="Message" className="w-5 h-5" />
              <span className="font-medium">Message</span>
            </button>
            {product.vendorNumber && (
              <a
                href={`tel:${product.vendorNumber}`}
                className="flex items-center space-x-2 hover:text-lily transition-colors"
              >
                <img src="/icons/phone.svg" alt="Call" className="w-5 h-5" />
                <span className="font-medium">Call Vendor</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto p-4">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                isAddedToCart
                  ? "border-2 border-gray-300 text-gray-500 bg-gray-50"
                  : "border-2 border-lily text-lily hover:bg-green-50"
              }`}
            >
              {isAddedToCart ? "Added to cart" : "Add to cart"}
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-lily text-white py-3 rounded-xl font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition-all"
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
