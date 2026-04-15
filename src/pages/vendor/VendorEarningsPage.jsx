import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowDownToLine, X, Building2, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchEarningsSummary, fetchEarningsHistory, fetchEarningsChart, initiateEarningsPayout } from "../../services/vendorDashboardApi";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-600",
  failed: "bg-red-100 text-red-600",
};
const PERIODS = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

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

// ── Withdraw Modal ──────────────────────────────────────────────
const WithdrawModal = ({ netPayout, onClose, onConfirm, isPending }) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!bankName.trim()) { toast.error("Enter your bank name."); return; }
    if (!accountNumber.trim() || accountNumber.length < 10) { toast.error("Enter a valid 10-digit account number."); return; }
    if (!accountName.trim()) { toast.error("Enter account name."); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount."); return; }
    if (amt > netPayout) { toast.error(`You can only withdraw up to ₦${netPayout.toLocaleString()}`); return; }
    onConfirm({ bank_name: bankName, account_number: accountNumber, account_name: accountName, amount: amt });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[#111813] dark:text-white">Withdraw Earnings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Available: ₦{netPayout.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Amount to Withdraw (₦)</label>
            <input
              type="number" min="0" max={netPayout}
              placeholder={`Max ₦${netPayout.toLocaleString()}`}
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e]"
            />
            {amount && parseFloat(amount) > 0 && parseFloat(amount) <= netPayout && (
              <p className="text-xs text-[#4eb75e] mt-1">
                You'll receive ₦{parseFloat(amount).toLocaleString()} in your account
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={14} className="text-[#4eb75e]" />
              <p className="text-xs font-bold text-[#111813] dark:text-white">Bank Details</p>
            </div>
            {[
              { label: "Bank Name", key: "bankName", val: bankName, set: setBankName, placeholder: "e.g. GTBank, First Bank" },
              { label: "Account Number", key: "accountNumber", val: accountNumber, set: setAccountNumber, placeholder: "10-digit account number" },
              { label: "Account Name", key: "accountName", val: accountName, set: setAccountName, placeholder: "Name on the account" },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <label className="text-[10px] font-semibold text-gray-400 mb-1 block">{label}</label>
                <input
                  type="text" placeholder={placeholder} value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e]"
                />
              </div>
            ))}
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl px-4 py-2.5">
            <p className="text-xs text-orange-700 dark:text-orange-400">
              ⚠️ Transfers are processed within 1–3 business days. Make sure your account details are correct.
            </p>
          </div>

          <button
            onClick={handleSubmit} disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors"
          >
            <CreditCard size={15} />
            {isPending ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const VendorEarningsPage = () => {
  const [period, setPeriod] = useState("weekly");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: summary, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["earningsSummary"],
    queryFn: fetchEarningsSummary,
  });

  const { data: history, isError: histErr } = useQuery({
    queryKey: ["earningsHistory", period],
    queryFn: () => fetchEarningsHistory({ period }),
  });

  const { data: chart, isError: chartErr } = useQuery({
    queryKey: ["earningsChart", period],
    queryFn: () => fetchEarningsChart(period),
  });

  const { mutate: payout, isPending: payoutPending } = useMutation({
    mutationFn: (data) => initiateEarningsPayout(data),
    onSuccess: () => {
      setShowWithdraw(false);
      toast.success("Withdrawal initiated! You'll receive funds within 1–3 business days.");
      refetch();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <VendorLayout title="Earnings"><VendorPageLoader /></VendorLayout>;
  if (isError) return <VendorLayout title="Earnings"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  const s = summary ?? {};
  const h = history ?? {};
  const c = chart ?? {};
  const chartData = (c?.labels ?? []).map((label, i) => ({ name: label, value: c.amounts?.[i] ?? 0 }));
  const periodEarnings = chartData.reduce((sum, d) => sum + d.value, 0);
  const netPayout = s.net_earnings ?? 0;

  return (
    <VendorLayout title="Earnings">

      {/* Total Earnings Card */}
      <div className="bg-[#111813] dark:bg-gray-900 rounded-2xl p-5 text-white mb-4">
        <p className="text-gray-400 text-xs mb-1">Total Earnings (All Time)</p>
        <p className="text-3xl font-bold mb-3">₦{(s.total_earnings ?? 0).toLocaleString()}</p>
        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-[10px]">Platform Fee (10%)</p>
            <p className="text-orange-400 text-sm font-bold">−₦{(s.platform_fee ?? 0).toLocaleString()}</p>
          </div>
          <div className="w-px bg-gray-700" />
          <div>
            <p className="text-gray-400 text-[10px]">Net Payout</p>
            <p className="text-[#4eb75e] text-sm font-bold">₦{netPayout.toLocaleString()}</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={() => setShowWithdraw(true)}
          disabled={netPayout <= 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDownToLine size={15} />
          Withdraw to Bank Account
        </button>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1.5 mb-4">
        {PERIODS.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${period === key ? "bg-[#4eb75e] text-white shadow-sm" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">
            {PERIODS.find((p) => p.key === period)?.label} Earnings
          </h3>
          <p className="text-lg font-bold text-[#4eb75e]">₦{periodEarnings.toLocaleString()}</p>
        </div>
        {chartErr ? (
          <p className="text-xs text-gray-400 text-center py-8">Chart data unavailable</p>
        ) : chartData.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No earnings data yet</p>
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

      {/* Payment History */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
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
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && (
        <WithdrawModal
          netPayout={netPayout}
          isPending={payoutPending}
          onClose={() => setShowWithdraw(false)}
          onConfirm={(data) => payout(data)}
        />
      )}
    </VendorLayout>
  );
};

export default VendorEarningsPage;