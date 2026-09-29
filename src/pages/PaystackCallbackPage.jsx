import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import { usePayment } from "../hooks/usePayment";
import { api, cancelOrder } from "../services/api";
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
  const { resetPaymentData } = usePayment();

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    const statusParam = searchParams.get("status");
    const storedOrder = localStorage.getItem("lily_pending_order");
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

    const handleOrderFailure = async (errorMessage) => {
      if (pendingOrder?.id) {
        try {
          await cancelOrder(pendingOrder.id);
        } catch (cancelErr) {
          console.error("Failed to cancel pending order on failure:", cancelErr);
        }
      }
      localStorage.removeItem("lily_pending_order");
      localStorage.removeItem("checkout_ids");
      resetPaymentData();
      // Deliberately do NOT dispatch(clearCart()) so cart items remain preserved
      toast.error(errorMessage || "Payment was cancelled. Your cart items are saved.");
      navigate("/checkout", {
        replace: true,
        state: { error: errorMessage || "Payment was cancelled. Your cart items are saved." },
      });
    };

    const run = async () => {
      if (!reference) {
        if (subscriptionRedirectRequested) {
          redirectSubscriptionFailure("Payment failed. Please try again.");
          return;
        }

        await handleOrderFailure("No payment reference found. Payment was cancelled.");
        return;
      }

      if (statusParam === "cancelled" || statusParam === "failed") {
        if (subscriptionRedirectRequested) {
          redirectSubscriptionFailure("Payment was cancelled.");
          return;
        }

        await handleOrderFailure("Payment was cancelled. Your cart items are saved.");
        return;
      }

      try {
        // Verify with backend so webhook/callback always finalizes the order
        const verificationResponse = await api.get(
          "/wallet/paystack/callback/",
          {
            params: { reference },
          },
        );
        const payload = verificationResponse.data || {};

        const isPaymentSuccessful =
          payload.status === "success" ||
          payload.paystack_status === "success" ||
          payload.data?.status === "success";

        if (!isPaymentSuccessful) {
          const failMsg =
            payload.message ||
            payload.detail ||
            "Payment was cancelled or unsuccessful. Your cart items are saved.";

          if (
            payload.payment_context === "subscription" ||
            subscriptionRedirectRequested
          ) {
            redirectSubscriptionFailure(failMsg);
          } else {
            await handleOrderFailure(failMsg);
          }
          return;
        }

        if (
          payload.payment_context === "subscription" ||
          subscriptionRedirectRequested
        ) {
          const successState = {
            ...(pendingSubscription || {}),
            plan:
              pendingSubscription?.plan || payload.subscription?.plan || null,
            vendor:
              pendingSubscription?.vendor ||
              payload.subscription?.plan?.vendor ||
              payload.subscription?.vendor ||
              null,
            subscription: payload.subscription || null,
            subscriptionId: payload.subscription_id || payload.subscription?.id,
            nextPaymentDate:
              payload.next_payment_date ||
              payload.subscription?.next_payment_date,
            paymentMethod: "paystack",
            paymentReference: reference,
            paymentFinalized: Boolean(payload.payment_finalized),
          };

          saveSubscriptionSuccessState(successState);
          clearSubscriptionFlowState();
          clearSubscriptionRedirectMarkers();
          toast.success(
            "Subscription activated! Redirecting to your subscriptions...",
          );
          navigate("/subscriptions", {
            replace: true,
            state: successState,
          });
        } else {
          dispatch(clearCart());
          resetPaymentData();
          localStorage.removeItem("checkout_ids");
          localStorage.removeItem("lily_pending_order");
          toast.success("Payment successful!");
          const calculatedTotal =
            pendingOrder?.total_amount_naira ||
            (pendingOrder?.total_amount_kobo
              ? Number(pendingOrder.total_amount_kobo) / 100
              : null) ||
            pendingOrder?.total_amount ||
            pendingOrder?.total;

          navigate("/order-success", {
            state: {
              order: pendingOrder
                ? { ...pendingOrder, reference, status: "paid" }
                : { reference, status: "paid" },
              total: calculatedTotal,
              product:
                pendingOrder?.product ||
                pendingOrder?.items?.[0]?.product ||
                pendingOrder?.items?.[0],
              quantity:
                pendingOrder?.quantity ||
                pendingOrder?.items?.reduce(
                  (acc, it) => acc + (it.quantity || 1),
                  0
                ) || 1,
              paymentMethod: "paystack",
              isFood: pendingOrder?.type === "food_order",
              vendorUserId: pendingOrder?.vendorUserId,
            },
          });
        }
      } catch (e) {
        console.error("Paystack verification error:", e);
        const errMsg =
          e.response?.data?.detail ||
          e.response?.data?.message ||
          e.response?.data?.error ||
          "Payment verification failed. Your cart items are saved.";

        if (subscriptionRedirectRequested) {
          redirectSubscriptionFailure(errMsg);
          return;
        }

        await handleOrderFailure(errMsg);
      }
    };

    run();
  }, [searchParams, navigate, dispatch, resetPaymentData]);

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
