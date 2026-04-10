// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import CustomerSubscriptionHeader from "../components/subscription/CustomerSubscriptionHeader";
// import SubscriptionSegmentedControl from "../components/subscription/SubscriptionSegmentedControl";
// import ExpandableSubscriptionCard from "../components/subscription/ExpandableSubscriptionCard";
// import CustomerSubscriptionFooter from "../components/subscription/CustomerSubscriptionFooter";
// import { fetchCustomerSubscriptions } from "../services/subscriptionApi";

// /**
//  * CustomerSubscriptionsPage component - Customer view of their subscriptions
//  */
// const CustomerSubscriptionsPage = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("active");

//   // Fetch customer subscriptions
//   const {
//     data: subscriptions,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["customerSubscriptions"],
//     queryFn: fetchCustomerSubscriptions,
//     enabled: true,
//   });

//   // Event handlers
//   const handleBack = () => {
//     navigate(-1);
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   const handleSkipWeek = (subscriptionId) => {
//     // Implement skip week functionality
//     console.log("Skip week for subscription:", subscriptionId);
//   };

//   const handleManage = (subscriptionId) => {
//     // Navigate to manage subscription page
//     navigate(`/subscription/${subscriptionId}/manage`);
//   };

//   const handleResume = (subscriptionId) => {
//     // Implement resume functionality
//     console.log("Resume subscription:", subscriptionId);
//   };

//   const handleBrowseNewPlans = () => {
//     // Navigate to browse plans
//     navigate("/browse-plans");
//   };

//   // Filter subscriptions based on active tab
//   const subs = subscriptions?.data || subscriptions;
//   const filteredSubscriptions = (Array.isArray(subs) ? subs : []).filter(
//     (subscription) => {
//       if (activeTab === "active") {
//         return subscription.status.toLowerCase() === "active";
//       }
//       return (
//         subscription.status.toLowerCase() === "past" ||
//         subscription.status.toLowerCase() === "paused"
//       );
//     },
//   );

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
//         <div className="text-text-main dark:text-gray-100">Loading...</div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
//         <div className="text-red-500">
//           Error loading subscriptions. Please try again.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f6f8f6] dark:bg-background-dark font-display text-text-main dark:text-gray-100 min-h-screen flex flex-col antialiased">
//       <CustomerSubscriptionHeader onBack={handleBack} />

//       <main className="flex-1 w-full max-w-md mx-auto flex flex-col pb-24 px-4 pt-4">
//         <SubscriptionSegmentedControl
//           activeTab={activeTab}
//           onTabChange={handleTabChange}
//         />

//         <div className="flex flex-col gap-4">
//           {filteredSubscriptions.length > 0 ? (
//             filteredSubscriptions.map((subscription) => (
//               <ExpandableSubscriptionCard
//                 key={subscription.id}
//                 subscription={subscription}
//                 onSkipWeek={handleSkipWeek}
//                 onManage={handleManage}
//                 onResume={handleResume}
//               />
//             ))
//           ) : (
//             <div className="text-center py-12">
//               <p className="text-text-sub dark:text-gray-400">
//                 No {activeTab} subscriptions
//               </p>
//             </div>
//           )}
//         </div>
//       </main>

//       <CustomerSubscriptionFooter onBrowseNewPlans={handleBrowseNewPlans} />
//     </div>
//   );
// };

// export default CustomerSubscriptionsPage;


import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Import from your api.js — adjust path if needed
import { getUserSubscriptions, unsubscribeFromPlan } from "../services/api";

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

      {/* Cancel button — only show for active */}
      {(sub?.status === "active" || !sub?.status) && (
        <button
          onClick={() => onUnsubscribe(plan)}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Cancel Subscription
        </button>
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
      queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
      setPlanToCancel(null);
      toast.success("Subscription cancelled.");
    },
    onError: (err) => {
      console.error("Unsubscribe error:", err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Couldn't cancel this subscription.",
      );
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
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-[#f6f8f6]">
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
