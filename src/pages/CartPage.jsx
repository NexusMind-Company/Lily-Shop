// src/pages/CartPage.jsx (Updated)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  selectCart,
  selectCartItems,
  selectCartIsLoading,
  selectCartError,
  clearError
} from '../redux/cartSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartIsLoading);
  const error = useSelector(selectCartError);

  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(updateCartItem({ id: itemId, quantity: newQuantity })).unwrap();
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (err) {
      console.error('Failed to remove:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;
    
    try {
      await dispatch(clearCart()).unwrap();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  if (loading && !cartItems?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {cart.total_items || 0} {cart.total_items === 1 ? 'item' : 'items'}
            </p>
          </div>
          {cartItems?.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Empty Cart */}
        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/feed')}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const priceChanged = item.price_kobo_snapshot !== item.current_price_kobo;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-sm p-6 transition ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <img
                        src={item.product?.image_url || item.product?.media_url || '/placeholder.png'}
                        alt={item.product?.name || 'Product'}
                        className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-75"
                        onClick={() => navigate(`/product/${item.product?.id}`)}
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3
                              className="font-semibold text-lg hover:text-pink-600 cursor-pointer"
                              onClick={() => navigate(`/product/${item.product?.id}`)}
                            >
                              {item.product?.name || 'Product'}
                            </h3>
                            {item.product?.shop_name && (
                              <p className="text-sm text-gray-500">
                                Sold by {item.product.shop_name}
                              </p>
                            )}
                            {priceChanged && (
                              <div className="mt-1 flex items-center text-xs text-amber-600">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Price changed
                              </div>
                            )}
                            {!item.product?.in_stock && (
                              <p className="text-sm text-red-600 mt-1">Out of stock</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                            disabled={isUpdating}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating || item.quantity >= (item.product?.quantity_available || 99)}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            {item.product?.quantity_available && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({item.product.quantity_available} available)
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-pink-600">
                              ₦{item.subtotal_naira?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₦{(item.current_price_kobo / 100).toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>₦{cart.total_price_naira?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-pink-600">₦{cart.total_price_naira?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-semibold mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/feed')}
                  className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Continue Shopping
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;