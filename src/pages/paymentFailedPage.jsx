import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, XCircle, Shield } from "lucide-react";

const PaymentFailedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/cart")} // Go back to cart
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <XCircle size={64} className="text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mt-6">
            Payment Failed
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            We were unable to process your payment. Please try again.
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/cart")} // Go back to cart
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
          >
            Try Again
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

export default PaymentFailedPage;

