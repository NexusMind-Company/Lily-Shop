import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-white items-center justify-center p-6 text-center font-display">
        <div className="w-24 h-24 rounded-full bg-lily-100 flex items-center justify-center mb-8 shadow-sm">
          <CheckCircle size={48} className="text-lily-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">
          Top Up Successful!
        </h2>
        <p className="text-gray-500 font-bold mb-10 max-w-70 leading-relaxed">
          ₦{formatPrice(parsedAmount)} has been added to your Lily Wallet.
        </p>
        <button
          onClick={() => navigate("/wallet")}
          className="w-full max-w-sm bg-lily-500 text-white font-black py-5 rounded-4xl text-lg shadow-glow active:scale-95 transition-all"
        >
          Go to Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-white font-display">
      {/* Header */}
      <div className="relative bg-white px-4 py-6 border-b border-lily-50 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-lily-50 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-lily-700" />
        </button>
        <h1 className="text-xl font-black text-lily-700 tracking-tight">
          Add Funds
        </h1>
      </div>

      <div className="flex-1 p-6 space-y-6 pb-36 overflow-y-auto relative">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-lily-50 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-lily-50 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Wallet icon banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lily-50/50 rounded-3xl p-6 flex items-center gap-5 border border-lily-100/50 relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Wallet size={32} className="text-lily-500" />
          </div>
          <div>
            <p className="text-xs font-black text-lily-400 uppercase tracking-widest">
              Adding to
            </p>
            <p className="font-black text-lily-700 text-xl tracking-tight">
              Lily Wallet
            </p>
            <p className="text-[10px] font-bold text-gray-400">
              Powered by Paystack Secure
            </p>
          </div>
        </motion.div>

        {/* Quick amount selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-lily/50 relative z-10"
        >
          <p className="font-black text-gray-400 uppercase tracking-widest mb-5 text-xs">
            Select amount
          </p>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => handleQuickSelect(val)}
                className={`py-4 rounded-2xl text-lg font-black transition-all ${
                  amount === String(val) && !customInput
                    ? "bg-lily text-white shadow-glow"
                    : "bg-lily/50 text-lily-700 hover:bg-lily/50 border border-lily/20"
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
            className={`mt-4 w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
              customInput
                ? "bg-lily border border-lily text-lily"
                : "bg-gray-50/50 text-gray-400 hover:bg-gray-100/50"
            }`}
          >
            <Plus size={16} /> Enter custom amount
          </button>

          {/* Custom input field */}
          <AnimatePresence>
            {customInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lily font-black text-xl">
                    ₦
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount ? formatPrice(amount) : ""}
                    onChange={handleCustomChange}
                    autoFocus
                    className="w-full pl-12 pr-6 py-5 bg-lily/30 rounded-2xl text-gray-800 font-black text-2xl outline-none border-2 border-lily focus:border-lily focus:ring-4 focus:ring-lily transition-all"
                  />
                </div>
                {parsedAmount > 0 && parsedAmount < 100 && (
                  <p className="text-red-500 text-[10px] font-bold mt-2 px-2 uppercase tracking-tight">
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
              className="bg-lily/30 rounded-3xl p-6 border border-lily/50 relative z-10"
            >
              <div className="flex items-center justify-between">
                <span className="text-lily font-bold text-sm">
                  Total Deposit
                </span>
                <span className="font-black text-lily text-2xl tracking-tighter">
                  ₦{formatPrice(parsedAmount)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                Secure redirection to Paystack checkout
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
              className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start gap-4 relative z-10"
            >
              <AlertCircle size={24} className="text-red-500 shrink-0" />
              <div>
                <p className="text-red-700 font-black text-sm uppercase tracking-tight">
                  Top up failed
                </p>
                <p className="text-red-600/80 text-xs font-bold mt-1">
                  {topUpMutation.error?.response?.data?.message ||
                    "Please check your network and try again."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <div className="flex items-start gap-4 bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 relative z-10">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Shield size={20} className="text-blue-500" />
          </div>
          <p className="text-blue-700 text-xs font-bold leading-relaxed">
            Your payment information is never stored on our servers. All
            transactions are handled securely by Paystack.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-lily-50 p-6 z-20">
        <button
          onClick={handleSubmit}
          disabled={!isValid || topUpMutation.isPending}
          className="w-full bg-lily text-white font-black py-5 rounded-4xl text-lg disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-glow flex items-center justify-center gap-3"
        >
          {topUpMutation.isPending ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <Wallet size={24} />
              <span>
                {isValid
                  ? `Pay ₦${formatPrice(parsedAmount)}`
                  : "Select Amount"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WalletTopUpPage;
