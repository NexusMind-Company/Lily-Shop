import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  Search,
  Filter,
  X,
  Plus,
  Landmark,
  ShoppingCart,
  BadgePercent,
  Undo2,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Hash,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWallet } from "../../redux/walletSlice";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { recent_transactions, loading, error } = useSelector(
    (state) => state.wallet,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const filteredTransactions = useMemo(() => {
    if (!recent_transactions) return [];

    return recent_transactions.filter((tx) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        tx.transaction_type?.toLowerCase().includes(searchLower) ||
        tx.reference?.toLowerCase().includes(searchLower);

      const isCredit = [
        "credit",
        "wallet_credit",
        "sale",
        "promotion_reward",
        "deposit",
      ].includes(tx.transaction_type?.toLowerCase() || tx.type?.toLowerCase());

      const txType = isCredit ? "credit" : "debit";
      const matchesType = filterType === "all" || txType === filterType;

      const matchesStatus =
        filterStatus === "all" || tx.status?.toLowerCase() === filterStatus;

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

  const stats = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        const isCredit = [
          "credit",
          "wallet_credit",
          "sale",
          "promotion_reward",
          "deposit",
        ].includes(
          tx.transaction_type?.toLowerCase() || tx.type?.toLowerCase(),
        );

        const amount = Math.abs(tx.amount_naira || 0);
        if (isCredit) acc.credits += amount;
        else acc.debits += amount;
        return acc;
      },
      { credits: 0, debits: 0 },
    );
  }, [filteredTransactions]);

  const getTransactionIcon = (type, transaction_type = "") => {
    const txTypeLower = transaction_type?.toLowerCase() || "";
    const typeLower = type?.toLowerCase() || "";

    if (txTypeLower.includes("refund")) return Undo2;
    if (txTypeLower.includes("order") || txTypeLower.includes("payment"))
      return ShoppingCart;
    if (txTypeLower.includes("affiliate") || txTypeLower.includes("earning"))
      return BadgePercent;
    if (typeLower === "withdrawal" || txTypeLower.includes("withdrawal"))
      return Landmark;
    if (txTypeLower.includes("deposit") || txTypeLower.includes("credit"))
      return Plus;

    return ArrowUpRight;
  };

  const formatTransactionDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return {
      display: `${getOrdinal(day)} ${month}, ${year}`,
      time: time,
    };
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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "successful") return "text-lily";
    if (s === "pending" || s === "processing") return "text-yellow-600";
    if (s === "failed" || s === "canceled") return "text-red-500";
    return "text-gray-500";
  };

  const handleTransactionClick = (tx) => {
    navigate("/receipt", { state: tx });
  };

  const FilterSection = ({ isDesktop = false }) => (
    <div
      className={`space-y-6 ${isDesktop ? "" : "max-w-2xl mx-auto px-4 py-5"}`}
    >
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Transaction Type
          </label>
          <div className="flex flex-wrap gap-2">
            {["all", "credit", "debit"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                  filterType === type
                    ? "bg-lily border-lily text-white shadow-sm"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {["all", "success", "pending", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                  filterStatus === status
                    ? "bg-lily border-lily text-white shadow-sm"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            {["all", "today", "week", "month"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                  dateRange === range
                    ? "bg-lily border-lily text-white shadow-sm"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                }`}
              >
                {range === "week"
                  ? "7 days"
                  : range === "month"
                    ? "30 days"
                    : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <button
          onClick={clearFilters}
          className="text-xs font-bold text-lily hover:underline"
        >
          Reset Filters
        </button>
        {!isDesktop && (
          <button
            onClick={() => setShowFilters(false)}
            className="text-xs font-bold text-white bg-lily px-6 py-2 rounded-xl shadow-sm"
          >
            Show Results
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-display">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">
                  Transaction History
                </h1>
                <p className="hidden md:block text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                  {filteredTransactions.length} results found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop search bar in header */}
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lily/20 transition-all text-xs font-medium"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:hidden p-2.5 rounded-xl border transition-all flex items-center justify-center relative ${
                  activeFiltersCount > 0
                    ? "bg-lily/5 border-lily text-lily"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-lily text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lily/20 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden shadow-sm"
          >
            <FilterSection isDesktop={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main List Section */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-lily" />
                <p className="text-sm font-medium">Fetching history...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-red-600 font-bold">{error}</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((tx, index) => {
                  const Icon = getTransactionIcon(tx.type, tx.transaction_type);
                  const isCredit = [
                    "credit",
                    "wallet_credit",
                    "sale",
                    "promotion_reward",
                    "deposit",
                  ].includes(
                    tx.transaction_type?.toLowerCase() ||
                      tx.type?.toLowerCase(),
                  );

                  const dateInfo = formatTransactionDate(
                    tx.date || tx.created_at,
                  );

                  return (
                    <motion.div
                      key={tx.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleTransactionClick(tx)}
                      className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-lily/20 transition-all cursor-pointer group"
                    >
                      <div className="mt-1 mr-5 text-gray-800 p-2 bg-gray-50 rounded-xl group-hover:bg-lily/5 group-hover:text-lily transition-colors">
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 text-[16px] truncate leading-tight">
                            {tx.transaction_type?.replace(/_/g, " ") ||
                              "Transaction"}
                          </p>
                          <div className="text-right hidden sm:block">
                            <p
                              className={`font-bold text-[18px] tracking-tight ${isCredit ? "text-lily" : "text-red-500"}`}
                            >
                              {isCredit ? "+" : "-"}₦
                              {Math.abs(tx.amount_naira || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400 font-medium">
                            {dateInfo.display}
                          </p>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {dateInfo.time}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {tx.reference ? (
                            <div className="flex items-center gap-1 text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                              <Hash className="w-2.5 h-2.5" />
                              ID: {tx.reference}
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-2">
                            <p
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 ${getStatusColor(tx.status)}`}
                            >
                              {tx.status}
                            </p>
                            <div className="sm:hidden">
                              <p
                                className={`font-bold text-[16px] tracking-tight ${isCredit ? "text-lily" : "text-red-500"}`}
                              >
                                {isCredit ? "+" : "-"}₦
                                {Math.abs(
                                  tx.amount_naira || 0,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex self-center ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-base font-bold text-gray-600">
                  No results found
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-[250px]">
                  Adjust your search or filters to find specific transactions.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-8">
            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                Filtered Summary
                <div className="h-px flex-1 bg-gray-50" />
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-lily/5 border border-lily/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-lily/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-lily" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Credits
                      </p>
                      <p className="text-lg font-bold text-lily">
                        ₦{stats.credits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100/50 rounded-lg">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Debits
                      </p>
                      <p className="text-lg font-bold text-red-500">
                        ₦{stats.debits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Filters in Sidebar */}
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                Filters
                <div className="h-px flex-1 bg-gray-50" />
              </h3>
              <FilterSection isDesktop={true} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
