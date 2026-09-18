// src/pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, MessageCircle, Printer, MapPin,
  Clock, CheckCircle2, XCircle, AlertCircle, Wallet, CreditCard, ChevronRight, Video, ShieldAlert
} from 'lucide-react';
import { fetchOrderDetail, selectCurrentOrder, selectOrderLoading, selectOrderError } from '../redux/orderSlice';
import { confirmOrderReceipt, confirmFoodOrderReceipt } from '../services/api';
import { toast } from 'react-hot-toast';
import { Truck } from 'lucide-react';
import UnboxingModal from '../components/orders/UnboxingModal';
import DisputeModal from '../components/orders/DisputeModal';

const ORDER_STAGES = [
  { key: 'paid', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, altKeys: ['dispatched'] },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isUnboxingModalOpen, setIsUnboxingModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const order = useSelector(selectCurrentOrder);
  const [isConfirming, setIsConfirming] = useState(false);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail(orderId));
    }
  }, [dispatch, orderId]);

  const handleConfirmReceipt = async () => {
    setIsConfirming(true);
    try {
      if (order.order_type === 'food') {
        await confirmFoodOrderReceipt(order.id);
      } else {
        await confirmOrderReceipt(order.id);
      }
      toast.success('Order confirmed! Funds released to seller 🎉');
      dispatch(fetchOrderDetail(orderId)); // Refresh order data
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to confirm order');
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    // PIN fetching removed
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
      preparing: {
        color: 'from-orange-400 to-amber-600',
        textColor: 'text-orange-800',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <Package className="w-8 h-8 text-white" />,
        title: 'Being Prepared',
        subtitle: 'The seller is preparing your order'
      },
      ready_for_pickup: {
        color: 'from-blue-400 to-blue-600',
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <MapPin className="w-8 h-8 text-white" />,
        title: 'Ready for Pickup',
        subtitle: 'Your order is ready to be picked up'
      },
      out_for_delivery: {
        color: 'from-purple-400 to-indigo-600',
        textColor: 'text-purple-800',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <Truck className="w-8 h-8 text-white" />,
        title: 'Out for Delivery',
        subtitle: 'Shopa is delivering your order 🚚'
      },
      dispatched: {
        color: 'from-purple-400 to-indigo-600',
        textColor: 'text-purple-800',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <Truck className="w-8 h-8 text-white" />,
        title: 'Out for Delivery',
        subtitle: 'Your order is on its way'
      },
      delivered: {
        color: 'from-lily to-darklily',
        textColor: 'text-darklily',
        bgColor: 'bg-lily/10',
        borderColor: 'border-lily/40',
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        title: 'Delivered',
        subtitle: 'Please confirm you received your order'
      },
      completed: {
        color: 'from-green-500 to-emerald-700',
        textColor: 'text-green-800',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        title: 'Order Completed',
        subtitle: 'Transaction complete — funds released to seller'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-lily/20 border-t-lily rounded-full"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
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
            className="bg-gradient-to-r from-lily to-darklily text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            View All Orders
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-8">
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

            {/* "My Item Has Been Delivered" Confirmation Card */}
            {order.status === 'delivered' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-lily/40 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-lily/10 to-lily/10 px-6 py-4 border-b border-lily/20">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-lily" />
                    Confirm Your Order
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    The seller has marked your order as delivered. If you have received and inspected your items, 
                    please confirm below to release payment to the seller.
                  </p>
                  
                  {/* Item cards — one per order item */}
                  <div className="space-y-3 mb-6">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <img 
                          src={item.product?.image_url || item.product?.media_url || '/placeholder.png'} 
                          alt={item.product?.name} 
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">{item.product?.shop_name}</p>
                          <p className="text-sm font-bold text-gray-700">₦{(item.subtotal_kobo / 100).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmReceipt}
                    disabled={isConfirming}
                    className="w-full bg-gradient-to-r from-lily to-darklily text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                  >
                    {isConfirming ? 'Confirming...' : '✅ My Item Has Been Delivered'}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    By confirming, payment will be released to the seller. 
                    If there's an issue, <span className="text-red-600 font-medium cursor-pointer" onClick={() => setIsDisputeModalOpen(true)}>open a dispute</span> instead.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Confirm Delivery Section */}
            {order?.status !== 'delivered' && order?.status !== 'cancelled' && order?.status !== 'refunded' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-lily/20 p-6 mt-4 flex flex-col items-center justify-center gap-4 text-center"
              >
                <h3 className="text-lg font-bold text-gray-800">Have you received your order?</h3>
                <p className="text-sm text-gray-600">
                  Confirm receipt to release the funds to the seller. Only do this if you are satisfied with the delivery.
                </p>
                <button
                  onClick={handleConfirmReceipt}
                  disabled={isConfirming}
                  className="w-full sm:w-auto px-8 py-3 bg-lily text-white font-bold rounded-xl hover:bg-lily/90 transition-colors shadow-lg shadow-lily/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isConfirming && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  Confirm Delivery
                </button>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-lily" />
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
                      className={`flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0 group ${item.product?.id ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (item.product?.id) {
                          navigate(`/product/${item.product.id}`);
                        }
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.product?.image_url || item.product?.media_url || item.image || '/placeholder.png'}
                          alt={item.product?.name || item.name || 'Product'}
                          className="w-24 h-24 object-cover rounded-xl group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute -top-2 -right-2 bg-lily text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 group-hover:text-lily transition-colors mb-1 truncate">
                          {item.product?.name || item.name || 'Product'}
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
                            ₦{item.price_kobo ? (item.price_kobo / 100).toLocaleString() : Number(item.price || 0).toLocaleString()} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-800">
                          ₦{(item.subtotal_kobo / 100).toLocaleString()}
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-lily transition-colors mt-1 ml-auto" />
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-lily" />
                  Order Timeline
                </h3>
              </div>

              <div className="p-6">
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200" />
                  <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-lily/50 to-lily" 
                       style={{ 
                         height: `${Math.max(0, ORDER_STAGES.findIndex(s => s.key === order.status || s.altKeys?.includes(order.status)) / (ORDER_STAGES.length - 1)) * 100}%` 
                       }} 
                  />

                  {ORDER_STAGES.map((stage, index) => {
                    const currentStageIndex = ORDER_STAGES.findIndex(s => s.key === order.status || s.altKeys?.includes(order.status));
                    const isCompleted = index <= currentStageIndex;
                    const isActive = index === currentStageIndex;
                    const Icon = stage.icon;

                    return (
                      <motion.div
                        key={stage.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="relative flex items-start space-x-4"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 transition-colors duration-500
                          ${isCompleted 
                            ? 'bg-gradient-to-br from-lily to-darklily' 
                            : 'bg-gradient-to-br from-gray-200 to-gray-300'
                          }
                          ${isActive ? 'ring-4 ring-lily/20' : ''}
                        `}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {stage.label}
                          </p>
                          {isActive && (
                            <p className="text-sm text-lily mt-1 animate-pulse">
                              Currently in progress
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
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
              <div className="bg-gradient-to-r from-lily to-darklily px-6 py-4">
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
                        <Wallet className="w-5 h-5 text-lily" />
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

                {/* Delivery Type */}
                {order.delivery_type === 'delivery' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Delivery Type</p>
                    <div className="flex items-center space-x-2 bg-lily/10 px-3 py-2 rounded-lg border border-lily/20">
                      <Truck className="w-5 h-5 text-lily" />
                      <span className="font-semibold text-darklily">Delivery by Shopa</span>
                    </div>
                  </div>
                )}

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
                      ₦{order.total_amount_naira?.toLocaleString() || ((order.total_price || order.total_amount_kobo) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-sm">To be arranged</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-lily to-darklily bg-clip-text text-transparent">
                        ₦{order.total_amount_naira?.toLocaleString() || ((order.total_price || order.total_amount_kobo) / 100).toLocaleString()}
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
                        className="w-full bg-gradient-to-r from-lily to-darklily text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2"
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