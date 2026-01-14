import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../services/api"; // To check wallet balance
import { usePayment } from "../context/paymentContext";
import { ChevronLeft, CreditCard, Wallet, Loader2, CheckCircle2 } from "lucide-react";

const ChooseCardPage = () => {
  const navigate = useNavigate();
  const { setPaymentData } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState("paystack"); // Default to Paystack

  // Fetch user profile to get wallet balance
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const walletBalance = user?.wallet_balance || 0;
  
  // Format currency helper
  const formatMoney = (amount) => 
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  const handleContinue = () => {
    setPaymentData((prev) => ({ ...prev, selectedPaymentMethod: selectedMethod }));
    navigate("/order-summary");
  };

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Payment Method</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-gray-500 text-sm mb-2">Select how you want to pay</p>

        {/* Option 1: Paystack */}
        <div
          onClick={() => setSelectedMethod("paystack")}
          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-4 ${
            selectedMethod === "paystack"
              ? "border-lily bg-pink-50"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <CreditCard size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Pay with Paystack</h3>
            <p className="text-xs text-gray-500 mt-1">
              Cards, Bank Transfer (Titan), USSD
            </p>
          </div>
          {selectedMethod === "paystack" && (
            <CheckCircle2 className="text-lily" size={24} />
          )}
        </div>

        {/* Option 2: Wallet */}
        <div
          onClick={() => setSelectedMethod("wallet")}
          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-4 ${
            selectedMethod === "wallet"
              ? "border-lily bg-pink-50"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Wallet size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Lily Wallet</h3>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mt-1 text-gray-400" />
            ) : (
              <p className="text-sm font-medium text-green-700 mt-1">
                Balance: {formatMoney(walletBalance)}
              </p>
            )}
          </div>
          {selectedMethod === "wallet" && (
            <CheckCircle2 className="text-lily" size={24} />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleContinue}
          className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  );
};

export default ChooseCardPage;