import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useFeed } from "../../../context/feedContext";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Share2, MessageCircle, 
  Plus, Minus, ChevronLeft, CheckCircle2,
  Star, MapPin, Package, Shield
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

// Styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// --- API Function (Ideally move this to api.js) ---
const fetchProductById = async (id) => {
  const res = await fetch(`/api/product/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

const ProductDetails = () => {
  // --- 1. Data Architecture (From your simplistic component) ---
  const { id } = useParams();
  const navigate = useNavigate(); // Needed for the back button
  const { posts } = useFeed(); 

  // Try to find in context first
  const productFromContext = posts.find((p) => String(p.id) === id);

  // Fallback to API
  const {
    data: productFromApi,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !productFromContext,
  });

  const product = productFromContext || productFromApi;

  // --- 2. UI Logic & State (From the rich component) ---
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Helper: Format Price
  const formatPrice = (kobo) => {
    // Fallback if price is just a number
    const price = kobo || 0; 
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  // Handler: Add to Cart
  const handleAddToCart = async () => {
    setAddingToCart(true);
    
    // Simulate API call or Context update here
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAddingToCart(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Handler: Buy Now
  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout logic would go here
    setTimeout(() => {
        console.log("Navigate to checkout with", product, quantity);
    }, 600);
  };

  // Handler: Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // --- 3. Render States ---
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (error) return <div className="flex h-screen items-center justify-center">Error loading product.</div>;
  if (!product) return <div className="flex h-screen items-center justify-center">Product not found.</div>;

  // --- 4. Main Rich UI Render ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24"> 
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setLiked(!liked)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Heart 
                className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Product Media Carousel */}
      <div className="relative bg-white">
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ type: 'fraction' }}
          navigation={true}
          className="aspect-square"
        >
          {product.media?.length > 0 ? (
            product.media.map((item, index) => (
              <SwiperSlide key={index}>
                {item.type === 'video' ? (
                   <video
                     src={item.url || item.media_url}
                     playsInline loop muted autoPlay
                     className="w-full h-full object-cover"
                   />
                ) : (
                  <img
                    src={item.url || item.media_url}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </SwiperSlide>
            ))
          ) : (
            // Fallback if no media exists
            <SwiperSlide>
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    No Image
                 </div>
            </SwiperSlide>
          )}
        </Swiper>
        
        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="bg-white mt-2 px-4 py-5">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-lily">
              {formatPrice(product.price_kobo || product.price * 100)}
            </span>
            {product.sold > 0 && (
              <span className="text-gray-500 text-sm">
                {product.sold}+ sold
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
            </div>
            <span className="text-gray-500">({product.reviews || 0} reviews)</span>
          </div>
        )}

        {/* Seller Info */}
        {product.shop && (
          <div 
            onClick={() => console.log("Navigate to shop", product.shop.id)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <img 
                src={product.shop.image_url || '/user.png'} 
                alt={product.shop.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{product.shop.name}</span>
                  {product.shop.verified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                {product.shop.rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.shop.rating}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
              Follow
            </button>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-3 mb-6">
          {product.shipping && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Package className="w-5 h-5 text-gray-400" />
              <span>{product.shipping}</span>
            </div>
          )}
          {product.location && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{product.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Buyer protection guaranteed</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white mt-2 px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Reviews ({product.reviews || 0})</h3>
          <button className="text-blue-600 text-sm font-semibold">See all</button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Message Seller */}
          <button 
            onClick={() => console.log("Message seller")}
            className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <MessageCircle className="w-6 h-6 text-gray-600" />
          </button>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold min-w-[30px] text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={quantity >= (product.stock || 0)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <button 
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="flex-1 bg-blue-100 text-blue-600 border-2 border-blue-100 py-3 rounded-xl font-bold hover:bg-blue-200 transition disabled:opacity-50"
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>

          {/* Buy Now */}
          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="font-semibold text-lg">Added to cart!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareMenu(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-6"
            >
              <h3 className="font-bold text-lg mb-4">Share Product</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
                >
                  Copy Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;