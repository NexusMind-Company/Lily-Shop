// src/pages/OrderSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Package, MapPin, MessageCircle, 
  ArrowRight, Download, Share2, Sparkles, Home
} from 'lucide-react';
import { fetchCart } from '../redux/cartSlice';
import Confetti from 'react-confetti';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { order, paymentMethod } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    dispatch(fetchCart());
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/feed')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <Sparkles className="w-32 h-32 text-pink-600" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Sparkles className="w-40 h-40 text-purple-600" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Success Animation */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4 shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for shopping with Lily Shop
            </p>
          </motion.div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">Order Reference</p>
                <p className="text-white text-xl sm:text-2xl font-bold font-mono">
                  {order.reference}
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full self-start sm:self-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-semibold capitalize">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4"
              >
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <div className="flex items-center space-x-2">
                  {paymentMethod === 'wallet' ? (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">LW</span>
                      </div>
                      <p className="font-bold text-gray-800">Lily Wallet</p>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PS</span>
                      </div>
                      <p className="font-bold text-gray-800">Paystack</p>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4"
              >
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-bold text-gray-800">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4"
              >
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  NGN {order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}
                </p>
              </motion.div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-pink-600" />
                Items Ordered ({order.items?.length})
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {order.items?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="relative">
                      <img
                        src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        NGN {(item.price_kobo / 100).toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        NGN {(item.subtotal_kobo / 100).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid sm:grid-cols-2 gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>View My Orders</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/feed')}
            className="bg-white text-gray-800 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-pink-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Continue Shopping</span>
          </motion.button>
        </motion.div>

        {/* Next Steps Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100"
        >
          <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            What happens next?
          </h3>
          <div className="space-y-3">
            {[
              {
                icon: <MapPin className="w-5 h-5" />,
                text: "The seller has been notified and will prepare your order"
              },
              {
                icon: <MessageCircle className="w-5 h-5" />,
                text: "Contact the seller via messages to arrange delivery details"
              },
              {
                icon: <Package className="w-5 h-5" />,
                text: "Your payment is held securely until you confirm delivery"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  {step.icon}
                </div>
                <p className="text-blue-900 pt-2 leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Share/Download Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 flex justify-center space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:border-pink-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download Receipt</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;