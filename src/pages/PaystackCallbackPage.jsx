import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { api } from "../services/api";
import { toast } from "react-hot-toast";
import {
  clearSubscriptionFlowState,
  getSubscriptionFlowState,
  saveSubscriptionSuccessState,
} from "../utils/subscriptionFlow";

const clearSubscriptionRedirectMarkers = () => {
  localStorage.removeItem("lily_subscription_redirect");
  localStorage.removeItem("lily_subscription_payment_ref");
};

const PaystackCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const status = searchParams.get('status');
    const storedOrder = sessionStorage.getItem('lily_pending_order');
    const pendingOrder = storedOrder ? JSON.parse(storedOrder) : null;
    const pendingSubscription = getSubscriptionFlowState();
    const subscriptionRedirectRequested =
      localStorage.getItem("lily_subscription_redirect") === "true" ||
      Boolean(pendingSubscription);

    const redirectSubscriptionFailure = (message) => {
      clearSubscriptionRedirectMarkers();
      navigate(
        pendingSubscription?.plan ? "/subscription/payment" : "/subscriptions",
        {
          replace: true,
          state: pendingSubscription
            ? { ...pendingSubscription, error: message }
            : { error: message },
        },
      );
    };

    const run = async () => {
      if (!reference || status === "failed" || status === "cancelled") {
        if (subscriptionRedirectRequested) {
          redirectSubscriptionFailure("Payment failed. Please try again.");
          return;
        }

        navigate('/checkout', { state: { error: 'Payment failed. Please try again.' } });
        return;
      }

      try {
        // Verify with backend so webhook/callback always finalizes the order
        const verificationResponse = await api.get("/wallet/paystack/callback/", {
          params: { reference },
        });
        const payload = verificationResponse.data || {};

        if (
          payload.payment_context === "subscription" ||
          subscriptionRedirectRequested
        ) {
          const successState = {
            ...(pendingSubscription || {}),
            plan: pendingSubscription?.plan || payload.subscription?.plan || null,
            vendor:
              pendingSubscription?.vendor ||
              payload.subscription?.plan?.vendor ||
              payload.subscription?.vendor ||
              null,
            subscription: payload.subscription || null,
            subscriptionId: payload.subscription_id || payload.subscription?.id,
            nextPaymentDate:
              payload.next_payment_date || payload.subscription?.next_payment_date,
            paymentMethod: 'paystack',
            paymentReference: reference,
            paymentFinalized: Boolean(payload.payment_finalized),
          };

          saveSubscriptionSuccessState(successState);
          clearSubscriptionFlowState();
          clearSubscriptionRedirectMarkers();
          toast.success("Subscription activated! Redirecting to your subscriptions...");
          navigate('/subscriptions', {
            replace: true,
            state: successState,
          });
        } else {
          dispatch(clearCart());
          sessionStorage.removeItem('checkout_ids');
          sessionStorage.removeItem('lily_pending_order');
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

        if (subscriptionRedirectRequested) {
          redirectSubscriptionFailure("Payment verification failed. Please try again.");
          return;
        }

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
