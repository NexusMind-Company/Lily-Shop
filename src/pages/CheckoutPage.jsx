// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, selectCreateOrderLoading, selectCreateOrderError } from '../redux/orderSlice';
import { fetchCart, selectCart, selectCartItems, selectCartIsLoading, clearCart } from '../redux/cartSlice';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const cartLoading = useSelector(selectCartIsLoading);
  const orderLoading = useSelector(selectCreateOrderLoading);
  const orderError = useSelector(selectCreateOrderError);

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch cart and wallet on mount
  useEffect(() => {
    dispatch(fetchCart());
    fetchWalletBalance();
  }, [dispatch]);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get('/wallet/me/');
      setWalletBalance(response.data.balance_naira || 0);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (paymentMethod === 'wallet' && walletBalance < cart.total_price_naira) {
      alert('Insufficient wallet balance');
      return;
    }

    setProcessing(true);

    try {
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const orderData = {
        items: orderItems,
        payment_method: paymentMethod
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      // Handle payment result
      if (result.payment_result) {
        if (result.payment_result.status === 'paid') {
          // Wallet payment successful
          await dispatch(clearCart());
          navigate('/order-success', { 
            state: { 
              order: result,
              paymentMethod: 'wallet'
            } 
          });
        } else if (result.payment_result.authorization_url) {
          // Paystack payment - redirect to Paystack
          window.location.href = result.payment_result.authorization_url;
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(error?.error || 'Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (cartLoading || loadingWallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
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

  const insufficientBalance = paymentMethod === 'wallet' && walletBalance < cart.total_price_naira;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Checkout Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {/* Wallet Option */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'wallet' ? 'border-pink-600 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-pink-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Lily Wallet</span>
                      <span className={`text-sm ${insufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: ₦{walletBalance.toLocaleString()}
                      </span>
                    </div>
                    {insufficientBalance && (
                      <p className="text-sm text-red-600 mt-1">Insufficient balance</p>
                    )}
                  </div>
                </label>

                {/* Paystack Option */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'paystack' ? 'border-pink-600 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-pink-600"
                  />
                  <div className="ml-3">
                    <span className="font-medium">Paystack</span>
                    <p className="text-sm text-gray-500">Pay with card or bank transfer</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'wallet' && insufficientBalance && (
                <button
                  onClick={() => navigate('/wallet')}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Top Up Wallet
                </button>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-3 border-b last:border-b-0">
                    <img
                      src={item.product.image_url || item.product.media_url || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {item.price_changed && (
                        <p className="text-xs text-amber-600">⚠️ Price changed</p>
                      )}
                    </div>
                    <p className="font-semibold">₦{item.subtotal_naira.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span>₦{cart.total_price_naira.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-sm">Varies by seller</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{cart.total_price_naira.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {orderError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {orderError?.error || 'Failed to create order'}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={processing || orderLoading || insufficientBalance}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  processing || orderLoading || insufficientBalance
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {processing || orderLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our Terms and Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;