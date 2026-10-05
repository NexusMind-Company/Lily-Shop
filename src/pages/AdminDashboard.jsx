import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Users,
  Store,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { api } from "../services/api";

const PRESET_RANGES = [
  { id: "all", label: "All Time" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "year", label: "This Year" },
];

const DEFAULT_LILYSHOPS_PERCENTAGE = 10;

const formatDateToIso = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount) => {
  const numericValue = Number(amount) || 0;
  return `₦${numericValue.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatYAxisTick = (val) => {
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}k`;
  return `₦${val}`;
};

const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {};
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
        <p className="font-bold text-sm text-slate-100 mb-2 border-b border-slate-800 pb-1.5">
          {data.name || label || "Period"}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4eb75e] inline-block" />
              Total Revenue:
            </span>
            <span className="font-bold text-white">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#13ec49] inline-block" />
              Lilyshops Share:
            </span>
            <span className="font-bold text-emerald-400">{formatCurrency(data.lilyshops)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-slate-400">
            <span>Vendor Payout:</span>
            <span className="font-semibold text-slate-200">{formatCurrency(data.vendorPayout)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color || data.color }}
          />
          <span className="font-medium text-slate-200">{data.name}:</span>
          <span className="font-bold text-white">
            {data.value} subscriber{data.value === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  hasTrend,
  isTrendUp,
  trendValue,
}) => (
  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>
      {hasTrend && (
        <div
          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            isTrendUp
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-rose-50 text-rose-700 border border-rose-200/60"
          }`}
        >
          {isTrendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trendValue}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1.5">{title}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1.5 font-medium">{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState("all");

  const {
    data: adminData,
    isLoading: isAdminDataLoading,
    isFetching,
    error,
    refetch: refetchAdminData,
  } = useQuery({
    queryKey: ["adminStatistics", startDate, endDate],
    queryFn: async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await api.get("/foods/admin/statistics/", { params });
      return response.data;
    },
  });

  const { data: globalSettings } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const response = await api.get("/staff/settings/");
      return response.data;
    }
  });

  const dynamicPlatformFee = useMemo(() => {
    if (!globalSettings) return 10;
    const feeSetting = globalSettings.find(s => s.key === "PLATFORM_FEE_PERCENTAGE");
    return feeSetting ? Number(feeSetting.value) : 10;
  }, [globalSettings]);

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    const now = new Date();
    if (presetId === "all") {
      setStartDate("");
      setEndDate("");
    } else if (presetId === "30d") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(formatDateToIso(past));
      setEndDate(formatDateToIso(now));
    } else if (presetId === "90d") {
      const past = new Date();
      past.setDate(now.getDate() - 90);
      setStartDate(formatDateToIso(past));
      setEndDate(formatDateToIso(now));
    } else if (presetId === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(formatDateToIso(startOfYear));
      setEndDate(formatDateToIso(now));
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setActivePreset("custom");
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setActivePreset("custom");
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setActivePreset("all");
  };

  const stats = useMemo(() => {
    return {
      totalRevenue: Number(adminData?.total_revenue) || 0,
      lilyshopsShare: Number(adminData?.lilyshops_share) || 0,
      lilyshopsPercentage: dynamicPlatformFee,
      totalVendors: Number(adminData?.total_vendors) || 0,
      totalCustomers: Number(adminData?.total_customers) || 0,
      totalSubscriptions: Number(adminData?.total_subscriptions) || 0,
      monthlyGrowth: Number(adminData?.monthly_growth) || 0,
    };
  }, [adminData, dynamicPlatformFee]);

  const isLoading = isAdminDataLoading;

  const formattedRevenueData = useMemo(() => {
    return (adminData?.monthly_data || []).map((item) => {
      const revenue = Number(item.revenue) || 0;
      const lilyshops = Number(item.lilyshops) || 0;
      const vendorPayout = Math.max(0, revenue - lilyshops);
      return {
        ...item,
        name: item.month || item.name || "Month",
        month: item.month || item.name || "Month",
        revenue,
        lilyshops,
        vendorPayout,
      };
    });
  }, [adminData]);

  const subscriptionData = useMemo(() => {
    return adminData?.subscription_data || [];
  }, [adminData]);

  const totalSubscriptionsFromData = useMemo(() => {
    return subscriptionData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [subscriptionData]);

  const hasNoRevenueRecorded = useMemo(() => {
    return formattedRevenueData.every((item) => item.revenue === 0);
  }, [formattedRevenueData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse space-y-4">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="h-80 bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse" />
            <div className="h-80 bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-rose-200 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Failed to Load Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">{error.message || "An unexpected error occurred while fetching analytics."}</p>
          </div>
          <button
            onClick={() => refetchAdminData()}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="mb-2">
              <Link
                to="/lilyshop/workers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Staff Operations</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lilyshops Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Platform overview, financial volume, vendor payouts, and user metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchAdminData()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin text-emerald-600" : "text-slate-500"} />
              <span>{isFetching ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Range:</span>
            {PRESET_RANGES.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200/70 text-slate-700"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 p-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">End</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 p-0 cursor-pointer"
                />
              </div>
            </div>

            {(startDate || endDate || activePreset !== "all") && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 px-2.5 py-2 rounded-lg hover:bg-rose-50 transition-colors"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Gross transaction volume across all orders"
            icon={Wallet}
            iconBgClass="bg-emerald-50 border border-emerald-200/50"
            iconColorClass="text-[#4eb75e]"
            hasTrend={true}
            isTrendUp={stats.monthlyGrowth >= 0}
            trendValue={Math.abs(stats.monthlyGrowth)}
          />

          <StatCard
            title={`Lilyshops Share (${stats.lilyshopsPercentage}%)`}
            value={formatCurrency(stats.lilyshopsShare)}
            subtitle="Platform commission collected"
            icon={TrendingUp}
            iconBgClass="bg-teal-50 border border-teal-200/50"
            iconColorClass="text-teal-600"
            hasTrend={true}
            isTrendUp={stats.monthlyGrowth >= 0}
            trendValue={Math.abs(stats.monthlyGrowth)}
          />

          <StatCard
            title={`Vendor Payouts (${100 - stats.lilyshopsPercentage}%)`}
            value={formatCurrency(Math.max(0, stats.totalRevenue - stats.lilyshopsShare))}
            subtitle="Disbursed earnings to vendors"
            icon={DollarSign}
            iconBgClass="bg-amber-50 border border-amber-200/50"
            iconColorClass="text-amber-600"
            hasTrend={false}
          />

          <StatCard
            title="Active Subscriptions"
            value={stats.totalSubscriptions.toLocaleString()}
            subtitle="Recurring meal plan subscribers"
            icon={Calendar}
            iconBgClass="bg-orange-50 border border-orange-200/50"
            iconColorClass="text-orange-600"
            hasTrend={false}
          />

          <StatCard
            title="Registered Vendors"
            value={stats.totalVendors.toLocaleString()}
            subtitle="Approved food and product vendors"
            icon={Store}
            iconBgClass="bg-purple-50 border border-purple-200/50"
            iconColorClass="text-purple-600"
            hasTrend={false}
          />

          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            subtitle="Registered platform user accounts"
            icon={Users}
            iconBgClass="bg-blue-50 border border-blue-200/50"
            iconColorClass="text-blue-600"
            hasTrend={false}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Revenue Trend</h2>
                  <p className="text-slate-500 text-xs">Total volume vs Lilyshops fee over the past 6 months</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-xs bg-[#4eb75e]" />
                    <span>Total</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-xs bg-[#13ec49]" />
                    <span>Lilyshops</span>
                  </div>
                </div>
              </div>

              {hasNoRevenueRecorded && (
                <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <AlertCircle size={15} className="text-slate-400 shrink-0" />
                  <span>No non-zero transactions recorded for the displayed months yet.</span>
                </div>
              )}
            </div>

            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickFormatter={formatYAxisTick}
                  />
                  <Tooltip content={<CustomRevenueTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="revenue" fill="#4eb75e" radius={[6, 6, 0, 0]} name="Total Revenue" />
                  <Bar dataKey="lilyshops" fill="#13ec49" radius={[6, 6, 0, 0]} name="Lilyshops Share" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Subscription Distribution</h2>
              <p className="text-slate-500 text-xs mb-4">Breakdown of customer subscriptions by billing cycle</p>
            </div>

            {totalSubscriptionsFromData === 0 ? (
              <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Calendar size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Active Subscriptions</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Active recurring meal plans (Weekly, Bi-weekly, Monthly) will appear here once customers subscribe.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-900">{totalSubscriptionsFromData}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plans</span>
                  </div>
                </div>

                {/* Legend & Breakdown list */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  {subscriptionData.map((item, index) => {
                    const percentage = totalSubscriptionsFromData > 0
                      ? ((item.value / totalSubscriptionsFromData) * 100).toFixed(0)
                      : 0;
                    return (
                      <div key={index} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{item.value}</p>
                        <p className="text-[11px] font-medium text-slate-500">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Breakdown Table */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Revenue Breakdown</h2>
              <p className="text-slate-500 text-xs">Historical volume and vendor settlement breakdown</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Last {formattedRevenueData.length} Recorded Months
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Month</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  <th className="py-3.5 px-4 text-right">Lilyshops Share ({stats.lilyshopsPercentage}%)</th>
                  <th className="py-3.5 px-4 text-right">Vendor Payout ({100 - stats.lilyshopsPercentage}%)</th>
                  <th className="py-3.5 px-4 text-right">MoM Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {formattedRevenueData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm font-medium">
                      No monthly revenue records available.
                    </td>
                  </tr>
                ) : (
                  formattedRevenueData.map((item, index) => {
                    const prevRevenue = index > 0 ? formattedRevenueData[index - 1].revenue : 0;
                    const currentRevenue = item.revenue;
                    let growthText = "0%";
                    let isPositive = true;

                    if (index > 0 && prevRevenue > 0) {
                      const diff = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
                      growthText = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
                      isPositive = diff >= 0;
                    } else if (index > 0 && prevRevenue === 0 && currentRevenue > 0) {
                      growthText = "+100%";
                      isPositive = true;
                    }

                    return (
                      <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {item.name || item.month}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(item.lilyshops)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          {formatCurrency(item.vendorPayout)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                              index === 0
                                ? "text-slate-400 bg-slate-100"
                                : isPositive
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
                                : "text-rose-700 bg-rose-50 border border-rose-200/60"
                            }`}
                          >
                            {index === 0 ? "—" : growthText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
