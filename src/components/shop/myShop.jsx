// src/components/shop/myShop.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProfile } from "../../redux/profileSlice";
import { resetDeleteShopState } from "../../redux/deleteShopSlice";
import Delete from "./delete";
import MyShopSkeleton from "../loaders/myShopSkeleton";
import ErrorDisplay from "../common/ErrorDisplay";
import {
  Store, Plus, Package, TrendingUp, Users, Edit,
  Trash2, Megaphone, BarChart3, ChevronRight
} from "lucide-react";

const MyShop = () => {
  const [delIsOpen, setDelIsOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    shops,
    status: fetchShopsStatus,
    error: fetchShopsError,
  } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { deleteStatus: currentDeleteShopStatus } = useSelector(
    (state) => state.deleteShop
  );
  
  const shopDeleteActuallySucceeded = currentDeleteShopStatus === "succeeded";
  const [shopDeleteSuccessMsg, setShopDeleteSuccessMsg] = useState("");

  const toggleDel = (shop_id = null) => {
    setSelectedShopId(shop_id);
    setDelIsOpen((prev) => !prev);
    if (delIsOpen) {
      setShopDeleteSuccessMsg("");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (fetchShopsStatus === "idle" || fetchShopsStatus === "failed") {
      dispatch(fetchProfile());
    }
  }, [dispatch, fetchShopsStatus, isAuthenticated, navigate]);

  useEffect(() => {
    if (shopDeleteActuallySucceeded) {
      setShopDeleteSuccessMsg("Shop deleted successfully!");
      setDelIsOpen(false);
      setSelectedShopId(null);
      dispatch(resetDeleteShopState());

      const timer = setTimeout(() => {
        setShopDeleteSuccessMsg("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shopDeleteActuallySucceeded, dispatch]);

  useEffect(() => {
    if (!delIsOpen && (currentDeleteShopStatus === "succeeded" || currentDeleteShopStatus === "failed")) {
      dispatch(fetchProfile());
    }
  }, [delIsOpen, currentDeleteShopStatus, dispatch]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-lily/10 p-2 rounded-xl">
                <Store className="w-6 h-6 text-lily" />
              </div>
              <div>
                <h1 className="text-xl font-bold">My Shops</h1>
                <p className="text-sm text-gray-500">
                  {shops?.length || 0} shop{shops?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <Link to="/createShop">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-lily text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-darklily transition shadow-lg shadow-lily/20"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Shop</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {shopDeleteSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-4 mt-4"
          >
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
              <p className="font-semibold">{shopDeleteSuccessMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {fetchShopsStatus === "failed" && fetchShopsError && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <ErrorDisplay
            message={typeof fetchShopsError === "string" ? fetchShopsError : fetchShopsError.message || "Could not fetch your shops."}
            center={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        {shops && shops.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-lily/10 p-3 rounded-lg">
                  <Store className="w-5 h-5 text-lily" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{shops.length}</p>
                  <p className="text-xs text-gray-500">Total Shops</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {shops.reduce((acc, shop) => acc + (shop.products?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-500">Sales</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-500">Visitors</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shops Grid */}
        {fetchShopsStatus === "loading" && (!shops || shops.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <MyShopSkeleton key={index} />
            ))}
          </div>
        ) : fetchShopsStatus === "succeeded" && shops && shops.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {shops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Shop Image */}
                <div className="relative h-48 overflow-hidden">
                  {shop.image_url ? (
                    <img
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={shop.image_url}
                      alt={shop.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lily/10 to-lily/5">
                      <Store size={48} className="text-lily/30" />
                    </div>
                  )}
                  
                  {/* Overlay Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    {shop.category || "Shop"}
                  </div>
                </div>

                {/* Shop Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate text-lily">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
                    {shop.description || "No description"}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Package size={14} />
                    <span>{shop.products?.length || 0} products</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/shop/${shop.id}/products`}
                        className="flex items-center justify-center gap-1 bg-lily/10 text-lily py-2 rounded-lg text-sm font-semibold hover:bg-lily/20 transition"
                      >
                        <Package size={16} />
                        Products
                      </Link>
                      <Link
                        to={`/shop/${shop.id}/step1`}
                        className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                      >
                        <Megaphone size={16} />
                        Ads
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/editShop/${shop.id}/edit-shop`}
                        className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleDel(shop.id)}
                        disabled={currentDeleteShopStatus === "loading" && selectedShopId === shop.id}
                        className="flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : fetchShopsStatus === "succeeded" && (!shops || shops.length === 0) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl p-12 max-w-md mx-auto border border-gray-200">
              <div className="bg-lily/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store size={48} className="text-lily" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No shops yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first shop and start selling!
              </p>
              <Link to="/createShop">
                <button className="bg-lily text-white px-8 py-3 rounded-xl font-semibold hover:bg-darklily transition flex items-center gap-2 mx-auto">
                  <Plus size={20} />
                  Create Your First Shop
                </button>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Delete Modal */}
      {delIsOpen && selectedShopId && (
        <Delete
          delIsOpen={delIsOpen}
          toggleDel={toggleDel}
          shop_id={selectedShopId}
          entityName="shop"
        />
      )}
    </div>
  );
};

export default MyShop;