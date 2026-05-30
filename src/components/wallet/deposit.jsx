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

    if (paymentMethod === "transfer") {
      navigate("/bank-transfer", {
        state: { amount: amountValue },
      });
      return;
    }

    try {
      const result = await dispatch(topUpWallet(amountValue));

      if (result.meta.requestStatus === "fulfilled") {
        const { authorization_url } = result.payload;

        if (authorization_url) {
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

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-lily">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-lily rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add Funds</h1>
              <p className="text-sm font-bold text-gray-600">
                Top up your Lily Wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10 pt-20">
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
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
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
          className="bg-white rounded-[2.5rem] shadow-soft border border-black p-8"
        >
          <div className="mb-8">
            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-lily">
                ₦
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-14 pr-6 py-6 text-4xl font-black text-gray-900 border-2 border-lily rounded-3xl focus:outline-none focus:border-lily focus:ring-4 focus:ring-lily transition-all placeholder:text-gray-400"
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 mt-3 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lily-400" />
              <p className="text-xs font-bold text-gray-900">
                Min: ₦100 • Max: ₦1,000,000
              </p>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
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
                      ? "border-2 border-lily bg-lily text-white"
                      : " text-lily hover:bg-lily/70 hover:text-white border border-lily"
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
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center tracking-tight">
            <Sparkles className="w-6 h-6 text-lily-500 mr-3" />
            Method
          </h3>

          <div className="space-y-4">
            {/* Card Payment */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod("card")}
              className={`w-full p-5 rounded-4xl transition-all text-left ${
                paymentMethod === "card"
                  ? "border-2 border-lily bg-lily shadow-sm"
                  : "border-2 border-black hover:border-black"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      paymentMethod === "card"
                        ? "text-white"
                        : "border-2 border-black text-black"
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-black text-lg ${
                      paymentMethod === "card"
                        ? "text-white"
                        : "text-gray-900"
                    }`}>
                      Debit Card
                    </p>
                    <p className={`text-sm font-bold ${
                      paymentMethod === "card"
                        ? "text-white/80"
                        : "text-gray-600"
                    }`}>
                      Instant • Secured by Paystack
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  paymentMethod === "card"
                    ? "bg-white"
                    : "bg-white border-2 border-black"
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    paymentMethod === "card"
                      ? "bg-lily"
                      : "bg-black"
                  }`} />
                </div>
              </div>
            </motion.button>

            {/* Bank Transfer */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod("transfer")}
              className={`w-full p-5 rounded-4xl transition-all text-left ${
                paymentMethod === "transfer"
                  ? "border-2 border-lily bg-lily shadow-sm"
                  : "border-2 border-black hover:border-black"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      paymentMethod === "transfer"
                        ? "text-white"
                        : "border-2 border-black text-black"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-black text-lg ${
                      paymentMethod === "transfer"
                        ? "text-white"
                        : "text-gray-900"
                    }`}>
                      Transfer / USSD
                    </p>
                    <p className={`text-sm font-bold ${
                      paymentMethod === "transfer"
                        ? "text-white/80"
                        : "text-gray-600"
                    }`}>
                      Manual or Automated verification
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  paymentMethod === "transfer"
                    ? "bg-white"
                    : "bg-white border-2 border-black"
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    paymentMethod === "transfer"
                      ? "bg-lily"
                      : "bg-black"
                  }`} />
                </div>
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
                ? "bg-gray-900 text-gray-300 cursor-not-allowed"
                : "bg-lily text-white shadow-glow hover:shadow-glow-lg"
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
          <div className="flex items-center space-x-2 text-gray-900">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              PCI-DSS Compliant
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-gray-900">
            Payments are secured by{" "}
            <span className="text-lily-600">Paystack</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
