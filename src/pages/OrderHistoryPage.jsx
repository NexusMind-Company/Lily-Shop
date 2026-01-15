// src/pages/OrderHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, selectOrders, selectOrderLoading, selectOrderError } from '../redux/orderSlice';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [filter, setFilter] = useState('all'); // all, paid, pending, cancelled

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders?.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchOrders())}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${filter} orders found`
              }
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Order Reference</p>
                      <p className="font-mono font-semibold text-lg">{order.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 mb-3">
                      {order.items?.slice(0, 3).map((item) => (
                        <img
                          key={item.id}
                          src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-600 font-semibold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="ml-3 text-sm text-gray-500 capitalize">
                        via {order.payment_method}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold text-pink-600">
                        ₦{order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;