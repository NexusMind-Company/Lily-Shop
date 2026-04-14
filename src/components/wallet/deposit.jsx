import React, { useState } from "react";
import { ChevronLeft, CreditCard, Building2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { topUpWallet } from "../../redux/walletSlice";

export default function Deposit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState("");

  const { topup_loading, topup_error } = useSelector((state) => state.wallet);

  // Quick amount buttons
  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleQuickAmount = (amt) => {
    setAmount(amt.toString());
    setError("");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const handleDeposit = async () => {
    const amountValue = parseFloat(amount);

    // Validation
    if (!amountValue || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountValue < 100) {
      setError("Minimum deposit amount is NGN 100");
      return;
    }

    if (amountValue > 1000000) {
      setError("Maximum deposit amount is NGN 1,000,000");
      return;
    }

    try {
      const result = await dispatch(topUpWallet(amountValue));

      if (result.meta.requestStatus === "fulfilled") {
        const { authorization_url } = result.payload;

        if (authorization_url) {
          // Redirect to Paystack
          window.location.href = authorization_url;
        } else {
          setError("Unable to initialize payment. Please try again.");
        }
      } else {
        setError("Failed to initiate deposit. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Deposit error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                Deposit Money
              </h1>
              <p className="text-sm text-gray-600">Add funds to your wallet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {(error || topup_error) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border-2 border-error/20 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-error">Error</p>
                  <p className="text-sm text-error/80">{error || topup_error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Amount Input Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-card p-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                NGN
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-16 pr-4 py-4 text-3xl font-bold bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
                placeholder="0"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Min: NGN 100 - Max: NGN 1,000,000
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAmount(amt)}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    amount === amt.toString()
                      ? "bg-gradient-to-br from-lily-500 to-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  NGN {(amt / 1000).toFixed(0)}k
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-lily-600 mr-2" />
            Payment Method
          </h3>

          <div className="space-y-3">
            {/* Card Payment */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod("card")}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "card"
                  ? "border-lily-500 bg-gradient-to-br from-lily-50 to-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-xl ${
                      paymentMethod === "card"
                        ? "bg-lily-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${
                        paymentMethod === "card" ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Debit Card</p>
                    <p className="text-sm text-gray-600">
                      Mastercard, Visa, Verve
                    </p>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <div className="w-6 h-6 bg-lily-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.button>

            {/* Bank Transfer */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod("transfer")}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "transfer"
                  ? "border-lily-500 bg-gradient-to-br from-lily-50 to-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-xl ${
                      paymentMethod === "transfer"
                        ? "bg-lily-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Building2
                      className={`w-5 h-5 ${
                        paymentMethod === "transfer"
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Bank Transfer</p>
                    <p className="text-sm text-gray-600">USSD, QR Code</p>
                  </div>
                </div>
                {paymentMethod === "transfer" && (
                  <div className="w-6 h-6 bg-lily-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Secure Payment:</strong> All transactions are encrypted and
              processed through Paystack, a PCI-DSS compliant payment gateway.
            </p>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={!topup_loading ? { scale: 1.02 } : {}}
          whileTap={!topup_loading ? { scale: 0.98 } : {}}
          onClick={handleDeposit}
          disabled={topup_loading || !amount || parseFloat(amount) < 100}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
            topup_loading || !amount || parseFloat(amount) < 100
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {topup_loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>
                Proceed to Pay{" "}
                {amount ? `NGN ${parseFloat(amount).toLocaleString()}` : ""}
              </span>
            </>
          )}
        </motion.button>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-600"
        >
          <p>
            Powered by{" "}
            <span className="font-semibold text-lily-600">Paystack</span>
          </p>
          <p className="mt-1">Your payment information is secure.</p>
        </motion.div>
      </div>
    </div>
  );
}
