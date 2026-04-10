import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChefHat,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchFoodVendor, fetchMealPlan, fetchWallet } from "../services/api";

const formatPrice = (price) =>
  Number(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const SubscriptionPaymentPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { state } = useLocation();

  const planFromState = state?.plan;
  const vendorFromState = state?.vendor;
  const paymentError = state?.error;

  useEffect(() => {
    if (!planId) {
      navigate(-1);
    }
  }, [planId, navigate]);

  const { data: fetchedPlan, isLoading: isPlanLoading } = useQuery({
    queryKey: ["subscriptionPlan", planId],
    queryFn: () => fetchMealPlan(planId),
    enabled: Boolean(planId && !planFromState),
    retry: 1,
  });

  const plan = planFromState || fetchedPlan;

  const { data: fetchedVendor } = useQuery({
    queryKey: ["foodVendor", plan?.vendor],
    queryFn: () => fetchFoodVendor(plan.vendor),
    enabled: Boolean(plan?.vendor && !vendorFromState),
    retry: 1,
  });

  const vendor = vendorFromState || fetchedVendor;

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWallet,
  });

  const planPrice = parseFloat(plan?.price || 0);
  const walletBalance = parseFloat(wallet?.balance_naira || 0);
  const hasEnoughBalance = walletBalance >= planPrice;
  const platformFee = planPrice * 0.1;
  const vendorReceives = planPrice * 0.9;

  const handlePayWithWallet = () => {
    navigate("/subscription/processing", {
      state: {
        planId,
        plan,
        vendor,
      },
    });
  };

  const handleTopUp = () => {
    navigate("/wallet/topup");
  };

  if (isPlanLoading && !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f6]">
        <p className="text-sm text-gray-500">Loading payment details...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f6] px-6 text-center">
        <div>
          <p className="text-base font-semibold text-[#111813]">
            Subscription plan not found.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please go back and choose a plan again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-[#13ec49] px-6 py-3 font-bold text-[#111813]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-[#f6f8f6]">
      <div className="relative bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-[#111813]">Confirm Payment</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-32">
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                size={16}
                className="mt-0.5 flex-shrink-0 text-red-500"
              />
              <p className="text-sm text-red-600">{paymentError}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13ec49]/10">
              <ChefHat size={22} className="text-[#13ec49]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscribing to</p>
              <p className="text-base font-bold text-[#111813]">
                {vendor?.name || "Vendor"}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Plan</span>
              <span className="text-sm font-semibold text-[#111813]">
                {plan.plan_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={14} /> Frequency
              </span>
              <span className="text-sm font-semibold capitalize text-[#111813]">
                {plan.frequency || "Weekly"}
              </span>
            </div>
            {plan.meals_per_cycle ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Meals per cycle</span>
                <span className="text-sm font-semibold text-[#111813]">
                  {plan.meals_per_cycle}
                </span>
              </div>
            ) : null}
            {plan.trial_days > 0 ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Zap size={14} className="text-yellow-500" /> Trial period
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {plan.trial_days} days free
                </span>
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-4 shadow-sm"
        >
          <p className="mb-3 font-semibold text-[#111813]">Price Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subscription price</span>
              <span className="font-semibold text-[#111813]">
                ₦{formatPrice(planPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Platform fee (10%)</span>
              <span className="text-xs text-gray-400">
                ₦{formatPrice(platformFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Vendor receives (90%)
              </span>
              <span className="text-xs text-gray-400">
                ₦{formatPrice(vendorReceives)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-[#111813]">You pay</span>
              <span className="text-lg font-bold text-[#13ec49]">
                ₦{formatPrice(planPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-4 shadow-sm ${
            hasEnoughBalance ? "bg-white" : "border border-red-100 bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  hasEnoughBalance ? "bg-[#13ec49]/10" : "bg-red-100"
                }`}
              >
                <Wallet
                  size={20}
                  className={
                    hasEnoughBalance ? "text-[#13ec49]" : "text-red-500"
                  }
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Lily Wallet Balance</p>
                {walletLoading ? (
                  <div className="mt-1 h-5 w-20 animate-pulse rounded bg-gray-100" />
                ) : (
                  <p className="font-bold text-[#111813]">
                    ₦{formatPrice(walletBalance)}
                  </p>
                )}
              </div>
            </div>
            {!walletLoading ? (
              hasEnoughBalance ? (
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                  <CheckCircle size={12} />
                  Sufficient
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-500">
                  <AlertCircle size={12} />
                  Insufficient
                </div>
              )
            ) : null}
          </div>

          {!walletLoading && !hasEnoughBalance ? (
            <div className="mt-3 rounded-xl bg-red-100 p-3">
              <p className="text-xs text-red-600">
                You need{" "}
                <strong>₦{formatPrice(planPrice - walletBalance)}</strong> more
                to subscribe to this plan. Top up your wallet to continue.
              </p>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-2 rounded-2xl bg-blue-50 p-4"
        >
          <AlertCircle
            size={16}
            className="mt-0.5 flex-shrink-0 text-blue-400"
          />
          <p className="text-xs leading-relaxed text-blue-600">
            Food subscriptions are paid using your Lily Wallet balance. The
            amount will be deducted immediately upon confirmation.
          </p>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-xl -translate-x-1/2 border-t border-gray-100 bg-white p-4">
        {hasEnoughBalance ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePayWithWallet}
            disabled={walletLoading}
            className="w-full rounded-2xl bg-[#13ec49] py-4 text-base font-bold text-[#111813] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {walletLoading
              ? "Checking balance..."
              : `Pay ₦${formatPrice(planPrice)} with Wallet`}
          </motion.button>
        ) : (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleTopUp}
              className="w-full rounded-2xl bg-[#13ec49] py-4 text-base font-bold text-[#111813] transition-all active:scale-95"
            >
              Top Up Wallet
            </motion.button>
            <button
              onClick={() => navigate(-1)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-500"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPaymentPage;
