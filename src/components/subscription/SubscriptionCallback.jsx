import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSubscriptionFlowState } from "../../utils/subscriptionFlow";

export default function SubscriptionCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract Paystack reference from the URL query
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");
    const status = params.get("status"); // trxref, reference, etc.
    const pendingState = getSubscriptionFlowState();

    if (reference) {
      if (pendingState?.planId || pendingState?.plan?.id) {
        navigate("/subscription/processing", {
          replace: true,
          state: pendingState,
        });
        return;
      }

      navigate("/subscription-success", { replace: true });
    } else if (status === "cancelled") {
      // Payment was cancelled
      navigate("/subscriptions?status=cancelled", { replace: true });
    } else {
      // Handle other cases
      navigate("/subscriptions?status=unknown", { replace: true });
    }
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-sm">Processing your subscription...</p>
    </div>
  );
}
