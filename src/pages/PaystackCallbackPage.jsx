import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { api } from "../services/api";
import { toast } from "react-hot-toast";

const PaystackCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const status = searchParams.get('status');
    const storedOrder = sessionStorage.getItem('lily_pending_order');
    const pendingOrder = storedOrder ? JSON.parse(storedOrder) : null;

    const run = async () => {
      if (!reference || status === "failed" || status === "cancelled") {
        navigate('/checkout', { state: { error: 'Payment failed. Please try again.' } });
        return;
      }

      try {
        // Verify with backend so webhook/callback always finalizes the order
        await api.get("/wallet/paystack/callback/", { params: { reference } });

        dispatch(clearCart());
        sessionStorage.removeItem('checkout_ids');
        sessionStorage.removeItem('lily_pending_order');

        // Check if this was a subscription payment
        const isSubscription = localStorage.getItem("lily_subscription_redirect") === "true";
        if (isSubscription) {
          localStorage.removeItem("lily_subscription_redirect");
          localStorage.removeItem("lily_subscription_payment_ref");
          toast.success("Subscription activated!");
          navigate('/subscription-success', {
            state: { reference, status: 'paid', paymentMethod: 'paystack' }
          });
        } else {
          toast.success("Payment successful!");
          navigate('/order-success', {
            state: {
              order: pendingOrder
                ? { ...pendingOrder, reference, status: 'paid' }
                : { reference, status: 'paid' },
              paymentMethod: 'paystack',
            },
          });
        }
      } catch (e) {
        console.error("Paystack verification error:", e);
        toast.error("Payment verification failed.");
        navigate('/checkout', {
          state: { error: 'Payment verification failed. Please try again.' },
        });
      }
    };

    run();
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
