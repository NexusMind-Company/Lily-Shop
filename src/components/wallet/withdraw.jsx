import React from "react";
import { ChevronLeft, Landmark, Plus, ArrowRight } from "lucide-react";
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
                Withdraw Money
              </h1>
              <p className="text-sm text-gray-600">Transfer to your bank account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-100"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">Withdrawal Information</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Minimum withdrawal: NGN 1,000</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Platform fee: 5% per transaction</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Processing time: Instant to 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Maximum: 3 withdrawals per day</span>
                </li>
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
          <h2 className="text-lg font-bold text-gray-800">Withdrawal Method</h2>

          {/* Bank Transfer Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              navigate(hasBankAccounts ? "/bankAccountDetails" : "/addBankAccount")
            }
            className="w-full bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-lily-500 to-purple-600 rounded-xl">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-lg">Bank Transfer</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {hasBankAccounts
                      ? `${defaultAccount.bankName} - ${defaultAccount.accountNumber}`
                      : "Add a bank account to get started"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          </motion.button>
        </motion.div>

        {/* Add Bank Account CTA */}
        {!hasBankAccounts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-lily-50 to-purple-50 rounded-3xl p-6 border-2 border-lily-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lily-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                No Bank Account Added
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your bank account details to start withdrawing funds
              </p>
              <Link to="/addBankAccount">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-lily-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Bank Account</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-800">Secure Withdrawals:</strong> All
                withdrawals are processed securely. Your bank account details are
                encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
