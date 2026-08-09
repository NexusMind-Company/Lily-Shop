import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  Building2,
  CreditCard,
  Wallet,
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
  VendorPageLoader,
  VendorPageError,
} from "../../components/vendor/VendorErrorStates";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  fetchEarningsChart,
  fetchEarningsHistory,
  fetchEarningsSummary,
  fetchVendorWallet,
  initiateEarningsPayout,
} from "../../services/vendorDashboardApi";

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

const formatMoney = (amount) => `N${Number(amount || 0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg  ">
      <p className="mb-1 text-gray-500">{label}</p>
      <p className="font-bold text-lily">{formatMoney(payload[0].value)}</p>
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
    if (!amount || Number.isNaN(numericAmount) || numericAmount < 1000) {
      toast.error("The minimum amount that can be withdrawn is N1,000.");
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl ">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#111813] ">Withdraw Earnings</h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Available now: {formatMoney(availableBalance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 "
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative pt-2">
            <input
              type="number"
              min="1000"
              max={availableBalance}
              placeholder=" "
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="peer w-full rounded-xl border-2 border-gray-200 bg-white px-4 pb-2 pt-6 text-sm font-bold text-gray-900 transition-all focus:border-lily focus:outline-none"
            />
            <label className="absolute left-7 top-6 text-xs font-semibold text-gray-400 transition-all peer-focus:-translate-y-3 peer-focus:text-[10px] peer-focus:text-lily peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-gray-500 pointer-events-none">
              Amount to Withdraw (Min N1,000)
            </label>
            {amount &&
              Number(amount) >= 1000 &&
              Number(amount) <= availableBalance && (
                <p className="mt-1 text-xs text-lily font-medium">
                  You will receive {formatMoney(Number(amount))} in your account.
                </p>
              )}
          </div>

          <div className="space-y-3 rounded-2xl bg-gray-50 p-4 ">
            <div className="mb-2 flex items-center gap-2">
              <Building2 size={14} className="text-lily" />
              <p className="text-xs font-bold text-[#111813] ">Bank Details</p>
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
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:border-lily focus:outline-none transition-all"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5  ">
            <p className="text-xs text-orange-700 ">
              Transfers are processed within 1 to 3 business days. Make sure
              your account details are correct.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lily py-3.5 text-sm font-bold text-white transition-colors hover:bg-darklily disabled:opacity-60"
          >
            <CreditCard size={15} />
            {isPending ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorEarningsPage = () => {
  const [period, setPeriod] = useState("weekly");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["earningsSummary"],
    queryFn: fetchEarningsSummary,
  });

  const { data: wallet, isError: walletError } = useQuery({
    queryKey: ["vendorWallet"],
    queryFn: fetchVendorWallet,
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
    mutationFn: (payload) => initiateEarningsPayout(payload),
    onSuccess: () => {
      setShowWithdraw(false);
      toast.success(
        "Withdrawal initiated. Funds should arrive within 1 to 3 business days.",
      );
      queryClient.invalidateQueries({ queryKey: ["earningsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["vendorWallet"] });
      queryClient.invalidateQueries({ queryKey: ["earningsHistory"] });
    },
    onError: (mutationError) => {
      const status = mutationError?.response?.status;
      if (status === 403) {
        toast.error(
          "Only food vendors can withdraw earnings. Please complete your vendor setup.",
        );
      } else {
        toast.error(getErrorMessage(mutationError));
      }
    },
  });

  if (isLoading) {
    return (
      <VendorLayout title="Earnings">
        <VendorPageLoader />
      </VendorLayout>
    );
  }

  if (isError) {
    return (
      <VendorLayout title="Earnings">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );
  }

  const summaryData = summary ?? {};
  const historyData = history ?? {};
  const chartData = (chart?.labels ?? []).map((label, index) => ({
    name: label,
    value: chart?.amounts?.[index] ?? 0,
  }));

  const highestValue = Math.max(...chartData.map((item) => item.value), 0);
  const periodEarnings = chartData.reduce((sum, entry) => sum + entry.value, 0);
  const availableBalance = Number(wallet?.balance_naira ?? 0);
  const totalEarnings = Number(summaryData.total_earnings ?? 0);
  const platformFee = Number(summaryData.platform_fee ?? 0);
  const netEarnings = Number(summaryData.net_earnings ?? 0);

  return (
    <VendorLayout title="Earnings">
      <div className="mb-4 rounded-3xl bg-white border border-gray-100 p-6 text-gray-900 shadow-xl transition-all duration-300">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">Total Earnings (All Time)</p>
        <p className="mb-6 text-4xl font-extrabold text-black">{formatMoney(totalEarnings)}</p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Platform Fee</p>
            <p className="text-sm font-bold text-orange-500">
              -{formatMoney(platformFee)}
            </p>
          </div>
          <div className="bg-lily/5 p-4 rounded-2xl border border-lily/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-lily/70 mb-1">Net Earnings</p>
            <p className="text-sm font-bold text-lily">
              {formatMoney(netEarnings)}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl border border-black shadow-lg">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Wallet size={12} />
              Available Now
            </p>
            <p className="text-sm font-bold text-white">
              {formatMoney(availableBalance)}
            </p>
          </div>
        </div>

        {walletError && (
          <p className="mb-3 text-xs text-orange-300">
            Wallet balance could not be refreshed. Withdrawal availability may
            be temporarily outdated.
          </p>
        )}

        <button
          onClick={() => setShowWithdraw(true)}
          disabled={availableBalance <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lily py-3 text-sm font-bold text-white transition-colors hover:bg-darklily disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDownToLine size={15} />
          Withdraw to Bank Account
        </button>
      </div>

      <div className="mb-4 flex gap-1.5">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
              period === key
                ? "bg-lily text-white shadow-sm"
                : "border border-gray-100 bg-white text-gray-500  "
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm  ">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#111813] ">
            {PERIODS.find((entry) => entry.key === period)?.label} Earnings
          </h3>
          <p className="text-lg font-bold text-lily">
            {formatMoney(periodEarnings)}
          </p>
        </div>

        {chartErr ? (
          <p className="py-8 text-center text-xs text-gray-400">
            Chart data unavailable
          </p>
        ) : chartData.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            No earnings data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f0fdf4" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={entry.value === highestValue ? "#4eb75e" : "#d1fae5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm  ">
        <div className="border-b border-gray-50 px-4 py-3 ">
          <h3 className="text-sm font-bold text-[#111813] ">Payment History</h3>
        </div>

        {histErr ? (
          <p className="py-6 text-center text-xs text-gray-400">
            Payment history unavailable
          </p>
        ) : (historyData?.results ?? []).length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            No payment history yet
          </p>
        ) : (
          <div className="divide-y divide-gray-50 ">
            {(historyData?.results ?? []).map((payment) => (
              <div key={payment.id} className="px-4 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lily/10 text-sm font-bold text-lily">
                    {payment.customer_name?.charAt(0) ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111813] ">
                      {payment.customer_name}
                    </p>
                    <p className="text-xs text-gray-600 ">
                      {payment.subscription_plan}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-lily">
                      {formatMoney(payment.amount - (payment.amount * 0.10))}
                    </p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        STATUS_COLORS[payment.status] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>

                {/* Commission Breakdown */}
                <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2 text-xs">
                  <div>
                    <span className="block text-gray-500">Gross Sale</span>
                    <span className="font-semibold text-gray-700">{formatMoney(payment.amount)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Platform Fee (10%)</span>
                    <span className="font-semibold text-red-500">-{formatMoney(payment.amount * 0.10)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Net Earnings</span>
                    <span className="font-semibold text-lily">{formatMoney(payment.amount - (payment.amount * 0.10))}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {payment.customer_phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-700 ">
                        {payment.customer_phone}
                      </span>
                    </div>
                  )}
                  {payment.customer_email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="truncate text-gray-700 ">
                        {payment.customer_email}
                      </span>
                    </div>
                  )}
                  {payment.subscription_status && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`font-medium ${
                          payment.subscription_status === "active"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {payment.subscription_status}
                      </span>
                    </div>
                  )}
                  {payment.subscribed_at && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Subscribed:</span>
                      <span className="text-gray-700 ">
                        {new Date(payment.subscribed_at).toLocaleDateString(
                          "en-NG",
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {payment.delivery_address &&
                  Object.keys(payment.delivery_address).length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-2 ">
                      <p className="mb-1 text-xs text-gray-500">
                        Delivery Address:
                      </p>
                      <p className="text-xs text-gray-700 ">
                        {payment.delivery_address.address_line1 && (
                          <span>{payment.delivery_address.address_line1}</span>
                        )}
                        {payment.delivery_address.city && (
                          <span>, {payment.delivery_address.city}</span>
                        )}
                        {payment.delivery_address.state && (
                          <span>, {payment.delivery_address.state}</span>
                        )}
                      </p>
                    </div>
                  )}

                {payment.preferences &&
                  Object.keys(payment.preferences).length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-2 ">
                      <p className="mb-1 text-xs text-gray-500">Preferences:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(payment.preferences).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600  "
                            >
                              {key}: {String(value)}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && (
        <WithdrawModal
          availableBalance={availableBalance}
          isPending={payoutPending}
          onClose={() => setShowWithdraw(false)}
          onConfirm={(payload) => payout(payload)}
        />
      )}
    </VendorLayout>
  );
};

export default VendorEarningsPage;
