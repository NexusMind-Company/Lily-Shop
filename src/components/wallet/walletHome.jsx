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
    (state) => state.wallet || {},
  );
  const vendorId = useSelector(
    (state) =>
      state.auth?.user_data?.vendor_id ||
      state.profile?.data?.user?.vendor_id ||
      null,
  );

  // Get token
  const reduxToken = useSelector(
    (state) => state.auth?.user_data?.token?.access,
  );
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
  const pendingAmount =
    recent_transactions
      ?.filter((t) => t.status === "pending")
      ?.reduce((sum, t) => sum + (t.amount_naira || 0), 0) || 0;

  const thisMonthTransactions =
    recent_transactions?.filter((t) => {
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

  if (!token) return null;

  return (
    <div className="min-h-screen bg-lily font-display">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-lily-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-lily-50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-lily-700" />
            </button>
            <h1 className="text-xl font-bold text-lily-700">Lily Wallet</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-lily-50 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-lily-700 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Success/Error Notifications */}
        <AnimatePresence>
          {location.search.includes("status=success") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-lily-100 border-2 border-lily-200 rounded-2xl p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-lily-600 shrink-0" />
                <div>
                  <p className="font-semibold text-lily-800">
                    Deposit Successful!
                  </p>
                  <p className="text-sm text-lily-600">
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
                <XCircle className="w-6 h-6 text-error shrink-0" />
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
          className="relative overflow-hidden rounded-[2.5rem] bg-lily-gradient p-8 shadow-glow"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/90 font-bold tracking-tight text-lg">
                  Available Balance
                </span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-6 h-6 text-white" />
                ) : (
                  <EyeOff className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center space-x-3 py-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <span className="text-white text-xl font-medium">
                  Loading wallet...
                </span>
              </div>
            ) : error ? (
              <p className="text-white/90 text-sm bg-black/10 p-3 rounded-xl">
                {error}
              </p>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">
                    {showBalance
                      ? `₦${(balance_naira || 0).toLocaleString()}`
                      : "₦ ••••••••"}
                  </h2>
                  {pendingAmount > 0 && (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-bold">
                        ₦{pendingAmount.toLocaleString()} pending
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link to="/deposit" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-white text-lily-700 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Deposit</span>
                    </motion.button>
                  </Link>
                  <Link
                    to={vendorId ? "/vendor/dashboard/earnings" : "/withdraw"}
                    className="flex-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm text-white py-4 rounded-2xl font-black border-2 border-white/30 hover:bg-white/30 transition-all shadow-lg"
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
            className="bg-white rounded-3xl p-5 shadow-soft border border-lily-50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-lily-50 rounded-2xl mb-3">
                <TrendingUp className="w-6 h-6 text-lily-600" />
              </div>
              <p className="text-2xl font-black text-gray-800 tracking-tight">
                {recent_transactions?.filter(
                  (t) =>
                    t.type === "credit" ||
                    t.type === "wallet_credit" ||
                    t.type === "sale",
                ).length || 0}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                Credits
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-5 shadow-soft border border-lily-50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-50 rounded-2xl mb-3">
                <ArrowUpRight className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl font-black text-gray-800 tracking-tight">
                {recent_transactions?.filter(
                  (t) => t.type === "debit" || t.type === "withdrawal",
                ).length || 0}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                Debits
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 shadow-soft border border-lily-50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-lily-100 rounded-2xl mb-3">
                <Clock className="w-6 h-6 text-lily-600" />
              </div>
              <p className="text-2xl font-black text-gray-800 tracking-tight">
                {thisMonthTransactions}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                Monthly
              </p>
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-lily-50"
        >
          <div className="p-8 border-b border-lily-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">
                Activity
              </h2>
              <Link
                to="/transaction-history"
                className="text-sm font-black text-lily-600 hover:text-lily-700 transition-colors bg-lily-50 px-4 py-2 rounded-full"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-lily-50">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-lily-200 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">
                  Loading history...
                </p>
              </div>
            ) : recent_transactions && recent_transactions.length > 0 ? (
              recent_transactions.slice(0, 5).map((tx, index) => {
                const Icon = getTransactionIcon(tx.type);
                const isCredit =
                  tx.type === "credit" ||
                  tx.type === "wallet_credit" ||
                  tx.type === "sale";

                return (
                  <motion.div
                    key={tx.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-lily-50/50 transition-colors"
                  >
                    <div className="flex items-center space-x-5">
                      <div
                        className={`p-3.5 rounded-2xl shadow-sm ${
                          isCredit ? "bg-lily-100" : "bg-red-50"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isCredit ? "text-lily-600" : "text-red-500"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate text-lg">
                          {tx.transaction_type || "Transaction"}
                        </p>
                        <p className="text-sm font-bold text-gray-400">
                          {new Date(
                            tx.date || tx.created_at,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-black text-lg ${
                            isCredit ? "text-lily-600" : "text-red-500"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {Math.abs(tx.amount_naira || 0).toLocaleString()}
                        </p>
                        <div
                          className={`text-[10px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full inline-block ${
                            tx.status?.toLowerCase() === "success"
                              ? "bg-lily-100 text-lily-700"
                              : tx.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-lily-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-lily-200" />
                </div>
                <p className="text-gray-800 font-black text-xl">Empty Wallet</p>
                <p className="text-gray-400 font-bold text-sm mt-1">
                  Start by adding some funds to your wallet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
