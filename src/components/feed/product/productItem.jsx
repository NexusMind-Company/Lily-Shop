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
} from "lucide-react";

import { useDispatch } from "react-redux";
import { addItemToCart } from "../../../redux/cartSlice";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router";
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
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const payload = {
      id: product.id,
      username: product.username,
      mediaSrc: product.media[0].src,
      productName: product.productName || product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
      pickupAddress: product.pickupAddress,
      deliveryAddress: product.deliveryAddress,
      deliveryCharge: product.deliveryCharge,
      deliveryTime: product.deliveryTime,
    };
    setIsAddedToCart(true);
    // setTimeout(() => setIsAddedToCart(false), 3000); // You can re-enable this

    dispatch(addItemToCart(payload));
  };

  const handleCheckout = () => {
    // First, add the item to the cart
    const payload = {
      id: product.id,
      username: product.username,
      mediaSrc: product.media[0].src,
      productName: product.productName || product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
    };
    dispatch(addItemToCart(payload));

    // Then, navigate to the cart page, passing this item's ID
    // so the cart page knows what to display.
    navigate("/checkout", {
      state: { selectedItemIds: [product.id] },
    });
  };

  const handleViewAll = () => {
    setShowAllReviews((prev) => !prev);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const reviewsArray = product.reviewsData || [];
  const reviewsToShow = showAllReviews
    ? reviewsArray
    : reviewsArray.slice(0, 3);
  const hasMoreReviews = reviewsArray.length > 3;

  return (
    <div className="relative bg-white w-full md:max-w-xl mx-auto min-h-screen">
      <div className="p-4 space-y-3 pb-28">
        <div className="w-full aspect-8/10 relative group">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            loop={product.media.length > 1}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            className="w-full h-full bg-black rounded-lg"
          >
            {product.media.map((item, index) => (
              <SwiperSlide key={index}>
                {item.type === "video" ? (
                  <CarouselVideoPlayer src={item.src} poster={item.poster} />
                ) : (
                  <img
                    src={item.src}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          {product.media.length > 1 && (
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
            className="bg-ash/70 absolute top-1 left-2 z-10 rounded-full p-1 cursor-pointer "
          >
            <ChevronLeft size={28} />
          </button>
        </div>

        {/* ... (Rest of your component: Title, Price, Description, etc. - no changes) ... */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="font-semibold text-lg">
            {product.productName || product.title}
          </h2>
          <span className="text-ash flex items-center">
            <img src="/icons/star2.svg" alt="" /> {product.rating} (
            {product.reviews})
          </span>
        </div>
        <p className="text-green-700 font-semibold">{`N${formatPrice(
          product.price
        )}`}</p>
        <motion.p layout className="text-sm font-normal">
          {isExpanded
            ? product.caption
            : `${product.caption.substring(0, DESCRIPTION_CHAR_LIMIT)}`}
          {product.caption.length > DESCRIPTION_CHAR_LIMIT && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-semibold ml-1 opacity-80 text-lily"
            >
              {isExpanded ? "...less" : "...see more"}
            </button>
          )}
        </motion.p>
        <p className="font-semibold">
          Est delivery:{" "}
          <span className="font-normal">{product.estDelivery}</span>
        </p>
        <p className="font-semibold">
          Delivery Location:{" "}
          <span className="font-normal">{product.deliveryLocation}</span>
        </p>
        <div className="flex items-center gap-2">
          <span>Quantity</span>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-2 py-1 border rounded"
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-2 py-1 border rounded"
          >
            +
          </button>
        </div>
        <div>
          <span>Color:</span>
          <div className="flex gap-2 mt-1">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-1 rounded-full border ${
                  selectedColor === color ? "bg-green-600 text-white" : ""
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span>Size:</span>
          <div className="flex gap-2 mt-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 border rounded-full ${
                  selectedSize === size ? "bg-green-600 text-white" : ""
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center w-full">
            <h2 className="font-semibold text-lg">
              Reviews ({product.reviews})
            </h2>
            {hasMoreReviews && (
              <button
                onClick={handleViewAll}
                className="text-red-400 font-semibold flex items-center"
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
            <p className="text-gray-500 text-sm">
              No reviews yet for this product.
            </p>
          )}
        </div>
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <h3 className="font-semibold text-md">Vendor Details</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <p className="font-bold">{product.username}</p>
              <button className="text-lily border border-lily px-2 py-0.5 rounded-full text-xs">
                Follow
              </button>
            </div>
          </div>
          <p className="text-sm">{product.vendorDetail}</p>
          <div className="flex space-x-4 text-sm text-gray-700">
            <button className="flex items-center space-x-1">
              <img src="/icons/mail2.svg" alt="Message" className="w-4 h-4" />
              <span>Message</span>
            </button>
            <a
              href={`tel:${product.vendorNumber}`}
              className="flex items-center space-x-1"
            >
              <img src="/icons/phone.svg" alt="Call" className="w-4 h-4" />
              <span>Call +234 80X XXX XXXX</span>
            </a>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-t-lg">
        <div className="max-w-xl mx-auto p-4">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isAddedToCart
                  ? "border-2 border-ash text-ash bg-gray-100"
                  : "border-2 border-lily text-lily hover:bg-green-50"
              }`}
            >
              {isAddedToCart ? "Added to cart" : "Add to cart"}
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-lily text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
