import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  Landmark,
  ShoppingCart,
  BadgePercent,
  Undo2,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { fetchWallet } from "../../redux/walletSlice";

const WithdrawIcon = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.51749 2.2957C3.62495 0.925553 0.587582 3.89045 1.88748 6.81522L3.84319 11.2156C4.06731 11.7198 4.06731 12.2955 3.84318 12.7998L1.88748 17.2001C0.587582 20.1249 3.62495 23.0898 6.51749 21.7196L20.4376 15.1259C23.0687 13.8796 23.0687 10.1358 20.4376 8.88946L6.51749 2.2957ZM3.2582 6.20602C2.52342 4.55275 4.24032 2.87682 5.87536 3.65131L19.7955 10.2451C21.2827 10.9495 21.2827 13.0658 19.7955 13.7703L5.87536 20.364C4.24032 21.1385 2.52342 19.4626 3.2582 17.8093L5.2139 13.409C5.30776 13.1978 5.3794 12.9796 5.42882 12.7576H11.7668C12.181 12.7576 12.5168 12.4218 12.5168 12.0076C12.5168 11.5934 12.181 11.2576 11.7668 11.2576H5.42878C5.37936 11.0357 5.30774 10.8175 5.2139 10.6063L3.2582 6.20602Z"
      fill="currentColor"
    />
  </svg>
);

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
      ?.filter((t) => t.status === "pending" || t.status === "processing")
      ?.reduce((sum, t) => sum + (t.amount_naira || 0), 0) || 0;

  const totalCredits =
    recent_transactions?.filter((t) =>
      ["credit", "wallet_credit", "sale", "deposit"].includes(
        t.type?.toLowerCase(),
      ),
    ).length || 0;

  const totalDebits =
    recent_transactions?.filter((t) =>
      ["debit", "withdrawal"].includes(t.type?.toLowerCase()),
    ).length || 0;

  const getTransactionIcon = (type, transaction_type = "") => {
    const typeLower = type?.toLowerCase() || "";
    const txTypeLower = transaction_type?.toLowerCase() || "";

    if (txTypeLower.includes("refund")) return Undo2;
    if (txTypeLower.includes("order") || txTypeLower.includes("payment"))
      return ShoppingCart;
    if (txTypeLower.includes("affiliate") || txTypeLower.includes("earning"))
      return BadgePercent;
    if (typeLower === "withdrawal" || txTypeLower.includes("withdrawal"))
      return Landmark;
    if (
      typeLower === "credit" ||
      typeLower === "wallet_credit" ||
      typeLower === "deposit"
    )
      return Plus;

    return Plus;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "successful") return "text-lily";
    if (s === "pending" || s === "processing") return "text-yellow-600";
    return "text-red-500";
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white font-display">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-7 h-7 text-gray-800" />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold text-gray-900 pr-8">
              Lily Wallet
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="absolute right-4 p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-400 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Notifications */}
            <AnimatePresence>
              {location.search.includes("status=success") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-lily/10 border border-lily/20 rounded-2xl p-4 flex items-center space-x-3 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 text-lily" />
                  <p className="text-sm font-semibold text-lily">
                    Deposit Successful!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Balance Section */}
            <div className="space-y-2">
              <p className="text-gray-500 font-medium">Available Balance</p>
              <div className="flex items-center space-x-4">
                <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                  {showBalance
                    ? `₦${(balance_naira || 0).toLocaleString()}`
                    : "₦ ••••••••"}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showBalance ? (
                    <Eye className="w-8 h-8" />
                  ) : (
                    <EyeOff className="w-8 h-8" />
                  )}
                </button>
              </div>
              {pendingAmount > 0 && (
                <div className="flex items-center space-x-1.5 pt-1">
                  <p className="text-sm font-bold">
                    <span className="text-gray-900">Pending: </span>
                    <span className="text-pink-500">
                      ₦{pendingAmount.toLocaleString()}
                    </span>
                  </p>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            {/* Mobile Actions (Hidden on Desktop) */}
            <div className="flex lg:hidden gap-4">
              <Link
                to={vendorId ? "/vendor/dashboard/earnings" : "/withdraw"}
                className="flex-1"
              >
                <button className="w-full flex items-center justify-center space-x-2 py-4 rounded-full border-2 border-lily text-lily font-bold bg-white active:scale-95 transition-transform">
                  <WithdrawIcon className="w-7 h-7" />
                  <span>Withdraw</span>
                </button>
              </Link>
              <Link to="/deposit" className="flex-1">
                <button className="w-full flex items-center justify-center space-x-2 py-4 rounded-full bg-lily text-white font-bold active:scale-95 transition-transform shadow-lg shadow-lily/20">
                  <Plus className="w-7 h-7" />
                  <span>Deposit</span>
                </button>
              </Link>
            </div>

            {/* History Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">History</h3>
                <Link
                  to="/transaction-history"
                  className="text-pink-500 font-bold hover:underline transition-all"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-lily animate-spin" />
                    <p className="text-gray-400 font-medium">
                      Loading activity...
                    </p>
                  </div>
                ) : recent_transactions && recent_transactions.length > 0 ? (
                  recent_transactions.slice(0, 8).map((tx, index) => {
                    const Icon = getTransactionIcon(
                      tx.type,
                      tx.transaction_type,
                    );
                    const isCredit = [
                      "credit",
                      "wallet_credit",
                      "sale",
                      "deposit",
                    ].includes(tx.type?.toLowerCase());

                    return (
                      <motion.div
                        key={tx.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:border-lily/20 transition-all flex items-center space-x-5"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-lily/5 group-hover:border-lily/10 transition-colors">
                          <Icon className="w-7 h-7 text-gray-700 group-hover:text-lily" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate lg:text-lg">
                            {tx.transaction_type ||
                              (isCredit ? "Deposit" : "Withdrawal")}
                          </p>
                          <p className="text-sm text-gray-400 font-semibold">
                            {new Date(
                              tx.date || tx.created_at,
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-bold lg:text-lg ${isCredit ? "text-lily" : "text-red-500"}`}
                          >
                            {isCredit ? "+" : "-"}₦
                            {(tx.amount_naira || 0).toLocaleString()}
                          </p>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(tx.status)}`}
                          >
                            {tx.status}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                      <Wallet className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">
                      No transactions yet
                    </p>
                    <p className="text-gray-400 text-sm font-medium">
                      When you make transactions, they'll appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Action Card */}
              <div className="bg-gray-50 rounded-4xl p-8 border border-gray-100 space-y-6">
                <h4 className="text-xl font-bold text-gray-900">
                  Wallet Actions
                </h4>
                <div className="space-y-4 flex flex-col">
                  <Link to="/deposit">
                    <button className="w-full flex items-center justify-center space-x-3 py-3 rounded-2xl bg-lily text-white font-bold hover:brightness-105 transition-all shadow-lg shadow-lily/20">
                      <Plus className="w-7 h-7" />
                      <span>Deposit</span>
                    </button>
                  </Link>
                  <Link
                    to={vendorId ? "/vendor/dashboard/earnings" : "/withdraw"}
                  >
                    <button className="w-full flex items-center justify-center space-x-3 py-3 rounded-2xl border-2 border-lily text-lily font-bold bg-white hover:bg-lily/5 transition-all">
                      <WithdrawIcon className="w-7 h-7" />
                      <span>Withdraw</span>
                    </button>
                  </Link>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                      Account Summary
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-lily/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-lily" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          Total Credits
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {totalCredits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          Total Debits
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {totalDebits}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
