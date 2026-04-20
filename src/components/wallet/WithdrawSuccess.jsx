import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  Share2,
  Download,
  Landmark,
  Calendar,
  ShieldCheck,
  Home,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function WithdrawSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, account, total, date, reference } = location.state || {};

  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!amount) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <button
          onClick={() => navigate("/wallet")}
          className="text-lily-600 font-black uppercase"
        >
          Back to Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-display py-12 px-4 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
          colors={["#4eb75e", "#22c55e", "#bbf7d0", "#ffffff"]}
        />
      )}

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-lily-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <CheckCircle className="w-14 h-14 text-lily-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black text-gray-800 tracking-tight mb-2"
          >
            Request Received!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-bold uppercase tracking-widest text-xs"
          >
            Withdrawal Processing
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[2.5rem] shadow-soft border border-lily-50 overflow-hidden mb-8"
        >
          <div className="bg-lily-gradient p-8 text-white text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">
              Total Amount
            </p>
            <h2 className="text-5xl font-black tracking-tighter">
              ₦{amount.toLocaleString()}
            </h2>
          </div>

          <div className="p-8 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-lily-50">
              <div className="flex items-center space-x-3 text-gray-400">
                <Landmark className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  To Bank
                </span>
              </div>
              <span className="font-black text-gray-800 uppercase text-sm tracking-tight">
                {account.bankName}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-lily-50">
              <div className="flex items-center space-x-3 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Date
                </span>
              </div>
              <span className="font-black text-gray-800 text-sm">
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-lily-50">
              <div className="flex items-center space-x-3 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Ref ID
                </span>
              </div>
              <span className="font-black text-gray-800 text-xs tracking-widest">
                {reference}
              </span>
            </div>

            <div className="pt-4 flex flex-col items-center">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Credited within 24 hours</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="flex items-center justify-center space-x-2 py-4 bg-lily-50 text-lily-700 rounded-2xl font-black text-sm active:scale-95 transition-all">
            <Download className="w-4 h-4" />
            <span>Receipt</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-4 bg-lily-50 text-lily-700 rounded-2xl font-black text-sm active:scale-95 transition-all">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/wallet")}
            className="w-full py-6 bg-lily-500 text-white rounded-3xl font-black text-xl shadow-glow hover:shadow-glow-lg transition-all active:scale-95 flex items-center justify-center space-x-3"
          >
            <Home className="w-6 h-6" />
            <span>Back to Wallet</span>
          </button>
          <button
            onClick={() => navigate("/feed")}
            className="w-full py-4 text-gray-400 font-black uppercase tracking-widest text-sm hover:text-lily-600 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
