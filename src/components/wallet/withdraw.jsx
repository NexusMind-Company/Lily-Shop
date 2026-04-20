import React from "react";
import {
  ChevronLeft,
  Landmark,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BANK_STORAGE_KEY = "lily_wallet_bank_accounts";

const loadBankAccounts = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BANK_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function Withdraw() {
  const navigate = useNavigate();
  const bankAccounts = loadBankAccounts();
  const defaultAccount =
    bankAccounts.find((account) => account.isDefault) || bankAccounts[0];
  const hasBankAccounts = bankAccounts.length > 0;

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
              <h1 className="text-xl font-bold text-lily-700">
                Withdraw Funds
              </h1>
              <p className="text-sm font-bold text-gray-400 tracking-tight">
                Transfer to your bank account
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lily-50/50 rounded-[2.5rem] p-8 border border-lily-100/50 shadow-soft"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Landmark className="w-6 h-6 text-lily-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-800 mb-3 tracking-tight text-lg">
                Withdrawal Info
              </h3>
              <ul className="space-y-3">
                {[
                  "Minimum withdrawal: ₦1,000",
                  "Platform fee: 5% per transaction",
                  "Processing time: Instant to 24 hours",
                  "Maximum: 3 withdrawals per day",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center text-sm font-bold text-gray-500"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-lily-400 mr-3" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Withdrawal Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">
            Withdrawal Method
          </h2>

          {/* Bank Transfer Option */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() =>
              navigate(
                hasBankAccounts ? "/bankAccountDetails" : "/addBankAccount",
              )
            }
            className="w-full bg-white rounded-[2rem] p-6 shadow-soft hover:shadow-glow border border-lily-50 transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-lily-gradient rounded-2xl shadow-sm">
                  <Landmark className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-800 text-xl tracking-tight">
                    Bank Transfer
                  </p>
                  <p className="text-sm font-bold text-gray-400 mt-1">
                    {hasBankAccounts
                      ? `${defaultAccount.bankName} • ${defaultAccount.accountNumber}`
                      : "Add account to withdraw funds"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-lily-300" />
            </div>
          </motion.button>
        </motion.div>

        {/* Add Bank Account CTA */}
        {!hasBankAccounts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-lily-50/30 rounded-[2.5rem] p-10 border border-lily-100 text-center"
          >
            <div className="w-20 h-20 bg-lily-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-lily-500" />
            </div>
            <h3 className="font-black text-gray-800 text-2xl mb-3 tracking-tight">
              Connect Bank
            </h3>
            <p className="text-sm font-bold text-gray-400 mb-8 max-w-[240px] mx-auto leading-relaxed">
              Add your bank account details to start withdrawing your earnings
            </p>
            <Link to="/addBankAccount">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-lily-500 text-white px-8 py-4 rounded-2xl font-black shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Plus className="w-6 h-6" />
                <span>Add Account</span>
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-6"
        >
          <div className="flex items-center space-x-2 text-lily-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Secure Transfer
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-gray-400 max-w-[280px] text-center leading-relaxed">
            Your details are encrypted and processed through secure financial
            channels.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
