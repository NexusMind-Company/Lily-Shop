import React from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../context/paymentContext";
import { ChevronLeft, CheckCircle, Shield } from "lucide-react";

const formatPrice = (price) =>
  new Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { paymentData } = usePayment();
  const { amountPaid, vendorName } = paymentData;

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle size={64} className="text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mt-6">
            Payment Successful
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            You paid{" "}
            <span className="font-bold">
              NGN {formatPrice(amountPaid || 0)}
            </span>{" "}
            to {vendorName || "vendor"}
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
          >
            Continue shopping
          </button>
          <button
            // --- THIS IS THE FIX ---
            onClick={() => navigate("/orders")} // Navigate to the orders list
            className="w-full bg-white text-lily py-3 rounded-lg text-lg font-semibold border border-lily hover:bg-lily/10 transition-colors"
          >
            View order
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8 flex items-center justify-center">
          <Shield size={14} className="mr-1" /> Secured by{" "}
          <span className="font-bold ml-1">paystack</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;