import React from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../../context/paymentContext";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../../services/api";
import { ChevronLeft, CreditCard, Wallet, CheckCircle2 } from "lucide-react";

const ChooseCardPage = () => {
  const navigate = useNavigate();
  const { paymentData, setPaymentData } = usePayment();
  const { selectedPaymentMethod } = paymentData;

  const { data: user } = useQuery({ 
    queryKey: ["userProfile"], 
    queryFn: fetchUserProfile 
  });

  const handleSelect = (method) => {
    setPaymentData((prev) => ({ ...prev, selectedPaymentMethod: method }));
    navigate("/checkout"); // Navigate back to the checkout/cart page
  };

  const formatMoney = (amount) => 
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg text-gray-800 mr-8">Payment Method</h2>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500 mb-2">Select how you want to pay</p>

        {/* Option 1: Lily Wallet */}
        <div 
          onClick={() => handleSelect('wallet')}
          className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
            selectedPaymentMethod === 'wallet' ? "border-pink-600 bg-pink-50" : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Lily Wallet</h3>
            <p className="text-sm text-gray-500">
              Balance: <span className="font-medium text-green-600">{formatMoney(user?.wallet_balance || 0)}</span>
            </p>
          </div>
          {selectedPaymentMethod === 'wallet' && <CheckCircle2 className="text-pink-600" size={24} />}
        </div>

        {/* Option 2: Paystack */}
        <div 
          onClick={() => handleSelect('paystack')}
          className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
            selectedPaymentMethod === 'paystack' ? "border-pink-600 bg-pink-50" : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Paystack</h3>
            <p className="text-sm text-gray-500">Pay with Card, Bank Transfer, or USSD</p>
          </div>
          {selectedPaymentMethod === 'paystack' && <CheckCircle2 className="text-pink-600" size={24} />}
        </div>
      </div>
    </div>
  );
};

export default ChooseCardPage;