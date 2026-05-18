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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Amount to Withdraw
            </label>
            <input
              type="number"
              min="0"
              max={availableBalance}
              placeholder={`Max ${formatMoney(availableBalance)}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-[#111813] focus:border-[#4eb75e] focus:outline-none   "
            />
            {amount &&
              Number(amount) > 0 &&
              Number(amount) <= availableBalance && (
                <p className="mt-1 text-xs text-[#4eb75e]">
                  You will receive {formatMoney(Number(amount))} in your
                  account.
                </p>
              )}
          </div>

          <div className="space-y-3 rounded-2xl bg-gray-50 p-4 ">
            <div className="mb-2 flex items-center gap-2">
              <Building2 size={14} className="text-[#4eb75e]" />
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
                <label className="mb-1 block text-[10px] font-semibold text-gray-400">
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm text-[#111813] focus:border-[#4eb75e] focus:outline-none   "
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4eb75e] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#3da64d] disabled:opacity-60"
          >
            <CreditCard size={15} />
            {isPending ? "Processing..." : "Confirm Withdrawal"}
          </button>
</div>
      </div>

      {/* Withdrawal History */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-4 py-3 flex items-center justify-between">
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
            <p className="text-xs text-gray-400 mb-1">No withdrawals yet</p>
            <p className="text-xs text-gray-300">Withdrawals will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(withdrawalHistory?.results ?? []).map((withdrawal) => (
              <div key={withdrawal.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      withdrawal.status === "completed" ? "bg-green-100" :
                      withdrawal.status === "pending" || withdrawal.status === "processing" ? "bg-orange-100" :
                      "bg-red-100"
                    }`}>
                      <Building2 size={16} className={
                        withdrawal.status === "completed" ? "text-green-600" :
                        withdrawal.status === "pending" || withdrawal.status === "processing" ? "text-orange-600" :
                        "text-red-600"
                      } />
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
                    {WITHDRAWAL_STATUS_ICONS[withdrawal.status] || <Clock size={14} className="text-gray-400" />}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                      STATUS_COLORS[withdrawal.status] || "bg-gray-100 text-gray-600"
                    }`}>
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
                      Processed: {new Date(withdrawal.processed_at).toLocaleDateString("en-NG")}
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
