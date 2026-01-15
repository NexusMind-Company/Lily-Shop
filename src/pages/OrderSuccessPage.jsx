// src/pages/OrderSuccessPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { order, paymentMethod } = location.state || {};

  useEffect(() => {
    // Refresh cart to show it's empty
    dispatch(fetchCart());
  }, [dispatch]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/feed')}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold mb-3">Order Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order Reference</p>
                <p className="font-mono font-semibold">{order.reference}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-semibold capitalize">{paymentMethod || order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-green-600 capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h3 className="font-semibold mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-3 border-b last:border-b-0">
                  <img
                    src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                    alt={item.product?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₦{(item.subtotal_kobo / 100).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>₦{order.total_amount_naira?.toLocaleString() || (order.total_amount_kobo / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-semibold"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/feed')}
            className="flex-1 bg-white text-gray-800 py-3 rounded-lg border-2 border-gray-300 hover:border-pink-600 font-semibold"
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>The seller will be notified of your order</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can contact the seller via messages to arrange delivery</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your payment is held securely until delivery is confirmed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;