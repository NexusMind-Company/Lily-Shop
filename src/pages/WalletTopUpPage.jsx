import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  Wallet,
  Plus,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import from your api.js
import { topUpWallet } from "../services/api";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

const formatPrice = (val) =>
  Number(val)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const WalletTopUpPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [amount, setAmount] = useState("");
  const [customInput, setCustomInput] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const topUpMutation = useMutation({
    mutationFn: (amountNaira) => topUpWallet(amountNaira),
    onSuccess: (data) => {
      // If Paystack returns an authorization URL, redirect there
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        // Wallet credited instantly (unlikely but handle it)
        setSuccessData(data);
      }
    },
  });

  const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const isValid = parsedAmount >= 100;

  const handleQuickSelect = (val) => {
    setAmount(String(val));
    setCustomInput(false);
  };

  const handleCustomChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    topUpMutation.mutate(parsedAmount);
  };

  // Success screen (if no Paystack redirect)
  if (successData) {
    return (
      <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-[#f6f8f6] items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#13ec49]/10 border-4 border-[#13ec49] flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-[#13ec49]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111813] mb-2">Top Up Successful!</h2>
        <p className="text-gray-500 text-sm mb-8">
          ₦{formatPrice(parsedAmount)} has been added to your Lily Wallet.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-[#13ec49] text-[#111813] font-bold py-4 rounded-2xl text-base"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-[#f6f8f6]">
      {/* Header */}
      <div className="relative bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-[#111813]">Top Up Wallet</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-36 overflow-y-auto">
        {/* Wallet icon banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#13ec49]/10 flex items-center justify-center">
            <Wallet size={28} className="text-[#13ec49]" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Adding to</p>
            <p className="font-bold text-[#111813] text-lg">Lily Wallet</p>
            <p className="text-xs text-gray-400">Powered by Paystack</p>
          </div>
        </motion.div>

        {/* Quick amount selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <p className="font-semibold text-[#111813] mb-3 text-sm">Select amount</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => handleQuickSelect(val)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                  amount === String(val) && !customInput
                    ? "bg-[#13ec49] border-[#13ec49] text-[#111813]"
                    : "bg-[#f6f8f6] border-transparent text-gray-600 hover:border-[#13ec49]/40"
                }`}
              >
                ₦{formatPrice(val)}
              </button>
            ))}
          </div>

          {/* Custom amount toggle */}
          <button
            onClick={() => {
              setCustomInput(true);
              setAmount("");
            }}
            className={`mt-3 w-full py-3 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
              customInput
                ? "bg-[#13ec49]/10 border-[#13ec49] text-[#111813]"
                : "bg-[#f6f8f6] border-transparent text-gray-500"
            }`}
          >
            <Plus size={15} /> Enter custom amount
          </button>

          {/* Custom input field */}
          <AnimatePresence>
            {customInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    ₦
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount ? formatPrice(amount) : ""}
                    onChange={handleCustomChange}
                    autoFocus
                    className="w-full pl-8 pr-4 py-3.5 bg-[#f6f8f6] rounded-xl text-[#111813] font-bold text-base outline-none focus:ring-2 focus:ring-[#13ec49]/40"
                  />
                </div>
                {parsedAmount > 0 && parsedAmount < 100 && (
                  <p className="text-red-400 text-xs mt-1 px-1">
                    Minimum top-up amount is ₦100
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Amount summary */}
        <AnimatePresence>
          {isValid && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">You're adding</span>
                <span className="font-extrabold text-[#13ec49] text-xl">
                  ₦{formatPrice(parsedAmount)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You'll be redirected to Paystack to complete payment securely.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {topUpMutation.isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">
                {topUpMutation.error?.response?.data?.message ||
                  "Top up failed. Please try again."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <div className="flex items-start gap-2 bg-blue-50 rounded-2xl p-4">
          <Shield size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-600 text-xs leading-relaxed">
            Your payment is secured by Paystack. After completing payment, your wallet balance
            will be updated automatically.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-100 p-4">
        <button
          onClick={handleSubmit}
          disabled={!isValid || topUpMutation.isPending}
          className="w-full bg-[#13ec49] text-[#111813] font-bold py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {topUpMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Redirecting to Paystack...
            </>
          ) : (
            <>
              <Wallet size={18} />
              {isValid ? `Top Up ₦${formatPrice(parsedAmount)}` : "Select an Amount"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WalletTopUpPage;