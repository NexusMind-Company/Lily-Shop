import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Receipt,
  Repeat,
  Search,
  Timer,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { getUserSubscriptions, unsubscribeFromPlan } from "../services/api";
import { SubscriptionCardSkeleton } from "../components/common/skeletons";

const serviceDaysRemaining = (endDateStr, serviceDays) => {
  if (!endDateStr || !serviceDays || serviceDays.length === 0) return 0;

  const now = new Date();
  const endDate = new Date(endDateStr);
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  let count = 0;
  const current = new Date(now);
  current.setHours(0, 0, 0, 0); // Start from beginning of today

  while (current <= endDate) {
    const dayName = dayNames[current.getDay()].toLowerCase();
    if (serviceDays.map((d) => d.toLowerCase()).includes(dayName)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(0, count);
};

const formatPrice = (price) =>
  Number(price || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatPaymentMethod = (method) => {
  if (!method) return "N/A";
  const normalized = String(method).trim().toLowerCase();
  if (normalized === "wallet") return "Lily Wallet";
  if (normalized === "paystack") return "Paystack";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatList = (items) => {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items
    .map((item) => {
      const text = String(item || "").trim();
      return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
    })
    .filter(Boolean)
    .join(", ");
};

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      label: "Active",
      cls: "bg-green-50 text-green-600",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      cls: "bg-yellow-50 text-yellow-600",
      icon: Clock,
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-50 text-red-500",
      icon: AlertCircle,
    },
    expired: {
      label: "Expired",
      cls: "bg-gray-100 text-gray-500",
      icon: AlertCircle,
    },
  };
  const cfg = map[status?.toLowerCase()] || map.pending;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${cfg.cls}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueClassName = "" }) => {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Icon size={11} /> {label}
      </span>
      <span
        className={`text-right text-xs font-medium text-[#111813] ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
};

const InfoBlock = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Icon size={11} /> {label}
      </span>
      <span className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-xs leading-relaxed text-[#111813]">
        {value}
      </span>
    </div>
  );
};

const UnsubscribeModal = ({ plan, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm"
    onClick={onCancel}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      onClick={(event) => event.stopPropagation()}
      className="w-full max-w-sm rounded-2xl bg-white p-6"
    >
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#111813]">
          Cancel Subscription?
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You are about to cancel{" "}
          <span className="font-semibold text-[#111813]">
            {plan?.plan_name}
          </span>
          . You will keep access until the end of the current cycle.
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-bold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isLoading ? "Cancelling..." : "Yes, Cancel"}
        </button>
        <button
          onClick={onCancel}
          className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700"
        >
          Keep Subscription
        </button>
      </div>
    </motion.div>
  </motion.div>
);

import { getVendorImageUrl } from "../utils/vendorUtils";

const SubscriptionCard = ({ sub, onUnsubscribe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const plan = sub?.plan || sub;
  const vendor = plan?.vendor || sub?.vendor;
  const paymentAmount = sub?.amount_paid ?? plan?.price;
  const preferredDays = formatList(sub?.preferred_delivery_days);
  const receiptId = sub?.id ? String(sub.id).slice(0, 8) : "N/A";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#13ec49]/10">
            {getVendorImageUrl(vendor) ? (
              <img
                src={getVendorImageUrl(vendor)}
                alt={vendor?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ChefHat size={20} className="text-[#13ec49]" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-[#111813]">
              {plan?.plan_name}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {vendor?.name || "Vendor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={sub?.status || "active"} />
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              <div className="space-y-2 rounded-xl bg-[#f6f8f6] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111813]">
                    N{formatPrice(plan?.price)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Repeat size={11} />
                    <span className="capitalize">
                      {plan?.frequency || "weekly"}
                    </span>
                  </span>
                </div>
                <InfoRow
                  icon={Calendar}
                  label="Last paid"
                  value={formatDate(
                    plan?.last_payment_date || sub?.last_payment_date,
                  )}
                />
                <InfoRow
                  icon={Calendar}
                  label="Next renewal"
                  value={formatDate(
                    plan?.next_payment_date || sub?.next_payment_date,
                  )}
                />
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <InfoRow
                  icon={Receipt}
                  label="Subscription ID"
                  value={receiptId}
                  valueClassName="font-mono"
                />
                <InfoRow
                  icon={BadgeCheck}
                  label="Collection Code"
                  value={sub?.collection_code}
                  valueClassName="text-[#13ec49]"
                />
                <InfoRow icon={Phone} label="Contact" value={sub?.phone} />
                <InfoRow
                  icon={MapPin}
                  label="Delivery Mode"
                  value={sub?.delivery_type}
                  valueClassName="capitalize"
                />
                <InfoRow
                  icon={Clock}
                  label="Preferred Time"
                  value={sub?.preferred_time}
                />
                <InfoRow
                  icon={Calendar}
                  label="Delivery Days"
                  value={preferredDays}
                />
                <InfoRow
                  icon={UtensilsCrossed}
                  label="Plates"
                  value={
                    sub?.plates_per_delivery
                      ? `${sub.plates_per_delivery} per delivery`
                      : ""
                  }
                />
                <InfoRow
                  icon={ChefHat}
                  label="Portion Size"
                  value={sub?.portion_size}
                  valueClassName="capitalize"
                />

                {sub?.address && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} /> Delivery Address
                    </span>
                    <span className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-xs leading-relaxed text-[#111813]">
                      {sub.address}
                    </span>
                  </div>
                )}

                <InfoRow
                  icon={Clock}
                  label="Subscribed on"
                  value={formatDateTime(sub?.created_at || sub?.start_date)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Expires on"
                  value={formatDate(sub?.next_payment_date || sub?.end_date)}
                />
                <InfoRow
                  icon={Timer}
                  label="Days remaining"
                  value={
                    sub?.status === "active" &&
                    sub?.end_date &&
                    plan?.service_days
                      ? `${serviceDaysRemaining(sub.end_date, plan.service_days)} days`
                      : ""
                  }
                  valueClassName={
                    sub?.status === "active" &&
                    serviceDaysRemaining(sub?.end_date, plan?.service_days) <= 3
                      ? "text-red-500"
                      : "text-[#13ec49]"
                  }
                />
                <InfoRow
                  icon={Phone}
                  label="Vendor Phone"
                  value={vendor?.contact_phone}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Amount Paid"
                  value={
                    paymentAmount
                      ? `N${Number(paymentAmount).toLocaleString()}`
                      : ""
                  }
                />
                <InfoRow
                  icon={Truck}
                  label="Paid With"
                  value={
                    sub?.payment_method
                      ? formatPaymentMethod(sub.payment_method)
                      : ""
                  }
                />
                <InfoRow
                  icon={CheckCircle}
                  label="Payment Status"
                  value={sub?.payment_status}
                  valueClassName="capitalize"
                />
                <InfoRow
                  icon={Receipt}
                  label="Receipt Ref"
                  value={sub?.receipt_reference}
                  valueClassName="font-mono"
                />
                <InfoRow
                  icon={Clock}
                  label="Payment Time"
                  value={
                    sub?.receipt_date ? formatDateTime(sub.receipt_date) : ""
                  }
                />
                <InfoRow
                  icon={Receipt}
                  label="Customisation Fee"
                  value={
                    sub?.extra_fee_kobo > 0
                      ? `N${Number(sub.extra_fee_kobo / 100).toLocaleString()}`
                      : ""
                  }
                />

                <InfoBlock
                  icon={ChefHat}
                  label="Dietary Notes"
                  value={sub?.dietary_notes}
                />
                <InfoBlock
                  icon={AlertCircle}
                  label="Allergies"
                  value={sub?.allergies_summary}
                />
                <InfoBlock
                  icon={Receipt}
                  label="Additional Notes"
                  value={sub?.special_instructions}
                />
              </div>

              {(sub?.status === "active" || !sub?.status) && (
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meal-selection/${sub?.id}`, {
                        state: {
                          plan,
                          vendorId: vendor?.id || sub?.vendor_id,
                          excluded_meals: sub?.excluded_meals ?? [],
                        },
                      });
                    }}
                    className="w-full rounded-xl bg-[#13ec49] py-2.5 text-sm font-bold text-[#111813] transition-colors hover:bg-[#11d842]"
                  >
                    Customise Meals
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnsubscribe(plan);
                    }}
                    className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CustomerSubscriptionsPage = ({ hideHeader = false, onExplore }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const successState = location.state;
  const showSuccessBanner =
    successState?.subscriptionId && successState?.paymentMethod === "paystack";
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [planToCancel, setPlanToCancel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const playSuccessSound = () => {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        659.25,
        audioContext.currentTime + 0.1,
      );
      oscillator.frequency.setValueAtTime(
        783.99,
        audioContext.currentTime + 0.2,
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.4,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Clear location state after showing success banner to prevent persistence on refresh
  useEffect(() => {
    if (showSuccessBanner) {
      playSuccessSound();
      setShowSuccessPopup(true);
      const timer = setTimeout(() => {
        navigate(".", { replace: true, state: {} });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner, navigate]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: async () => {
      return getUserSubscriptions();
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (planId) => unsubscribeFromPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
      setPlanToCancel(null);
    },
    onError: (error) => {
      console.error("Unsubscribe error:", error);
    },
  });

  const subscriptions = Array.isArray(data) ? data : data?.results || [];

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      navigate("/food");
    }
  };

  return (
    <div
      className={`mx-auto flex w-full max-w-5xl flex-col bg-[#f6f8f6] ${hideHeader ? "" : "min-h-screen"}`}
    >
      {!hideHeader && (
        <div className="relative flex shrink-0 items-center justify-center border-b border-gray-100 bg-white px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-[#111813]">My Subscriptions</h1>
        </div>
      )}

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowSuccessPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#111813]">
                Payment Successful!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Your food subscription has been activated. You can now enjoy
                your meals!
              </p>
              {successState?.vendor && (
                <div className="mt-4 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Subscribed to</p>
                  <p className="font-semibold text-[#111813]">
                    {successState.vendor.name}
                  </p>
                </div>
              )}
              {successState?.plan && (
                <div className="mt-2 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Plan</p>
                  <p className="font-semibold text-[#111813]">
                    {successState.plan.plan_name}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate(".", { replace: true, state: {} });
                }}
                className="mt-6 w-full rounded-xl bg-[#13ec49] py-3 font-bold text-[#111813] transition-colors hover:bg-green-400"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small banner - now hidden when popup shows */}
      {showSuccessBanner && !showSuccessPopup && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              Subscription Activated!
            </p>
            <p className="text-xs text-green-600">
              Your Paystack subscription is complete. You can view your
              subscription details below.
            </p>
          </div>
          <button
            onClick={() => navigate(".", { replace: true, state: {} })}
            className="text-green-700 hover:text-green-900"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <SubscriptionCardSkeleton key={i} />
          ))}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 px-8 pt-20 text-center">
            <AlertCircle size={40} className="text-red-400" />
            <p className="font-semibold text-[#111813]">
              Failed to load subscriptions
            </p>
            <p className="text-sm text-gray-400">
              Please check your connection and try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && subscriptions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 px-8 pt-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#13ec49]/10">
              <UtensilsCrossed size={36} className="text-[#13ec49]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#111813]">
                {searchQuery ? "No results found" : "No subscriptions yet"}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {searchQuery
                  ? "Try a different search term"
                  : "Subscribe to a food vendor to get started!"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={handleExplore}
                className="rounded-xl bg-[#13ec49] px-6 py-3 text-sm font-bold text-[#111813]"
              >
                Explore Vendors
              </button>
            )}
          </div>
        )}

        {!isLoading &&
          !isError &&
          subscriptions.map((sub, index) => (
            <SubscriptionCard
              key={sub?.id || sub?.plan?.id || index}
              sub={sub}
              onUnsubscribe={setPlanToCancel}
            />
          ))}
      </div>

      <AnimatePresence>
        {planToCancel && (
          <UnsubscribeModal
            plan={planToCancel}
            isLoading={unsubscribeMutation.isPending}
            onConfirm={() => unsubscribeMutation.mutate(planToCancel?.id)}
            onCancel={() => setPlanToCancel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSubscriptionsPage;
