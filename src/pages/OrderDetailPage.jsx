// src/pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, MessageCircle, Printer, MapPin,
  Clock, CheckCircle2, XCircle, AlertCircle, Wallet, CreditCard, ChevronRight, Video, ShieldAlert
} from 'lucide-react';
import { fetchOrderDetail, fetchOrderPin, selectCurrentOrder, selectOrderPin, selectOrderLoading, selectOrderError } from '../redux/orderSlice';
import UnboxingModal from '../components/orders/UnboxingModal';
import DisputeModal from '../components/orders/DisputeModal';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isUnboxingModalOpen, setIsUnboxingModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const order = useSelector(selectCurrentOrder);
  const orderPin = useSelector(selectOrderPin);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order?.id) {
      // Fetch PIN for delivery verification
      if (order.status !== 'cancelled' && order.status !== 'failed') {
        dispatch(fetchOrderPin(order.id));
      }
    }
  }, [dispatch, order]);

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        color: 'from-green-400 to-emerald-600',
        textColor: 'text-green-800',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        title: 'Order Confirmed',
        subtitle: 'Your order has been confirmed and paid'
      },
      pending: {
        color: 'from-yellow-400 to-orange-500',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Clock className="w-8 h-8 text-white" />,
        title: 'Payment Pending',
        subtitle: 'Awaiting payment confirmation'
      },
      failed: {
        color: 'from-red-400 to-red-600',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <XCircle className="w-8 h-8 text-white" />,
        title: 'Payment Failed',
        subtitle: 'There was an issue with your payment'
      },
      cancelled: {
        color: 'from-gray-400 to-gray-600',
        textColor: 'text-gray-800',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <AlertCircle className="w-8 h-8 text-white" />,
        title: 'Order Cancelled',
        subtitle: 'This order has been cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  // Loading State
  if (loading) {
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
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This order does not exist'}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            View All Orders
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 p-6 sm:p-8 mb-6 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${statusConfig.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              {statusConfig.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl sm:text-3xl font-bold ${statusConfig.textColor} mb-1`}>
                {statusConfig.title}
              </h2>
              <p className={`${statusConfig.textColor} opacity-80`}>
                {statusConfig.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery PIN Section */}
            {orderPin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-pink-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 px-6 py-4 border-b border-pink-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-pink-600" />
                    Delivery Security PIN
                  </h3>
                </div>
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Provide this PIN to the delivery rider <b>only</b> when you have received and inspected your order.
                  </p>
                  <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-8 py-4 mb-2">
                    <span className="text-4xl font-mono font-bold tracking-widest text-gray-900">
                      {orderPin}
                    </span>
                  </div>
                  <p className="text-sm text-pink-600 font-medium">
                    Do not share this PIN before delivery.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-pink-600" />
                  Order Items ({order.items?.length})
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0 group cursor-pointer"
                      onClick={() => navigate(`/product/${item.product?.id}`)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                          alt={item.product?.name || 'Product'}
                          className="w-24 h-24 object-cover rounded-xl group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors mb-1 truncate">
                          {item.product?.name || 'Product'}
                        </h4>
                        {item.product?.shop_name && (
                          <p className="text-sm text-gray-500 mb-2">
                            Sold by {item.product.shop_name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            ₦{(item.price_kobo / 100).toLocaleString()} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-800">
                          ₦{(item.subtotal_kobo / 100).toLocaleString()}
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors mt-1 ml-auto" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-pink-600" />
                  Order Timeline
                </h3>
              </div>

              <div className="p-6">
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-pink-300 to-purple-300" />

                  {/* Order Placed */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg z-10">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-gray-800">Order Placed</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>

                  {/* Payment Status */}
                  {order.status === 'paid' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg z-10">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-gray-800">Payment Confirmed</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg z-10">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-gray-800">Awaiting Delivery</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Contact seller to arrange delivery
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24"
            >
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Order Summary</h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Order Reference */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Reference</p>
                  <p className="font-mono font-bold text-gray-800 break-all bg-gray-50 px-3 py-2 rounded-lg">
                    {order.reference}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Payment Method</p>
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    {order.payment_method === 'wallet' ? (
                      <>
                        <Wallet className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-gray-800">Lily Wallet</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">Paystack</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ₦{order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-sm">To be arranged</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        ₦{order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
                  {order.status === 'paid' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/inbox')}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Contact Seller</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.print()}
                        className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Printer className="w-5 h-5" />
                        <span>Print Receipt</span>
                      </motion.button>
                    </>
                  )}

                  {/* Escrow / Dispute Buttons (Available once out_for_delivery or delivered) */}
                  {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsUnboxingModalOpen(true)}
                        className="w-full border-2 border-purple-200 bg-purple-50 text-purple-700 py-3 rounded-xl font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Video className="w-5 h-5" />
                        <span>Upload Unboxing Video</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full border-2 border-red-200 bg-red-50 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShieldAlert className="w-5 h-5" />
                        <span>Open Dispute</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <UnboxingModal 
        isOpen={isUnboxingModalOpen} 
        onClose={() => setIsUnboxingModalOpen(false)} 
        orderId={orderId} 
      />
      
      <DisputeModal 
        isOpen={isDisputeModalOpen} 
        onClose={() => setIsDisputeModalOpen(false)} 
        orderId={orderId} 
      />
    </div>
  );
};

export default OrderDetailPage;