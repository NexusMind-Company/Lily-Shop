import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../../services/api";
import {
  clearSubscriptionFlowState,
  getSubscriptionFlowState,
  saveSubscriptionSuccessState,
} from "../../utils/subscriptionFlow";

const clearSubscriptionRedirectMarkers = () => {
  localStorage.removeItem("lily_subscription_redirect");
  localStorage.removeItem("lily_subscription_payment_ref");
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2500;

export default function SubscriptionCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(location.search);
    const reference = params.get("reference") || params.get("trxref");
    const status = params.get("status");
    const pendingState = getSubscriptionFlowState();

    const redirectToPayment = (message) => {
      clearSubscriptionRedirectMarkers();
      navigate(
        pendingState?.plan ? "/subscription/payment" : "/subscriptions",
        {
          replace: true,
          state: pendingState
            ? { ...pendingState, error: message }
            : { error: message },
        },
      );
    };

    if (!reference) {
      redirectToPayment("We could not verify your payment reference.");
      return;
    }

    if (status === "failed" || status === "cancelled") {
      redirectToPayment("Payment was not completed. Please try again.");
      return;
    }

    let isMounted = true;

    const verifyWithRetry = async (attempt = 1) => {
      try {
        const response = await api.get("/wallet/paystack/callback/", {
          params: { reference },
        });
        const payload = response.data || {};

        // If the webhook Celery task hasn't finished yet, status will be
        // "pending". Retry a few times to give it time to process.
        if (payload.status === "pending" && attempt < MAX_RETRIES) {
          if (!isMounted) return;
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          return verifyWithRetry(attempt + 1);
        }

        if (payload.status !== "success") {
          throw new Error(payload.message || "Payment verification failed.");
        }

        const verifiedSubscription = payload.subscription || null;
        const successState = {
          ...(pendingState || {}),
          plan: pendingState?.plan || verifiedSubscription?.plan || null,
          vendor:
            pendingState?.vendor ||
            verifiedSubscription?.plan?.vendor ||
            verifiedSubscription?.vendor ||
            null,
          subscription: verifiedSubscription,
          subscriptionId: payload.subscription_id || verifiedSubscription?.id,
          nextPaymentDate:
            payload.next_payment_date ||
            verifiedSubscription?.next_payment_date,
          paymentMethod: "paystack",
          paymentReference: reference,
          paymentFinalized: Boolean(payload.payment_finalized),
        };

        saveSubscriptionSuccessState(successState);
        clearSubscriptionFlowState();
        clearSubscriptionRedirectMarkers();

        if (!isMounted) return;

        toast.success("Subscription activated successfully.");
        navigate("/subscriptions", {
          replace: true,
          state: successState,
        });
      } catch (error) {
        console.error("Subscription verification failed:", error);
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Payment verification failed. Please try again.";

        if (!isMounted) return;
        redirectToPayment(message);
      }
    };

    verifyWithRetry();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-sm">
        Verifying your subscription payment...
      </p>
    </div>
  );
}
