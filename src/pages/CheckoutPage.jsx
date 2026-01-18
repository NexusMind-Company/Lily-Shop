// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Wallet, CreditCard, Lock, ShoppingBag, 
  AlertCircle, CheckCircle2, Plus, ChevronRight 
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

  useEffect(() => {
    dispatch(fetchCart());
    fetchWalletBalance();
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

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) return;
    if (paymentMethod === "wallet" && walletBalance < cart.total_price_naira) return;

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

  const insufficientBalance = paymentMethod === "wallet" && walletBalance < cart.total_price_naira;

  // Loading State
  if (cartLoading || loadingWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-pink-200 border-t-pink-600 rounded-full"
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
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
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Start Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-8">
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
              <Lock className="w-4 h-4 text-green-600" />
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
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
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-1">Order Failed</p>
                    <p className="text-sm text-red-700">
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
            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-pink-600" />
                  Payment Method
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Wallet Payment */}
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`block relative cursor-pointer group`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-xl p-5 transition-all ${
                    paymentMethod === "wallet" 
                      ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md" 
                      : "border-gray-200 hover:border-pink-300 bg-white"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          paymentMethod === "wallet" 
                            ? "bg-gradient-to-br from-pink-500 to-purple-600" 
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
                          insufficientBalance ? "text-red-600" : "text-green-600"
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
                          className="mt-3 pt-3 border-t border-pink-200"
                        >
                          <div className="flex items-start space-x-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">
                              Insufficient balance. Top up ₦{(cart.total_price_naira - walletBalance).toLocaleString()} more.
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
                        <div className="bg-pink-600 rounded-full p-1">
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
                  <div className={`border-2 rounded-xl p-5 transition-all ${
                    paymentMethod === "paystack" 
                      ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md" 
                      : "border-gray-200 hover:border-pink-300 bg-white"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        paymentMethod === "paystack" 
                          ? "bg-gradient-to-br from-pink-500 to-purple-600" 
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
                          <div className="bg-pink-600 rounded-full p-1">
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-pink-600" />
                  Order Items ({cart.total_items})
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="relative">
                        <img
                          src={item.product.image_url || item.product.media_url || "/placeholder.png"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ₦{(item.subtotal_naira / item.quantity).toLocaleString()} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ₦{item.subtotal_naira.toLocaleString()}
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
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24"
            >
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span className="font-semibold">₦{cart.total_price_naira.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-sm">Varies by seller</span>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        ₦{cart.total_price_naira.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={!processing && !orderLoading && !insufficientBalance ? { scale: 1.02 } : {}}
                  whileTap={!processing && !orderLoading && !insufficientBalance ? { scale: 0.98 } : {}}
                  onClick={handlePlaceOrder}
                  disabled={processing || orderLoading || insufficientBalance}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                    processing || orderLoading || insufficientBalance
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
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

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
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