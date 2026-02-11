// src/components/shop/shopDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchShopById } from "../../redux/shopSlice";
import LoaderSd from "../loaders/loaderSd";
import ErrorDisplay from "../common/ErrorDisplay";
import Ratings from "./ratings";
import ContactVendorButton from "../subscription/ContactVendorButton";
import {
  ChevronLeft, MapPin, Phone, Share2, MessageCircle,
  Star, Store, Eye, Package, Grid3x3, ShoppingCart,
  Plus, Minus, Check, Heart
} from "lucide-react";

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    selectedShop: shop,
    status,
    error,
  } = useSelector((state) => state.shops);

  const [activeTab, setActiveTab] = useState("products");
  const [orderingProductId, setOrderingProductId] = useState(null);
  const [currentOrderQuantity, setCurrentOrderQuantity] = useState(1);
  const [following, setFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchShopById(id));
  }, [id, dispatch]);

  const handleStartOrder = (productId) => {
    setOrderingProductId(productId);
    setCurrentOrderQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    setCurrentOrderQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleConfirmOrder = (productId) => {
    console.log(`Order confirmed: Product ${productId}, Quantity: ${currentOrderQuantity}`);
    setOrderingProductId(null);
    navigate(`/checkout?product=${productId}&quantity=${currentOrderQuantity}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shop.name,
        text: `Check out ${shop.name} on Lily Shop`,
        url: window.location.href
      });
    } else {
      setShowShareMenu(true);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderSd />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay message={error} center={true} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay message="Shop not found." center={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-semibold text-lg truncate max-w-[60%]">
            {shop.name}
          </h2>
          <button onClick={handleShare}>
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Shop Cover */}
      <div className="relative h-64 bg-gradient-to-br from-lily/20 to-lily/5">
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store size={80} className="text-lily/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Shop Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end gap-4">
            <div className="bg-white p-1 rounded-2xl">
              <div className="w-20 h-20 bg-lily/10 rounded-xl flex items-center justify-center">
                <Store size={40} className="text-lily" />
              </div>
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">{shop.name}</h1>
              <p className="text-sm opacity-90">{shop.category || "Shop"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="bg-white pb-4">
        <div className="px-4 pt-4">
          {/* Stats */}
          <div className="flex items-center justify-around py-4 border-b border-gray-200">
            <div className="text-center">
              <p className="font-bold text-xl">{shop.products?.length || 0}</p>
              <p className="text-gray-600 text-sm">Products</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">{shop.visitor_count || 0}</p>
              <p className="text-gray-600 text-sm">Visitors</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">4.5</p>
              <p className="text-gray-600 text-sm">Rating</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFollowing(!following)}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                following
                  ? "bg-gray-100 text-gray-700"
                  : "bg-lily text-white"
              }`}
            >
              {following ? (
                <>
                  <Check size={18} />
                  Following
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Follow Shop
                </>
              )}
            </motion.button>

            <button className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              <MessageCircle size={20} />
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-4 space-y-3">
            {shop.owner_phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-lily" />
                <span>{shop.owner_phone}</span>
              </div>
            )}
            {shop.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-lily shrink-0 mt-0.5" />
                <span className="text-gray-600">{shop.address}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {shop.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {shop.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white mt-2">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "products"
                ? "border-lily text-lily"
                : "border-transparent text-gray-500"
            }`}
          >
            <Grid3x3 size={20} />
            <span className="text-sm font-semibold">Products</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "reviews"
                ? "border-lily text-lily"
                : "border-transparent text-gray-500"
            }`}
          >
            <Star size={20} />
            <span className="text-sm font-semibold">Reviews</span>
          </button>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {shop.products && shop.products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {shop.products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={product.image_url || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-semibold text-sm mb-1 truncate">
                          {product.name}
                        </h4>
                        <p className="text-lily font-bold mb-3">
                          ₦{product.price?.toLocaleString()}
                        </p>

                        {orderingProductId === product.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-2">
                              <button
                                onClick={() => handleQuantityChange(-1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-semibold min-w-[30px] text-center">
                                {currentOrderQuantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirmOrder(product.id)}
                                className="flex-1 bg-lily text-white py-2 rounded-lg text-sm font-semibold hover:bg-darklily transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setOrderingProductId(null)}
                                className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartOrder(product.id)}
                            className="w-full bg-lily text-white py-2 rounded-lg text-sm font-semibold hover:bg-darklily transition flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            Order
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No products yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="text-center py-16">
                <Star size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-6"
            >
              <h3 className="font-bold text-lg mb-4">Share Shop</h3>
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

export default ShopDetails;
