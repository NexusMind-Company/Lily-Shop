// src/pages/OrderHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, Search, Filter, ChevronRight,
  Clock, CheckCircle2, XCircle, AlertCircle, Wallet, CreditCard
} from 'lucide-react';
import { fetchOrders, selectOrders, selectOrderLoading, selectOrderError } from '../redux/orderSlice';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Paid'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending'
      },
      failed: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const filterTabs = [
    { value: 'all', label: 'All Orders', color: 'from-pink-600 to-purple-600' },
    { value: 'paid', label: 'Paid', color: 'from-green-500 to-emerald-600' },
    { value: 'pending', label: 'Pending', color: 'from-yellow-500 to-orange-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'from-gray-500 to-gray-600' }
  ];

  const filteredOrders = orders?.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = !searchQuery || 
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => 
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getOrderStats = () => {
    if (!orders) return { all: 0, paid: 0, pending: 0, cancelled: 0 };
    return {
      all: orders.length,
      paid: orders.filter(o => o.status === 'paid').length,
      pending: orders.filter(o => o.status === 'pending').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  const stats = getOrderStats();

  // Loading State
  if (loading && !orders) {
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
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error && !orders) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(fetchOrders())}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Orders
            </h1>
            <p className="text-gray-600">Track and manage all your purchases</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by reference or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filter Orders</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterTabs.map(({ value, label, color }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(value)}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  filter === value
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {stats[value] > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === value ? 'bg-white/30' : 'bg-gray-200'
                  }`}>
                    {stats[value]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          {!filteredOrders || filteredOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? 'No matching orders' : 'No orders found'}
              </h3>
              <p className="text-gray-600 mb-8">
                {filter === 'all' && !searchQuery
                  ? "You haven't placed any orders yet. Start shopping!"
                  : searchQuery
                  ? 'Try adjusting your search terms'
                  : `No ${filter} orders found`
                }
              </p>
              {filter === 'all' && !searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/feed')}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  Start Shopping
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Order Reference</p>
                          <p className="font-mono font-bold text-gray-800 truncate">
                            {order.reference}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="font-semibold text-sm">{statusConfig.label}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-6">
                      {/* Product Preview */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.id}
                              className="relative w-16 h-16 rounded-lg border-2 border-white overflow-hidden shadow-sm"
                              style={{ zIndex: 3 - idx }}
                            >
                              <img
                                src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                              <span className="text-pink-600 font-bold text-sm">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-gray-600">
                          {order.payment_method === 'wallet' ? (
                            <>
                              <Wallet className="w-4 h-4" />
                              <span className="text-sm">Lily Wallet</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              <span className="text-sm">Paystack</span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            ₦{order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderHistoryPage;