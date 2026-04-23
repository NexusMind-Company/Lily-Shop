import React, { useState } from "react";
import {
  ChevronLeft,
  CreditCard,
  Building2,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
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
    <div className="min-h-screen bg-white font-display">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-lily-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-lily-50 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-lily-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-lily-700">Add Funds</h1>
              <p className="text-sm font-bold text-gray-400">
                Top up your Lily Wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Error Alert */}
        <AnimatePresence>
          {(error || topup_error) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-2 border-red-100 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-700">Payment Error</p>
                  <p className="text-sm font-medium text-red-600/80">
                    {error || topup_error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Amount Input Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-soft border border-lily-50 p-8"
        >
          <div className="mb-8">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-lily-300">
                ₦
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-14 pr-6 py-6 text-4xl font-black text-gray-800 bg-lily-50/30 border-2 border-lily-100 rounded-3xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-50 transition-all placeholder:text-gray-200"
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 mt-3 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lily-400" />
              <p className="text-xs font-bold text-gray-400">
                Min: ₦100 • Max: ₦1,000,000
              </p>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              Quick Select
            </p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAmount(amt)}
                  className={`py-4 rounded-2xl font-black text-lg transition-all ${
                    amount === amt.toString()
                      ? "bg-lily-500 text-white shadow-glow"
                      : "bg-lily-50/50 text-lily-700 hover:bg-lily-100/50 border border-lily-100/20"
                  }`}
                >
                  ₦{(amt / 1000).toFixed(0)}k
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
          className="bg-white rounded-[2.5rem] shadow-soft border border-lily-50 p-8"
        >
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center tracking-tight">
            <Sparkles className="w-6 h-6 text-lily-500 mr-3" />
            Method
          </h3>

          <div className="space-y-4">
            {/* Card Payment */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod("card")}
              className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left ${
                paymentMethod === "card"
                  ? "border-lily-500 bg-lily-50/30 shadow-sm"
                  : "border-gray-100 hover:border-lily-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      paymentMethod === "card"
                        ? "bg-lily-500 text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-lg">
                      Debit Card
                    </p>
                    <p className="text-sm font-bold text-gray-400">
                      Instant • Secured by Paystack
                    </p>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <div className="w-8 h-8 bg-lily-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-lily-600 rounded-full" />
                  </div>
                )}
              </div>
            </motion.button>

            {/* Bank Transfer */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod("transfer")}
              className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left ${
                paymentMethod === "transfer"
                  ? "border-lily-500 bg-lily-50/30 shadow-sm"
                  : "border-gray-100 hover:border-lily-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      paymentMethod === "transfer"
                        ? "bg-lily-500 text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-lg">
                      Transfer / USSD
                    </p>
                    <p className="text-sm font-bold text-gray-400">
                      Manual or Automated verification
                    </p>
                  </div>
                </div>
                {paymentMethod === "transfer" && (
                  <div className="w-8 h-8 bg-lily-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-lily-600 rounded-full" />
                  </div>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <div className="pt-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={!topup_loading ? { scale: 1.02 } : {}}
            whileTap={!topup_loading ? { scale: 0.98 } : {}}
            onClick={handleDeposit}
            disabled={topup_loading || !amount || parseFloat(amount) < 100}
            className={`w-full py-6 rounded-3xl font-black text-xl transition-all flex items-center justify-center space-x-3 ${
              topup_loading || !amount || parseFloat(amount) < 100
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-lily-500 text-white shadow-glow hover:shadow-glow-lg"
            }`}
          >
            {topup_loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  Deposit{" "}
                  {amount ? `₦${parseFloat(amount).toLocaleString()}` : ""}
                </span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-4"
        >
          <div className="flex items-center space-x-2 text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              PCI-DSS Compliant
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-gray-400">
            Payments are secured by{" "}
            <span className="text-lily-600">Paystack</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
