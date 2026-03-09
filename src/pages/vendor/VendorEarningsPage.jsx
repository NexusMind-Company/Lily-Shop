// VendorEarningsPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchEarningsSummary, fetchEarningsHistory, fetchEarningsChart } from "../../services/vendorDashboardApi";

const mockSummary = { total_earnings: 284500, platform_fee: 28450, net_payout: 256050, daily_earnings: 12300, weekly_earnings: 45200, monthly_earnings: 180500 };
const mockHistory = { results: [
  { id: "P001", customer_name: "Amaka Obi", amount: 2500, platform_fee: 250, net: 2250, payment_date: "2024-01-15", subscription_plan: "Weekly – Medium", status: "paid" },
  { id: "P002", customer_name: "Chukwudi Eze", amount: 5000, platform_fee: 500, net: 4500, payment_date: "2024-01-14", subscription_plan: "Monthly – Large", status: "paid" },
  { id: "P003", customer_name: "Fatima Bello", amount: 1500, platform_fee: 150, net: 1350, payment_date: "2024-01-13", subscription_plan: "Weekly – Small", status: "pending" },
]};
const mockChart = { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], earnings: [8500,12000,9500,15000,11000,18000,13200] };
const STATUS_COLORS = { paid: "bg-green-100 text-green-700", pending: "bg-orange-100 text-orange-600", failed: "bg-red-100 text-red-600" };
const PERIODS = [{ key: "daily", label: "Today" }, { key: "weekly", label: "This Week" }, { key: "monthly", label: "This Month" }];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl px-3 py-2 text-xs border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-bold text-[#4eb75e]">₦{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const VendorEarningsPage = () => {
  const [period, setPeriod] = useState("weekly");

  const { data: summary, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["earningsSummary"],
    queryFn: fetchEarningsSummary,
    placeholderData: mockSummary,
    retry: 2,
  });
  const { data: history, isError: histErr } = useQuery({
    queryKey: ["earningsHistory", period],
    queryFn: () => fetchEarningsHistory({ period }),
    placeholderData: mockHistory,
    retry: 1,
  });
  const { data: chart, isError: chartErr } = useQuery({
    queryKey: ["earningsChart", period],
    queryFn: () => fetchEarningsChart(period),
    placeholderData: mockChart,
    retry: 1,
  });

  if (isLoading && !summary) return <VendorLayout title="Earnings"><VendorPageLoader /></VendorLayout>;
  if (isError && !summary) return <VendorLayout title="Earnings"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  const s = summary ?? mockSummary;
  const h = history ?? mockHistory;
  const c = chart ?? mockChart;
  const chartData = (c?.labels ?? []).map((label, i) => ({ name: label, value: c.earnings?.[i] ?? 0 }));
  const periodEarnings = { daily: s.daily_earnings, weekly: s.weekly_earnings, monthly: s.monthly_earnings }[period] ?? 0;

  return (
    <VendorLayout title="Earnings">
      <div className="bg-[#111813] dark:bg-gray-900 rounded-2xl p-5 text-white">
        <p className="text-gray-400 text-xs mb-1">Total Earnings (All Time)</p>
        <p className="text-3xl font-bold mb-3">₦{(s.total_earnings ?? 0).toLocaleString()}</p>
        <div className="flex gap-4">
          <div>
            <p className="text-gray-400 text-[10px]">Platform Fee (10%)</p>
            <p className="text-orange-400 text-sm font-bold">−₦{(s.platform_fee ?? 0).toLocaleString()}</p>
          </div>
          <div className="w-px bg-gray-700" />
          <div>
            <p className="text-gray-400 text-[10px]">Net Payout</p>
            <p className="text-[#4eb75e] text-sm font-bold">₦{(s.net_payout ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {PERIODS.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${period === key ? "bg-[#4eb75e] text-white shadow-sm" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">{PERIODS.find((p) => p.key === period)?.label} Earnings</h3>
          <p className="text-lg font-bold text-[#4eb75e]">₦{periodEarnings.toLocaleString()}</p>
        </div>
        {chartErr ? (
          <p className="text-xs text-gray-400 text-center py-8">Chart data unavailable</p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdf4" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.value === Math.max(...chartData.map((d) => d.value)) ? "#4eb75e" : "#d1fae5"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">Payment History</h3>
        </div>
        {histErr ? (
          <p className="text-xs text-gray-400 text-center py-6">Payment history unavailable</p>
        ) : (h?.results ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No payment history yet</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {(h?.results ?? []).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-[#4eb75e]/10 flex items-center justify-center text-xs font-bold text-[#4eb75e] flex-shrink-0">
                  {p.customer_name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111813] dark:text-white truncate">{p.customer_name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.subscription_plan}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#4eb75e]">₦{(p.net ?? 0).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorEarningsPage;