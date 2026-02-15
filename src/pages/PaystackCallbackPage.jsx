import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';

const PaystackCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    if (status === 'success' && reference) {
      // Clear cart on successful payment
      dispatch(clearCart());
      
      // Redirect to success page
      navigate('/order-success', {
        state: {
          order: { reference },
          paymentMethod: 'paystack'
        }
      });
    } else {
      // Payment failed
      navigate('/checkout', {
        state: { error: 'Payment failed. Please try again.' }
      });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p>Processing payment...</p>
      </div>
    </div>
  );
};

export default PaystackCallbackPage;