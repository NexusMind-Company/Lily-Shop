import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserSubscriptions, unsubscribeFromPlan } from "../services/api";
import {
  ChevronLeft,
  ChefHat,
  Calendar,
  Repeat,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  UtensilsCrossed,
  Receipt,
  BadgeCheck,
} from "lucide-react";

// Import from your api.js — adjust path if needed

const formatPrice = (price) =>
  Number(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: "Active", cls: "bg-green-50 text-green-600", icon: CheckCircle },
    pending: { label: "Pending", cls: "bg-yellow-50 text-yellow-600", icon: Clock },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-500", icon: AlertCircle },
    expired: { label: "Expired", cls: "bg-gray-100 text-gray-500", icon: AlertCircle },
  };
  const cfg = map[status?.toLowerCase()] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const UnsubscribeModal = ({ plan, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-6 w-full max-w-sm"
    >
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-[#111813] text-lg">Cancel Subscription?</h3>
        <p className="text-gray-500 text-sm mt-1">
          You're about to cancel{" "}
          <span className="font-semibold text-[#111813]">{plan?.plan_name}</span>. You'll lose
          access at the end of your current cycle.
        </p>
      </div>
      <div className="space-y-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isLoading ? "Cancelling..." : "Yes, Cancel"}
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl"
        >
          Keep Subscription
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const SubscriptionCard = ({ sub, onUnsubscribe }) => {
  const navigate = useNavigate();
  const plan = sub?.plan || sub;
  const vendor = plan?.vendor || sub?.vendor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#13ec49]/10 flex items-center justify-center">
            <ChefHat size={20} className="text-[#13ec49]" />
          </div>
          <div>
            <p className="font-bold text-[#111813] text-sm leading-tight">{plan?.plan_name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{vendor?.name || "Vendor"}</p>
          </div>
        </div>
        <StatusBadge status={sub?.status || "active"} />
      </div>

      {/* Details */}
      <div className="bg-[#f6f8f6] rounded-xl p-3 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <span className="font-medium text-[#111813]">₦{formatPrice(plan?.price)}</span>
          </span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Repeat size={11} />
            <span className="capitalize">{plan?.frequency || "weekly"}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Calendar size={11} /> Last paid
          </span>
          <span className="text-xs text-[#111813] font-medium">
            {formatDate(plan?.last_payment_date || sub?.last_payment_date)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Calendar size={11} /> Next renewal
          </span>
          <span className="text-xs text-[#111813] font-medium">
            {formatDate(plan?.next_payment_date || sub?.next_payment_date)}
          </span>
        </div>
      </div>

      {/* Proof Information */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Receipt size={11} /> Subscription ID
          </span>
          <span className="text-xs text-[#111813] font-medium font-mono">
            {sub?.id?.slice(0, 8) || "N/A"}
          </span>
        </div>
        {sub?.collection_code && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <BadgeCheck size={11} /> Collection Code
            </span>
            <span className="text-xs text-[#13ec49] font-semibold">
              {sub.collection_code}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Clock size={11} /> Subscribed on
          </span>
          <span className="text-xs text-[#111813] font-medium">
            {formatDate(sub?.created_at || sub?.start_date)}
          </span>
        </div>
      </div>

      {/* Action buttons — only show for active */}
      {(sub?.status === "active" || !sub?.status) && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              navigate(`/meal-selection/${sub?.id}`, {
                state: {
                  plan: plan,
                  vendorId: vendor?.id || sub?.vendor_id,
                },
              })
            }
            className="w-full py-2.5 rounded-xl bg-[#13ec49] text-[#111813] text-sm font-bold hover:bg-[#11d842] transition-colors"
          >
            Select/Manage Meals
          </button>
          <button
            onClick={() => onUnsubscribe(plan)}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </motion.div>
  );
};

const CustomerSubscriptionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [planToCancel, setPlanToCancel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: getUserSubscriptions,
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (planId) => unsubscribeFromPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(["mySubscriptions"]);
      setPlanToCancel(null);
    },
    onError: (err) => {
      console.error("Unsubscribe error:", err);
    },
  });

  const subscriptions = data?.results || data || [];
  const filtered = searchQuery
    ? subscriptions.filter((s) => {
        const name = s?.plan?.plan_name || s?.plan_name || "";
        const vendor = s?.plan?.vendor?.name || s?.vendor?.name || "";
        const q = searchQuery.toLowerCase();
        return name.toLowerCase().includes(q) || vendor.toLowerCase().includes(q);
      })
    : subscriptions;

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-[#f6f8f6]">
      {/* Header */}
      <div className="relative bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-[#111813]">My Subscriptions</h1>
      </div>

      {/* Search */}
      <div className="bg-white px-4 pb-4 border-b border-gray-100">
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f6f8f6] rounded-xl text-sm outline-none text-[#111813] placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <Loader2 size={32} className="text-[#13ec49] animate-spin" />
            <p className="text-gray-400 text-sm">Loading your subscriptions...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center px-8">
            <AlertCircle size={40} className="text-red-400" />
            <p className="font-semibold text-[#111813]">Failed to load subscriptions</p>
            <p className="text-gray-400 text-sm">Please check your connection and try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-[#13ec49]/10 flex items-center justify-center">
              <UtensilsCrossed size={36} className="text-[#13ec49]" />
            </div>
            <div>
              <p className="font-bold text-[#111813] text-lg">
                {searchQuery ? "No results found" : "No subscriptions yet"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Subscribe to a food vendor to get started!"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate("/food")}
                className="bg-[#13ec49] text-[#111813] font-bold px-6 py-3 rounded-xl text-sm"
              >
                Explore Vendors
              </button>
            )}
          </div>
        )}

        {/* Subscription cards */}
        {!isLoading &&
          !isError &&
          filtered.map((sub, i) => (
            <SubscriptionCard key={sub?.id || sub?.plan?.id || i} sub={sub} onUnsubscribe={setPlanToCancel} />
          ))}
      </div>

      {/* Unsubscribe Modal */}
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