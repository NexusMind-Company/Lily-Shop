import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Wallet,
  AlertCircle,
  CheckCircle,
  ChefHat,
  Calendar,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { api, fetchWallet, createSubscriptionWithPaystack } from "../services/api";
import {
  resolveSubscriptionFlowState,
  saveSubscriptionFlowState,
} from "../utils/subscriptionFlow";
import { formatPhoneForAPI } from "../utils/formatters";

const formatPrice = (price) =>
  Number(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const SubscriptionPaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const flowState = resolveSubscriptionFlowState(state);

  const plan = flowState?.plan;
  const vendor = flowState?.vendor;
  const totalPrice = flowState?.totalPrice || 0;
  const selectedDays = flowState?.selectedDays || [];
  const quantity = flowState?.quantity || 1;
  const addExtra = flowState?.addExtra || false;
  const extraPrice = flowState?.extraPrice || 0;
  const deliveryType = flowState?.deliveryType;
  const preferredTime = flowState?.preferredTime;
  const address = flowState?.address;
  const phone = flowState?.phone;
  const collectionCode = flowState?.collectionCode;

  // If no state was passed (e.g. direct URL navigation), go back
  useEffect(() => {
    if (!plan) {
      navigate("/subscriptions", { replace: true });
      return;
    }

    // If user is already subscribed (backend usually handles this but frontend check is better)
    if (plan.is_subscribed) {
      toast.error("You are already subscribed to this plan.");
      navigate("/subscriptions", { replace: true });
      return;
    }

    saveSubscriptionFlowState(flowState);
  }, [plan, navigate, flowState]);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWallet,
  });
  const planPrice = parseFloat(totalPrice || 0);
  const walletBalance = parseFloat(wallet?.balance_naira || 0);
  const hasEnoughBalance = walletBalance >= planPrice;

  const platformFee = planPrice * 0.1;
  const vendorReceives = planPrice * 0.9;

  const handlePayWithWallet = () => {
    const processingState = {
      ...flowState,
      planId: plan?.id,
      plan,
      vendor,
      totalPrice,
      selectedDays,
      quantity,
      addExtra,
      extraPrice,
      deliveryType,
      preferredTime,
      address,
      phone,
      collectionCode,
    };

    saveSubscriptionFlowState(processingState);
    navigate("/subscription/processing", {
      state: processingState,
    });
  };

  const handleTopUp = () => {
    saveSubscriptionFlowState(flowState);
    navigate("/wallet/topup");
  };

  const handleDirectPayment = async () => {
    try {
      if (!plan?.id) {
        toast.error("Plan information is missing. Please select a plan again.");
        navigate("/subscriptions");
        return;
      }

      if (!phone) {
        toast.error(
          "Phone number is required. Please go back and add your phone number.",
        );
        return;
      }

      toast.loading("Initiating secure payment...");

      const formattedPhone = formatPhoneForAPI(phone) || phone;

      const paymentData = {
        phone: formattedPhone,
      };

      if (deliveryType) paymentData.delivery_type = deliveryType;
      if (address) paymentData.address = address;
      if (preferredTime) paymentData.preferred_time = preferredTime;
      if (selectedDays && selectedDays.length > 0)
        paymentData.selected_days = selectedDays;
      if (quantity) paymentData.quantity = quantity;
      if (flowState?.dietaryPreferences)
        paymentData.dietary_preferences = flowState.dietaryPreferences;
      if (flowState?.allergies) paymentData.allergies = flowState.allergies;
      if (flowState?.portionSize)
        paymentData.portion_size = flowState.portionSize;
      if (flowState?.specialInstructions)
        paymentData.special_instructions = flowState.specialInstructions;
      if (collectionCode) paymentData.collection_code = collectionCode;

      console.log("Sending subscription data:", paymentData);

      const response = await createSubscriptionWithPaystack(
        plan.id,
        paymentData,
      );

      console.log("Subscription response:", response);

      if (!response) {
        toast.dismiss();
        toast.error("Failed to initialize payment. Please try again.");
        return;
      }

      if (response.authorization_url) {
        const processingState = {
          planId: plan?.id,
          plan,
          vendor,
          totalPrice,
          selectedDays,
          quantity,
          addExtra,
          extraPrice,
          deliveryType,
          preferredTime,
          address,
          phone,
          collectionCode,
          reference: response.reference,
        };

        saveSubscriptionFlowState(processingState);
        localStorage.setItem("lily_subscription_redirect", "true");

        toast.dismiss();
        toast.success("Redirecting to Paystack...");

        window.location.href = response.authorization_url;
      } else if (
        response.subscription ||
        response.status === "success" ||
        response.status === "pending"
      ) {
        toast.dismiss();
        toast.success("Subscription activated successfully!");
        navigate("/subscriptions", {
          replace: true,
          state: {
            plan,
            vendor,
            subscription: response.subscription || response,
          },
        });
      } else {
        console.log("Unexpected response structure:", response);
        toast.dismiss();
        toast.error("Unexpected response. Please try again.");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Direct payment error:", error);
      console.log("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "An error occurred during payment initialization.",
      );
    }
  };

  if (!plan) return null;

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-[#f6f8f6]">
      {/* Header */}
      <div className="relative bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-[#111813]">Confirm Payment</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-32">
        {/* Vendor + Plan Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {(() => {
                const media =
                  vendor?.logo ||
                  vendor?.image ||
                  vendor?.all_media_urls?.[0] ||
                  vendor?.profile_pic;
                const urlStr = Array.isArray(media) ? media[0] : media;
                if (urlStr && typeof urlStr === "string") {
                  return (
                    <img
                      src={urlStr.replace(/^http:\/\//i, "https://")}
                      alt={vendor?.name || "Vendor"}
                      className="w-full h-full object-cover"
                    />
                  );
                }
                return (
                  <div className="w-full h-full bg-[#13ec49]/10 flex items-center justify-center">
                    <ChefHat size={22} className="text-[#13ec49]" />
                  </div>
                );
              })()}
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscribing to</p>
              <p className="font-bold text-[#111813] text-base">
                {vendor?.name || "Vendor"}
              </p>
            </div>
          </div>

          {/* <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Plan</span>
              <span className="font-semibold text-[#111813] text-sm">{plan?.plan_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Calendar size={14} /> Frequency
              </span>
              <span className="font-semibold text-[#111813] text-sm capitalize">
                {plan?.frequency || "Weekly"}
              </span>
            </div>
            {plan?.meals_per_cycle && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Meals per cycle</span>
                <span className="font-semibold text-[#111813] text-sm">{plan.meals_per_cycle}</span>
              </div>
            )}
            {plan?.trial_days > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Zap size={14} className="text-yellow-500" /> Trial period
                </span>
                <span className="font-semibold text-green-600 text-sm">
                  {plan.trial_days} days free
                </span>
              </div>
            )}
          </div> */}

          <div className="border-t border-gray-100 pt-4 space-y-3">
            {/* Plan details */}
            {plan && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">{plan.plan_name}</span>
                <span className="font-semibold text-[#111813] text-sm">
                  ₦{formatPrice(plan.price)}
                </span>
              </div>
            )}

            {/* Delivery Days */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Calendar size={14} /> Delivery Days
              </span>
              <span className="font-semibold text-[#111813] text-sm">
                {selectedDays?.join(", ")}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Plates per delivery</span>
              <span className="font-semibold text-[#111813] text-sm">
                {quantity}
              </span>
            </div>

            {/* Delivery type */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Delivery type</span>
              <span className="font-semibold text-[#111813] text-sm">
                {deliveryType === "delivery" ? "🚚 Deliver to me" : "🛍️ Pickup"}
              </span>
            </div>

            {/* Address or collection code */}
            {deliveryType === "delivery" && address && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">
                  {deliveryType === "delivery"
                    ? "Delivery Address"
                    : "Pickup Address"}
                </span>
                <span className="font-semibold text-[#111813] text-sm text-right max-w-[60%]">
                  {address}
                </span>
              </div>
            )}

            {/* Preferred Time */}
            {preferredTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Preferred Time</span>
                <span className="font-semibold text-[#111813] text-sm">
                  {preferredTime}
                </span>
              </div>
            )}
            {deliveryType === "pickup" && collectionCode && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Collection Code</span>
                <span className="font-semibold text-[#111813] text-sm">
                  {collectionCode}
                </span>
              </div>
            )}

            {/* Phone */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Phone</span>
              <span className="font-semibold text-[#111813] text-sm">
                {phone}
              </span>
            </div>

            {/* Extra */}
            {addExtra && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Extra portion</span>
                <span className="font-semibold text-[#13ec49] text-sm">
                  +₦{extraPrice}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <p className="font-semibold text-[#111813] mb-3">Price Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Subscription price</span>
              <span className="font-semibold text-[#111813]">
                ₦{formatPrice(planPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Platform fee (10%)</span>
              <span className="text-gray-400 text-xs">
                ₦{formatPrice(platformFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                Vendor receives (90%)
              </span>
              <span className="text-gray-400 text-xs">
                ₦{formatPrice(vendorReceives)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
              <span className="font-bold text-[#111813]">You pay</span>
              <span className="font-bold text-[#13ec49] text-lg">
                ₦{formatPrice(planPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-4 shadow-sm ${
            hasEnoughBalance ? "bg-white" : "bg-red-50 border border-red-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
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
                  <div className="h-5 w-20 bg-gray-100 rounded animate-pulse mt-1" />
                ) : (
                  <p className="font-bold text-[#111813]">
                    ₦{formatPrice(walletBalance)}
                  </p>
                )}
              </div>
            </div>
            {!walletLoading && (
              <div>
                {hasEnoughBalance ? (
                  <div className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle size={12} />
                    Sufficient
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-red-100 text-red-500 text-xs font-semibold px-2 py-1 rounded-full">
                    <AlertCircle size={12} />
                    Insufficient
                  </div>
                )}
              </div>
            )}
          </div>

          {!walletLoading && !hasEnoughBalance && (
            <div className="mt-3 p-3 bg-red-100 rounded-xl">
              <p className="text-red-600 text-xs">
                You need{" "}
                <strong>₦{formatPrice(planPrice - walletBalance)}</strong> more
                to subscribe to this plan. Top up your wallet to continue.
              </p>
            </div>
          )}
        </motion.div>

        {/* Payment method note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-2 bg-[#13ec49]/10 rounded-2xl p-4 border border-[#13ec49]/20"
        >
          <Zap size={16} className="text-[#13ec49] mt-0.5 shrink-0" />
          <p className="text-[#111813] text-xs leading-relaxed font-medium">
            <strong>Direct Payment Enabled:</strong> You can now pay directly
            with your card or bank transfer. Your wallet will be topped up and
            the subscription processed immediately.
          </p>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3 max-w-5xl mx-auto lg:ml-64">
        {!walletLoading && !hasEnoughBalance ? (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDirectPayment}
              className="w-full bg-[#13ec49] text-[#111813] font-bold py-4 rounded-2xl text-base transition-all active:scale-95 shadow-lg shadow-green-500/20"
            >
              Pay ₦{formatPrice(planPrice)} Now (Direct)
            </motion.button>
            <p className="text-center text-[10px] text-gray-400 font-medium">
              Safe & Secure via Paystack
            </p>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePayWithWallet}
            disabled={walletLoading}
            className="w-full bg-[#13ec49] text-[#111813] font-bold py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {walletLoading
              ? "Checking balance..."
              : `Pay ₦${formatPrice(planPrice)} with Wallet`}
          </motion.button>
        )}

        <div className="flex gap-2">
          {!hasEnoughBalance && (
            <button
              onClick={handleTopUp}
              className="flex-1 bg-white text-gray-600 border border-gray-100 font-semibold py-3 rounded-2xl text-xs"
            >
              Top Up Only
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white text-gray-500 font-semibold py-3 rounded-2xl text-xs border border-gray-100"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPaymentPage;
