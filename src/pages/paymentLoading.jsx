import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield, X } from "lucide-react";

// Assuming context and API files are in root folders and this file is in components/checkout/
import { PaymentProvider, usePayment } from "../context/paymentContext"; // Corrected path assumption
import { checkPaymentStatus } from "../api/checkoutApi"; // Corrected path assumption

const PaymentLoadingPage = () => {
  const navigate = useNavigate();
  // Use usePayment hook to access context data and setters
  const { paymentData, setPaymentData } = usePayment();

  // Use paymentData.orderId from context
  const { data, error, isLoading } = useQuery({
    queryKey: ["paymentStatus", paymentData?.orderId],
    queryFn: () => {
      // Ensure orderId exists before fetching
      if (!paymentData?.orderId) {
        // Handle case where orderId might be missing (e.g., navigated here directly)
        console.error("Order ID missing in payment context");
        throw new Error("Order ID missing");
      }
      return checkPaymentStatus(paymentData.orderId);
    },
    // Only run the query if orderId is present
    enabled: !!paymentData?.orderId,
    onSuccess: (data) => {
      if (data?.status === "success") {
        // Update context with final payment details
        setPaymentData((prev) => ({
          ...prev,
          amountPaid: data.amountPaid, // Assuming API returns this
          vendorName: data.vendorName, // Assuming API returns this
        }));
        navigate("/payment-success");
      } else if (data?.status === "failed" || data?.status === "cancelled") {
        navigate("/payment-failed");
      }
      // If status is still 'pending', the refetchInterval will handle it
    },
    onError: (err) => {
      console.error("Payment status check failed:", err);
      navigate("/payment-failed");
    },
    // Refetch every 3 seconds ONLY if the status is still 'pending'
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 3000 : false,
    refetchOnWindowFocus: false, // Don't refetch just because the tab got focus
    retry: 2, // Retry failed requests twice before navigating to failed page
  });

  const handleCancel = () => {
    // TODO: Add logic to attempt to cancel the payment on the backend if possible
    console.log("User cancelled payment check");
    navigate("/cart"); // Go back to cart or another appropriate page
  };

  // Handle case where orderId is missing from context (e.g., page refresh)
  // You might want a more robust way to handle this, maybe storing orderId temporarily
  if (!paymentData?.orderId && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
        {/* Header */}
        <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
          {/* No back button here usually, maybe a home/cancel button */}
          <h2 className="font-bold text-lg text-gray-800">Payment Status</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <X size={48} className="text-red-500" />
          <p className="text-lg font-medium text-gray-700 mt-6">
            Could not find order details.
          </p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 text-lily underline"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      {/* Header (optional, maybe no back button?) */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <h2 className="font-bold text-lg text-gray-800">Checking Payment</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-lily animate-spin" />
          <p className="text-lg font-medium text-gray-700 mt-6">
            Checking transaction status...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait, this might take a moment.
          </p>
        </div>

        <button
          onClick={handleCancel}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Cancel Payment
        </button>
        <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
          <Shield size={14} className="mr-1" /> Secured by{" "}
          <span className="font-bold ml-1">paystack</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentLoadingPage;
