import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageError,
  VendorPageLoader,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  fetchEarningsChart,
  fetchEarningsHistory,
  fetchEarningsSummary,
  fetchVendorWallet,
  fetchVendorWithdrawals,
  initiateEarningsPayout,
} from "../../services/vendorDashboardApi";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-600",
  failed: "bg-red-100 text-red-600",
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-600",
};

const WITHDRAWAL_STATUS_ICONS = {
  pending: <Clock size={14} className="text-orange-500" />,
  processing: <Clock size={14} className="text-blue-500" />,
  completed: <CheckCircle2 size={14} className="text-green-500" />,
  failed: <XCircle size={14} className="text-red-500" />,
};

const PERIODS = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

const formatMoney = (amount) => `N${Number(amount || 0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg  ">
      <p className="mb-1 text-gray-500">{label}</p>
      <p className="font-bold text-[#4eb75e]">
        {formatMoney(payload[0].value)}
      </p>
    </div>
  );
};

const WithdrawModal = ({ availableBalance, onClose, onConfirm, isPending }) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!bankName.trim()) {
      toast.error("Enter your bank name.");
      return;
    }
    if (!accountNumber.trim() || accountNumber.trim().length < 10) {
      toast.error("Enter a valid 10-digit account number.");
      return;
    }
    if (!accountName.trim()) {
      toast.error("Enter account name.");
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (numericAmount > availableBalance) {
      toast.error(
        `You can only withdraw up to ${formatMoney(availableBalance)}.`,
      );
      return;
    }

    onConfirm({
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
      amount_kobo: Math.round(numericAmount * 100),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-2 ring-[#4eb75e]/20">
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#111813]">Withdraw Earnings</h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Available now: {formatMoney(availableBalance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">
              Amount to Withdraw
            </label>
            <input
              type="number"
              min="0"
              max={availableBalance}
              placeholder={`Max ${formatMoney(availableBalance)}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3.5 text-base text-[#111813] focus:border-[#4eb75e] focus:outline-none"
            />
            {amount &&
              Number(amount) > 0 &&
              Number(amount) <= availableBalance && (
                <p className="mt-2 text-sm font-medium text-[#4eb75e] flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  You will receive {formatMoney(Number(amount))} in your account.
                </p>
              )}
          </div>

          <div className="space-y-3 rounded-2xl bg-gray-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-[#4eb75e]" />
              <p className="text-sm font-bold text-[#111813]">Bank Details</p>
            </div>

            {[
              {
                label: "Bank Name",
                value: bankName,
                setter: setBankName,
                placeholder: "e.g. GTBank, First Bank",
              },
              {
                label: "Account Number",
                value: accountNumber,
                setter: setAccountNumber,
                placeholder: "10-digit account number",
              },
              {
                label: "Account Name",
                value: accountName,
                setter: setAccountName,
                placeholder: "Name on the account",
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-[#111813] focus:border-[#4eb75e] focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-orange-100 bg-orange-50 px-4 py-3 flex gap-3">
            <Clock size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700">
              Transfers are processed within 1 to 3 business days. Make sure your account details are correct.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4eb75e] py-4 text-base font-bold text-white transition-all hover:bg-[#3da64d] hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Confirm Withdrawal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorEarningsPage = () => {
  const queryClient = useQueryClient();
  const [activePeriod, setActivePeriod] = useState("monthly");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["vendorWallet"],
    queryFn: fetchVendorWallet,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["earningsChart", activePeriod],
    queryFn: () => fetchEarningsChart(activePeriod),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["earningsSummary"],
    queryFn: fetchEarningsSummary,
  });

  const { data: withdrawalHistory, isError: withdrawalErr } = useQuery({
    queryKey: ["vendorWithdrawals"],
    queryFn: fetchVendorWithdrawals,
  });

  const { mutate: payout, isPending: payoutPending } = useMutation({
    mutationFn: (payload) => initiateEarningsPayout(payload),
    onSuccess: () => {
      toast.success("Withdrawal request submitted successfully!");
      setShowWithdraw(false);
      queryClient.invalidateQueries({ queryKey: ["vendorWallet"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const availableBalance = Number(wallet?.available_balance ?? 0);
  const pendingBalance = Number(wallet?.pending_balance ?? 0);
  const totalWithdrawn = Number(wallet?.total_withdrawn ?? 0);

  const isLoading = walletLoading || chartLoading || summaryLoading;

  if (isLoading) return <VendorPageLoader />;
  if (walletLoading === false && !wallet) return <VendorPageError />;

  return (
    <VendorLayout title="Earnings">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available", value: formatMoney(availableBalance), color: "text-[#4eb75e]" },
            { label: "Pending", value: formatMoney(pendingBalance), color: "text-orange-500" },
            { label: "Withdrawn", value: formatMoney(totalWithdrawn), color: "text-gray-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className={`mt-1 text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {summary?.recent_orders !== undefined && (
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Earnings</p>
                <p className="mt-0.5 text-xl font-bold text-[#111813]">{formatMoney(summary.total_earnings)}</p>
              </div>
              <div className="flex gap-1.5">
                {PERIODS.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setActivePeriod(period.key)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${
                      activePeriod === period.key
                        ? "bg-[#4eb75e] text-white"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4eb75e] border-t-transparent" />
              </div>
            ) : (chartData?.data ?? []).length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData?.data ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                    {(chartData?.data ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (chartData?.data ?? []).length - 1 ? "#4eb75e" : "#86efac"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center">
                <p className="text-xs text-gray-400">No earnings data for this period</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setShowWithdraw(true)}
          disabled={availableBalance <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4eb75e] py-4 text-sm font-bold text-white transition-colors hover:bg-[#3da64d] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CreditCard size={16} />
          Withdraw Earnings
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
            <h3 className="text-sm font-bold text-[#111813]">Withdrawal History</h3>
            <span className="text-xs text-gray-400">
              {(withdrawalHistory?.results ?? []).length} request(s)
            </span>
          </div>

          {withdrawalErr ? (
            <p className="py-6 text-center text-xs text-gray-400">
              Withdrawal history unavailable
            </p>
          ) : (withdrawalHistory?.results ?? []).length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-1 text-xs text-gray-400">No withdrawals yet</p>
              <p className="text-xs text-gray-300">Withdrawals will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(withdrawalHistory?.results ?? []).map((withdrawal) => (
                <div key={withdrawal.id} className="px-4 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          withdrawal.status === "completed"
                            ? "bg-green-100"
                            : withdrawal.status === "pending" || withdrawal.status === "processing"
                            ? "bg-orange-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Building2
                          size={16}
                          className={
                            withdrawal.status === "completed"
                              ? "text-green-600"
                              : withdrawal.status === "pending" || withdrawal.status === "processing"
                              ? "text-orange-600"
                              : "text-red-600"
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111813]">
                          {formatMoney(withdrawal.amount_naira)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {withdrawal.bank_name} •••• {withdrawal.account_number?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {WITHDRAWAL_STATUS_ICONS[withdrawal.status] || (
                        <Clock size={14} className="text-gray-400" />
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          STATUS_COLORS[withdrawal.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(withdrawal.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" at "}
                      {new Date(withdrawal.created_at).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {withdrawal.processed_at && (
                      <span>
                        Processed:{" "}
                        {new Date(withdrawal.processed_at).toLocaleDateString("en-NG")}
                      </span>
                    )}
                  </div>

                  {withdrawal.failure_reason && (
                    <div className="mt-2 rounded-lg bg-red-50 px-3 py-2">
                      <p className="text-xs text-red-600">{withdrawal.failure_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal
          availableBalance={availableBalance}
          isPending={payoutPending}
          onClose={() => setShowWithdraw(false)}
          onConfirm={(payload) => {
            payout(payload);
            queryClient.invalidateQueries({ queryKey: ["vendorWithdrawals"] });
          }}
        />
      )}
    </VendorLayout>
  );
};

export default VendorEarningsPage;
