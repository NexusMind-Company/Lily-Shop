import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, AlertTriangle, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/api";
import { fetchWallet } from "../../redux/walletSlice";

const BANK_STORAGE_KEY = "lily_wallet_bank_accounts";

const loadBankAccounts = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BANK_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function WithdrawConfirm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const storedDefaultAccount = useMemo(() => {
    const bankAccounts = loadBankAccounts();
    return bankAccounts.find((account) => account.isDefault) || bankAccounts[0];
  }, []);
  const bankDetails = location.state || storedDefaultAccount;

  const { withdrawable_naira = 0 } = useSelector((state) => state.wallet || {});

  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const platformFee = amount ? parseFloat(amount) * 0.05 : 0;
  const receivable = amount ? parseFloat(amount) - platformFee : 0;

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    if (!bankDetails) {
      navigate("/bankAccountDetails", { replace: true });
    }
  }, [bankDetails, navigate]);

  if (!bankDetails) {
    return null;
  }

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const validateWithdrawal = () => {
    const amountValue = parseFloat(amount);

    if (!amountValue || amountValue <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (amountValue < 1000) {
      setError("Minimum withdrawal is NGN 1,000");
      return false;
    }

    if (amountValue > withdrawable_naira) {
      setError(`Insufficient withdrawable balance. You have NGN ${withdrawable_naira.toLocaleString()}`);
      return false;
    }

    return true;
  };

  const handleProceed = () => {
    if (!validateWithdrawal()) return;
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      const response = await api.post("/wallet/withdraw/", {
        amount_kobo: Math.round(parseFloat(amount) * 100),
        bank_name: bankDetails.bankName,
        account_number: bankDetails.accountNumber,
        account_name: bankDetails.accountName,
      });

      // Navigate to success page
      navigate("/withdraw/success", {
        state: {
          amount: amount,
          fee: platformFee.toFixed(2),
          accountNumber: bankDetails.accountNumber,
          accountName: bankDetails.accountName,
          bankName: bankDetails.bankName,
          date: new Date().toLocaleString(),
          withdrawalId: response.data.withdrawal_id,
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Withdrawal failed. Please try again.";
      setError(errorMsg);
      setProcessing(false);
      setShowModal(false);
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
                Confirm Withdrawal
              </h1>
              <p className="text-sm text-gray-600">Review your withdrawal details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border-2 border-error/20 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bank Details Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-card p-6"
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Withdraw To</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Bank</span>
              <span className="font-semibold text-gray-800">{bankDetails.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Number</span>
              <span className="font-semibold text-gray-800">
                {bankDetails.accountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Name</span>
              <span className="font-semibold text-gray-800">
                {bankDetails.accountName}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-card p-6"
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter Amount
          </label>
                    <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              NGN
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              className="w-full pl-16 pr-4 py-4 text-3xl font-bold bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
              placeholder="0.00"
            />
          </div>
                    <div className="flex justify-between text-sm text-gray-600">
            <span>Min: NGN 1,000</span>
            <span>Available: NGN {(withdrawable_naira || 0).toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Fee Breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-card p-6 space-y-3"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Breakdown</h3>
            <div className="flex justify-between text-gray-600">
              <span>Withdrawal Amount</span>
              <span className="font-semibold">NGN {parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee (5%)</span>
              <span className="font-semibold text-error">
                -NGN {platformFee.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">You'll Receive</span>
              <span className="font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                NGN {receivable.toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Processing Time:</strong> Withdrawals are usually processed
                instantly but may take up to 24 hours depending on your bank.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={amount && parseFloat(amount) >= 1000 ? { scale: 1.02 } : {}}
          whileTap={amount && parseFloat(amount) >= 1000 ? { scale: 0.98 } : {}}
          onClick={handleProceed}
          disabled={!amount || parseFloat(amount) < 1000}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            amount && parseFloat(amount) >= 1000
              ? "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Proceed to Withdraw
        </motion.button>
      </div>

      {/* Password Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Withdrawal
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Review the amount and destination account, then confirm this withdrawal.
              </p>

              <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                This request will be submitted immediately and may take up to 24 hours to land in your bank account.
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    !processing
                      ? "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
