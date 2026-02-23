import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Search, Filter, X, ArrowUpRight, ArrowDownLeft, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWallet } from "../../redux/walletSlice";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { recent_transactions, loading, error } = useSelector((state) => state.wallet);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, credit, debit
  const [filterStatus, setFilterStatus] = useState("all"); // all, success, pending, failed
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    if (!recent_transactions) return [];

    return recent_transactions.filter((tx) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        tx.transaction_type?.toLowerCase().includes(searchLower) ||
        tx.reference?.toLowerCase().includes(searchLower);

      // Type filter
      const txType = tx.type || (["wallet_credit", "sale", "promotion_reward"].includes(tx.transaction_type) ? "credit" : "debit");
      const matchesType = filterType === "all" || txType === filterType;

      // Status filter
      const matchesStatus = filterStatus === "all" || tx.status?.toLowerCase() === filterStatus;

      // Date filter
      let matchesDate = true;
      if (dateRange !== "all") {
        const txDate = new Date(tx.date || tx.created_at);
        const now = new Date();
        const dayMs = 24 * 60 * 60 * 1000;

        switch (dateRange) {
          case "today":
            matchesDate = now - txDate < dayMs;
            break;
          case "week":
            matchesDate = now - txDate < 7 * dayMs;
            break;
          case "month":
            matchesDate = now - txDate < 30 * dayMs;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [recent_transactions, searchQuery, filterType, filterStatus, dateRange]);

  const getTransactionIcon = (type, transaction_type) => {
    const isCredit = type === "credit" || ["wallet_credit", "sale", "promotion_reward"].includes(transaction_type);
    return isCredit ? ArrowDownLeft : ArrowUpRight;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-success bg-success/10";
      case "failed":
        return "text-error bg-error/10";
      case "pending":
        return "text-warning bg-warning/10";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setDateRange("all");
  };

  const activeFiltersCount = [
    filterType !== "all",
    filterStatus !== "all",
    dateRange !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                  Transaction History
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Filter className={`w-6 h-6 ${activeFiltersCount > 0 ? "text-lily-600" : "text-gray-700"}`} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-lily-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Transaction Type
                </label>
                <div className="flex gap-2">
                  {["all", "credit", "debit"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                        filterType === type
                          ? "bg-lily-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Status
                </label>
                <div className="flex gap-2">
                  {["all", "success", "pending", "failed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                        filterStatus === status
                          ? "bg-lily-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Date Range
                </label>
                <div className="flex gap-2">
                  {["all", "today", "week", "month"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                        dateRange === range
                          ? "bg-lily-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {range === "week" ? "7 days" : range === "month" ? "30 days" : range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm font-semibold text-lily-600 hover:text-lily-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2 text-error" />
            <p className="text-error">{error}</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => {
              const Icon = getTransactionIcon(tx.type, tx.transaction_type);
              const isCredit = tx.type === "credit" || ["wallet_credit", "sale", "promotion_reward"].includes(tx.transaction_type);

              return (
                <motion.div
                  key={tx.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${isCredit ? "bg-success/10" : "bg-lily-100"}`}>
                      <Icon className={`w-5 h-5 ${isCredit ? "text-success" : "text-lily-600"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate capitalize">
                        {tx.transaction_type?.replace(/_/g, " ") || "Transaction"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {new Date(tx.date || tx.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {tx.reference && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          Ref: {tx.reference}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`font-bold text-lg ${isCredit ? "text-success" : "text-error"}`}>
                        {isCredit ? "+" : "-"}₦{Math.abs(tx.amount_naira || 0).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || activeFiltersCount > 0
                ? "Try adjusting your filters"
                : "Your transactions will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
