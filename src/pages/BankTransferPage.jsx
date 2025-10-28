import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { initiateBankTransfer } from "../api/checkoutApi";
import { usePayment } from "../context/PaymentContext";
import { ChevronLeft, Loader2, Shield } from "lucide-react";

// Helper function
const formatPrice = (price) =>
  new Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const BankTransferPage = () => {
  const navigate = useNavigate();
  // Get data from our context
  const { paymentData, setPaymentData } = usePayment();
  const [timeLeft, setTimeLeft] = useState(null);

  const mutation = useMutation({
    mutationFn: initiateBankTransfer,
    onSuccess: (data) => {
      // Store order ID in context for the loading page
      setPaymentData((prev) => ({ ...prev, orderId: data.orderId }));
      setTimeLeft(data.expiresInMinutes * 60);
    },
    // TODO: Add onError handler
  });

  // Initiate the transfer request on page load
  useEffect(() => {
    mutation.mutate({
      amount: paymentData.amount,
      vendorName: paymentData.vendorName,
    });
  }, []); // Empty array ensures this runs once

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft === 0) {
      // Handle expiry, e.g., navigate away or show message
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePaid = () => {
    // Navigate to loading page to check status
    navigate("/payment-loading");
  };

  const handleCancel = () => {
    // TODO: Add logic to cancel the transaction via API if needed
    navigate("/cart");
  };

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 size={32} className="text-lily animate-spin" />
        <p className="text-gray-500 mt-3">Generating account details...</p>
      </div>
    );
  }

  const data = mutation.data; // The successful data from the mutation

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/cart")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        {/* No title in Figma */}
      </div>

      {data && (
        <div className="flex-1 flex flex-col p-6 text-center">
          <p className="text-gray-500">{data.orderId}</p>
          <p className="text-lg text-gray-700">
            Pay <span className="font-bold">NGN {formatPrice(data.amount)}</span>
          </p>
          <p className="mt-2 text-lg">
            Transfer{" "}
            <span className="font-bold">NGN {formatPrice(data.amount)}</span> to{" "}
            {data.vendorName}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 my-8 space-y-6">
            <div>
              <p className="text-sm text-gray-500">BANK NAME</p>
              <p className="text-xl font-bold">{data.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ACCOUNT NUMBER</p>
              <p className="text-xl font-bold">{data.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">AMOUNT</p>
              <p className="text-xl font-bold">NGN {formatPrice(data.amount)}</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            This account is for this transaction only and expires in{" "}
            <span className="text-red-500 font-bold">
              {timeLeft ? formatTime(timeLeft) : "..."}
            </span>
          </p>

          <div className="flex-1"></div>

          <button
            onClick={handlePaid}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
          >
            I've sent the money
          </button>
          <button onClick={handleCancel} className="mt-4 text-gray-500">
            x Cancel Payment
          </button>

          <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
            <Shield size={14} className="mr-1" /> Secured by{" "}
            <span className="font-bold ml-1">paystack</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default BankTransferPage;

