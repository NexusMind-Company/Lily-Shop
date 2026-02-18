import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { fetchWallet } from "../../redux/walletSlice";

export default function WalletHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get wallet state
  const { balance_naira, recent_transactions, loading, error } = useSelector(
    (state) => state.wallet || {}
  );

  // Get token
  const reduxToken = useSelector((state) => state.auth?.user_data?.token?.access);
  const token = reduxToken || localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchWallet());
  }, [dispatch, token, navigate]);

  // Handle callback status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status === "success") {
      // Show success notification
      setTimeout(() => navigate("/wallet", { replace: true }), 2000);
    } else if (status === "failed") {
      setTimeout(() => navigate("/wallet", { replace: true }), 2000);
    }
  }, [location.search, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWallet());
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate stats
  const pendingAmount = recent_transactions
    ?.filter((t) => t.status === "pending")
    ?.reduce((sum, t) => sum + (t.amount_naira || 0), 0) || 0;

  const thisMonthTransactions = recent_transactions?.filter((t) => {
    const txDate = new Date(t.date || t.created_at);
    const now = new Date();
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  }).length || 0;

  const getTransactionIcon = (type) => {
    if (type === "credit" || type === "wallet_credit" || type === "sale") {
      return ArrowDownLeft;
    }
    return ArrowUpRight;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-success";
      case "failed":
        return "text-error";
      case "pending":
        return "text-warning";
      default:
        return "text-gray-600";
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
              Lily Wallet
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-700 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Success/Error Notifications */}
        <AnimatePresence>
          {location.search.includes("status=success") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-success/10 border-2 border-success/20 rounded-2xl p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                <div>
                  <p className="font-semibold text-success">Deposit Successful!</p>
                  <p className="text-sm text-success/80">
                    Your wallet has been credited.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {location.search.includes("status=failed") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border-2 border-error/20 rounded-2xl p-4"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-error flex-shrink-0" />
                <div>
                  <p className="font-semibold text-error">Payment Failed</p>
                  <p className="text-sm text-error/80">
                    Please try again or contact support.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lily-500 via-lily-600 to-purple-600 p-6 shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 font-medium">Available Balance</span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
                <span className="text-white">Loading...</span>
              </div>
            ) : error ? (
              <p className="text-white/90 text-sm">{error}</p>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-5xl font-bold text-white mb-2">
                    {showBalance
                      ? `₦${(balance_naira || 0).toLocaleString()}`
                      : "₦••••••"}
                  </h2>
                  {pendingAmount > 0 && (
                    <p className="text-white/80 text-sm flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        ₦{pendingAmount.toLocaleString()} pending
                      </span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link to="/deposit" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-white text-lily-600 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Deposit</span>
                    </motion.button>
                  </Link>
                  <Link to="/withdraw" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/30 transition-colors"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      <span>Withdraw</span>
                    </motion.button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-success/10 rounded-xl mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {recent_transactions?.filter((t) => t.type === "credit").length || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Credits</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-lily-100 rounded-xl mb-2">
                <ArrowUpRight className="w-5 h-5 text-lily-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {recent_transactions?.filter((t) => t.type === "debit").length || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Debits</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-purple-100 rounded-xl mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {thisMonthTransactions}
              </p>
              <p className="text-xs text-gray-600 mt-1">This Month</p>
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
              <Link
                to="/transaction-history"
                className="text-sm font-semibold text-lily-600 hover:text-lily-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading transactions...</p>
              </div>
            ) : recent_transactions && recent_transactions.length > 0 ? (
              recent_transactions.slice(0, 5).map((tx, index) => {
                const Icon = getTransactionIcon(tx.type);
                const isCredit = tx.type === "credit" || tx.type === "wallet_credit" || tx.type === "sale";

                return (
                  <motion.div
                    key={tx.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-xl ${
                          isCredit ? "bg-success/10" : "bg-lily-100"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isCredit ? "text-success" : "text-lily-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {tx.transaction_type || "Transaction"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(tx.date || tx.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            isCredit ? "text-success" : "text-error"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {Math.abs(tx.amount_naira || 0).toLocaleString()}
                        </p>
                        <p className={`text-xs ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
