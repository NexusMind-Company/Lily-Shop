import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SubscriptionCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract Paystack reference from the URL query
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");
    const status = params.get("status"); // trxref, reference, etc.

    if (reference) {
      // For now, we'll assume success and redirect
      // In production, you'd verify the payment with your backend
      navigate("/subscription-success");
    } else if (status === "cancelled") {
      // Payment was cancelled
      navigate("/my-subscriptions?status=cancelled");
    } else {
      // Handle other cases
      navigate("/my-subscriptions?status=unknown");
    }
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-sm">Processing your subscription...</p>
    </div>
  );
}
