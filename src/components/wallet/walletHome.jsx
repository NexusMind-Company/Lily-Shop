import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const isCreditTransaction = (transaction) =>
  transaction?.type === "credit" ||
  ["wallet_credit", "sale", "promotion_reward"].includes(
    transaction?.transaction_type,
  );

export default function WalletHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {
    balance_naira,
    withdrawable_naira,
    recent_transactions,
    loading,
    error,
  } = useSelector((state) => state.wallet || {});

  const reduxToken = useSelector((state) => state.auth?.user_data?.token?.access);
  const token = reduxToken || localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchWallet());
  }, [dispatch, token, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status === "success" || status === "failed") {
      const timeout = setTimeout(() => {
        navigate("/wallet", { replace: true });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [location.search, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWallet());
    setTimeout(() => setRefreshing(false), 500);
  };

  const pendingAmount =
    recent_transactions
      ?.filter((transaction) => transaction.status === "pending")
      ?.reduce((sum, transaction) => sum + Number(transaction.amount_naira || 0), 0) || 0;

  const creditCount =
    recent_transactions?.filter((transaction) => isCreditTransaction(transaction))
      ?.length || 0;
  const debitCount =
    recent_transactions?.filter((transaction) => !isCreditTransaction(transaction))
      ?.length || 0;

  const thisMonthTransactions =
    recent_transactions?.filter((transaction) => {
      const txDate = new Date(transaction.date || transaction.created_at);
      const now = new Date();
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })?.length || 0;

  const recentFive = useMemo(
    () => (recent_transactions || []).slice(0, 5),
    [recent_transactions],
  );

  const getTransactionIcon = (transaction) =>
    isCreditTransaction(transaction) ? ArrowDownLeft : ArrowUpRight;

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
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              Lily Wallet
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-700 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <AnimatePresence>
          {location.search.includes("status=success") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border-2 border-success/20 bg-success/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-success" />
                <div>
                  <p className="font-semibold text-success">Deposit Successful</p>
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
              className="rounded-2xl border-2 border-error/20 bg-error/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 flex-shrink-0 text-error" />
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lily-500 via-lily-600 to-purple-600 p-6 shadow-2xl"
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-white/90">
                  Available Balance
                </span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                {showBalance ? (
                  <Eye className="h-5 w-5 text-white" />
                ) : (
                  <EyeOff className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="text-white">Loading...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-white/90">{error}</p>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="mb-2 text-5xl font-bold text-white">
                    {showBalance
                      ? `₦${Number(balance_naira || 0).toLocaleString()}`
                      : "₦••••••"}
                  </h2>
                  {pendingAmount > 0 && (
                    <p className="flex items-center space-x-1 text-sm text-white/80">
                      <Clock className="h-4 w-4" />
                      <span>₦{pendingAmount.toLocaleString()} pending</span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-white/80">
                    Withdrawable: ₦
                    {Number(withdrawable_naira || 0).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link to="/deposit" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-white py-3 font-semibold text-lily-600 shadow-lg transition-shadow hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Deposit</span>
                    </motion.button>
                  </Link>
                  <Link to="/withdraw" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-white/30 bg-white/20 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                      <span>Withdraw</span>
                    </motion.button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 rounded-xl bg-success/10 p-2">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{creditCount}</p>
              <p className="mt-1 text-xs text-gray-600">Credits</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 rounded-xl bg-lily-100 p-2">
                <ArrowUpRight className="h-5 w-5 text-lily-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{debitCount}</p>
              <p className="mt-1 text-xs text-gray-600">Debits</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-4 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 rounded-xl bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {thisMonthTransactions}
              </p>
              <p className="mt-1 text-xs text-gray-600">This Month</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="overflow-hidden rounded-2xl bg-white shadow-card"
        >
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Transactions
              </h2>
              <Link
                to="/transaction-history"
                className="text-sm font-semibold text-lily-600 transition-colors hover:text-lily-700"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-gray-400" />
                <p className="text-sm text-gray-600">Loading transactions...</p>
              </div>
            ) : recentFive.length > 0 ? (
              recentFive.map((transaction, index) => {
                const Icon = getTransactionIcon(transaction);
                const isCredit = isCreditTransaction(transaction);

                return (
                  <motion.div
                    key={transaction.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`rounded-xl p-3 ${
                          isCredit ? "bg-success/10" : "bg-lily-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isCredit ? "text-success" : "text-lily-600"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-800">
                          {transaction.transaction_type || "Transaction"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            transaction.date || transaction.created_at,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            isCredit ? "text-success" : "text-error"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {Math.abs(
                            Number(transaction.amount_naira || 0),
                          ).toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No transactions yet</p>
                <p className="mt-1 text-sm text-gray-500">
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
