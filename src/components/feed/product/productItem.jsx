import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
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
import { Link, useNavigate } from "react-router";

// --- START CarouselVideoPlayer (Moved inline for self-containment) ---
const CarouselVideoPlayer = ({ src, poster }) => {
  // Assuming useFeed context is still available or we can mock isMuted/toggleMute
  // For this example, let's simplify without context:
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
    e.stopPropagation(); // Prevent Swiper from also handling click
    if (videoRef.current?.paused) videoRef.current?.play();
    else videoRef.current?.pause();
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent Swiper from also handling click
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
        muted={isMuted} // Use local state for muted
        className="w-full h-full object-cover" // object-cover for video on product page
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
//End for carousel videoplayer

const ProductItem = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const payload = {
      id: product.id,
      productName: product.productName || product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
    };

    dispatch(addItemToCart(payload));

    console.log(
      `Dispatched item to cart: ${payload.productName} x ${payload.quantity}`
    );
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 space-y-3 max-w-md mx-auto w-full">
      {/* Media Carousel - Now fully integrated and styled */}
      <div className="w-full aspect-square relative group">
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
                  className="w-full h-full object-cover" // Use object-cover for images on product page
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons (Visible on hover on desktop) */}
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

      {/* Title, Price, Rating */}
      <div className="flex justify-between items-center pt-2">
        <h2 className="font-semibold text-lg">
          {product.productName || product.title}
        </h2>
        <span className="text-gray-600 flex items-center">
          ⭐ {product.rating} ({product.reviews})
        </span>
      </div>
      <p className="text-green-700 font-semibold">{`N${formatPrice(
        product.price
      )}`}</p>

      {/* Description */}
      <p className="text-gray-500 text-sm">
        {product.caption || product.description}
      </p>

      {/* Quantity Selector */}
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

      {/* Color Selector */}
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

      {/* Size Selector */}
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

      {/* Action Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 border-2 border-lily text-lily py-2 rounded-lg hover:bg-green-50"
        >
          Add to cart
        </button>
        <button className="flex-1 bg-lily text-white py-2 rounded-lg">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
