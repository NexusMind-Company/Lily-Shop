import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Wallet, CreditCard, Lock, ShoppingBag, 
  AlertCircle, CheckCircle2, Plus, ChevronRight, MapPin,
  Building2, Loader2, Package, Truck, Calendar, Shield
} from "lucide-react";
import {
  createOrder,
  selectCreateOrderLoading,
  selectCreateOrderError,
} from "../redux/orderSlice";
import {
  fetchCart,
  selectCart,
  selectCartItems,
  selectCartIsLoading,
  clearCart,
} from "../redux/cartSlice";
import api from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const cartLoading = useSelector(selectCartIsLoading);
  const orderLoading = useSelector(selectCreateOrderLoading);
  const orderError = useSelector(selectCreateOrderError);

  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
    fetchWalletBalance();
    fetchDeliveryAddress();
  }, [dispatch]);

  useEffect(() => {
    if (orderError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [orderError]);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get("/wallet/me/");
      setWalletBalance(response.data.balance_naira || 0);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchDeliveryAddress = async () => {
    try {
      const response = await api.get("/auth/profile/me/");
      setDeliveryAddress(response.data.deliveryAddress || null);
    } catch (error) {
      console.error("Failed to fetch address:", error);
    }
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => sum + (item.subtotal_naira || 0), 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    // Calculate delivery fee (can be customized)
    return cartItems?.length > 0 ? 500 : 0;
  }, [cartItems]);

  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    // Validate address
    if (!deliveryAddress) {
      alert("Please add a delivery address before proceeding.");
      navigate("/add-address", { state: { from: "/checkout" } });
      return;
    }

    if (!cartItems || cartItems.length === 0) return;
    if (paymentMethod === "wallet" && walletBalance < total) return;

    setProcessing(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        payment_method: paymentMethod,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      if (result.payment_result) {
        if (result.payment_result.status === "paid") {
          await dispatch(clearCart());
          navigate("/order-success", { state: { order: result, paymentMethod } });
        } else if (result.payment_result.authorization_url) {
          window.location.href = result.payment_result.authorization_url;
        }
      }
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const insufficientBalance = paymentMethod === "wallet" && walletBalance < total;

  // Get product image helper
  const getProductImage = (item) => {
    return (
      item.product?.image_url ||
      item.product?.media_url ||
      item.product?.primary_media_url ||
      "/placeholder-image.png"
    );
  };

  // Loading State
  if (cartLoading || loadingWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-lily-200 border-t-lily-600 rounded-full"
            />
          </div>
          <p className="text-gray-600 font-medium">Preparing checkout...</p>
        </motion.div>
      </div>
    );
  }

  // Empty Cart State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some amazing products to get started!</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/feed")}
            className="bg-gradient-to-r from-lily-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Start Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate("/cart")}
              className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back to Cart</span>
            </motion.button>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-success" />
              <span className="text-sm text-gray-600 font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </motion.div>

        {/* Error Toast */}
        <AnimatePresence>
          {showError && orderError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-20 right-4 z-50 max-w-sm"
            >
              <div className="bg-error/10 border-2 border-error/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-error mb-1">Order Failed</p>
                    <p className="text-sm text-error/80">
                      {orderError?.error || "Failed to create order. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-lily-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-lily-600" />
                  Delivery Address
                </h2>
              </div>

              <div className="p-6">
                {deliveryAddress ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">{deliveryAddress}</p>
                  </div>
                ) : (
                  <div className="bg-warning/10 border-2 border-warning/20 rounded-2xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-warning">No Address Set</p>
                        <p className="text-sm text-warning/80">Please add a delivery address</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => navigate("/add-address", { state: { from: "/checkout" } })}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-lily-600 font-semibold hover:border-lily-500 hover:bg-lily-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>{deliveryAddress ? "Change Address" : "Add Address"}</span>
                </button>
              </div>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-lily-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-lily-600" />
                  Payment Method
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Wallet Payment */}
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="block relative cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-2xl p-5 transition-all ${
                    paymentMethod === "wallet" 
                      ? "border-lily-500 bg-gradient-to-br from-lily-50 to-purple-50 shadow-md" 
                      : "border-gray-200 hover:border-lily-300 bg-white"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          paymentMethod === "wallet" 
                            ? "bg-gradient-to-br from-lily-500 to-purple-600" 
                            : "bg-gray-100"
                        }`}>
                          <Wallet className={`w-6 h-6 ${
                            paymentMethod === "wallet" ? "text-white" : "text-gray-600"
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Lily Wallet</p>
                          <p className="text-sm text-gray-500">Instant payment</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Balance</p>
                        <p className={`text-lg font-bold ${
                          insufficientBalance ? "text-error" : "text-success"
                        }`}>
                          ₦{walletBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Insufficient Balance Warning */}
                    <AnimatePresence>
                      {paymentMethod === "wallet" && insufficientBalance && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-lily-200"
                        >
                          <div className="flex items-start space-x-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-error">
                              Insufficient balance. Top up ₦{(total - walletBalance).toLocaleString()} more.
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/wallet");
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Top Up Wallet</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected Indicator */}
                    {paymentMethod === "wallet" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4"
                      >
                        <div className="bg-lily-600 rounded-full p-1">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.label>

                {/* Paystack Payment */}
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="block relative cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-2xl p-5 transition-all ${
                    paymentMethod === "paystack" 
                      ? "border-lily-500 bg-gradient-to-br from-lily-50 to-purple-50 shadow-md" 
                      : "border-gray-200 hover:border-lily-300 bg-white"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        paymentMethod === "paystack" 
                          ? "bg-gradient-to-br from-lily-500 to-purple-600" 
                          : "bg-gray-100"
                      }`}>
                        <CreditCard className={`w-6 h-6 ${
                          paymentMethod === "paystack" ? "text-white" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Paystack</p>
                        <p className="text-sm text-gray-500">Card, Bank Transfer, USSD</p>
                      </div>
                      {paymentMethod === "paystack" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <div className="bg-lily-600 rounded-full p-1">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.label>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-lily-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-lily-600" />
                  Order Items ({cart?.total_items || cartItems?.length || 0})
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="relative">
                        <img
                          src={getProductImage(item)}
                          alt={item.product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-lily-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ₦{((item.subtotal_naira || 0) / (item.quantity || 1)).toLocaleString()} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ₦{(item.subtotal_naira || 0).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-24"
            >
              <div className="bg-gradient-to-r from-lily-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart?.total_items || 0} items)</span>
                    <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Delivery
                    </span>
                    <span className="font-semibold">₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                        ₦{total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={!processing && !orderLoading && !insufficientBalance ? { scale: 1.02 } : {}}
                  whileTap={!processing && !orderLoading && !insufficientBalance ? { scale: 0.98 } : {}}
                  onClick={handlePlaceOrder}
                  disabled={processing || orderLoading || insufficientBalance || !deliveryAddress}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                    processing || orderLoading || insufficientBalance || !deliveryAddress
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-lily-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {processing || orderLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Place Order</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Your payment is secured with industry-standard encryption. 
                      Funds are held safely until delivery is confirmed.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;