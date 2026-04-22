import React, { useState } from "react";
import {
  ChevronLeft,
  Landmark,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function WithdrawConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, account } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fee = amount * 0.05;
  const total = amount - fee;

  const handleWithdraw = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      navigate("/withdraw/success", {
        state: {
          amount,
          account,
          total,
          date: new Date().toISOString(),
          reference: `WTH-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        },
      });
    } catch (err) {
      setError("Withdrawal request failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!amount || !account) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Invalid withdrawal session</p>
          <button
            onClick={() => navigate("/wallet")}
            className="mt-4 text-lily-600 font-black uppercase"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-display">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lily-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-lily-50 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-lily-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-lily-700">
                Confirm Transfer
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Withdrawal Review
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-soft border border-lily-50 p-8 text-center"
        >
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Total Withdrawal
          </p>
          <h2 className="text-5xl font-black text-gray-800 mb-8 tracking-tighter">
            ₦{amount.toLocaleString()}
          </h2>

          <div className="bg-lily-50/30 rounded-3xl p-6 space-y-4 border border-lily-100 mb-8">
            <div className="flex justify-between items-center pb-4 border-b border-lily-100/50">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                To Bank
              </span>
              <span className="font-black text-gray-800">
                {account.bankName}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-lily-100/50">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Account
              </span>
              <span className="font-black text-gray-800">
                •••• {account.accountNumber.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-lily-100/50 text-red-500">
              <span className="text-sm font-bold uppercase tracking-widest">
                Fee (5%)
              </span>
              <span className="font-black">-₦{fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-black text-lily-700 uppercase tracking-widest">
                Expected Credited
              </span>
              <span className="font-black text-2xl text-lily-700 tracking-tighter">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl mb-8">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-blue-700 text-left leading-relaxed">
              Withdrawals are typically processed within 24 hours. You will
              receive a notification once the transfer is successful.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full py-6 bg-lily-500 text-white rounded-3xl font-black text-xl shadow-glow hover:shadow-glow-lg transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-30 disabled:grayscale"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Confirm Withdrawal</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </motion.div>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 text-gray-400 font-black uppercase tracking-widest text-sm hover:text-lily-600 transition-colors"
        >
          Cancel Request
        </button>
      </div>
    </div>
  );
}
