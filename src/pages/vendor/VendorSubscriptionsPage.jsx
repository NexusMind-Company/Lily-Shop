import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Phone, Clock, MapPin, BadgeCheck } from "lucide-react";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import {
  fetchVendorSubscriptions,
} from "../../services/vendorDashboardApi";

const PLAN_TYPE_COLORS = { weekly: "bg-blue-100 text-blue-700", monthly: "bg-purple-100 text-purple-700" };
const STATUS_COLORS = { active: "bg-green-100 text-green-700", expired: "bg-gray-100 text-gray-500", pending: "bg-orange-100 text-orange-600" };

const SubscriptionCard = ({ sub }) => {
  const daysLeft = sub.status === "active"
    ? Math.max(0, Math.ceil((new Date(sub.end_date) - new Date()) / 86400000))
    : 0;

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#4eb75e]/10 flex items-center justify-center text-sm font-bold text-[#4eb75e]">
            {sub.customer_name?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111813] dark:text-white">{sub.customer_name}</p>
            <p className="text-xs text-gray-400">{sub.meal_preferences}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_TYPE_COLORS[sub.plan_type] ?? "bg-gray-100 text-gray-600"}`}>{sub.plan_type}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status] ?? "bg-gray-100 text-gray-600"}`}>{sub.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} className="text-[#4eb75e]" />
          <span>Start: {new Date(sub.start_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} className="text-red-400" />
          <span>End: {new Date(sub.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {sub.phone && (
          <div className="flex items-center gap-2 text-xs">
            <Phone size={12} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{sub.phone}</span>
          </div>
        )}
        {sub.collection_code && (
          <div className="flex items-center gap-2 text-xs">
            <BadgeCheck size={12} className="text-[#4eb75e]" />
            <span className="text-gray-600 dark:text-gray-300 font-semibold">Code: {sub.collection_code}</span>
          </div>
        )}
        {sub.preferred_time && (
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">Time: {sub.preferred_time}</span>
          </div>
        )}
        {sub.delivery_type && (
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={12} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300 capitalize">{sub.delivery_type}</span>
          </div>
        )}
      </div>

      {sub.status === "active" && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-400">Duration progress</span>
            <span className="text-[10px] font-bold text-[#4eb75e]">{daysLeft}d left</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#4eb75e] rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, 100 - (daysLeft / (sub.duration_days || 7)) * 100))}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

const VendorSubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [planFilter, setPlanFilter] = useState("all");

  const {
    data: subsData, isLoading: subsLoading, isError: subsError, error: subsErr, refetch: refetchSubs,
  } = useQuery({
    queryKey: ["vendorSubscriptions"],
    queryFn: () => fetchVendorSubscriptions(),
    staleTime: 1000 * 60,
    retry: 1,
  });

  // Filter by status and plan type client-side to avoid backend 500 errors
  const subs = (subsData?.results ?? []).filter((s) => {
    const matchesPlan = planFilter !== "all" ? s.plan_type === planFilter : true;
    const matchesStatus = activeTab === "active" 
      ? s.status?.toLowerCase() === "active" || !s.status
      : s.status?.toLowerCase() === activeTab;
    return matchesPlan && matchesStatus;
  });

  return (
    <VendorLayout title="Subscriptions">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "active", label: "Active" },
          { key: "expired", label: "Expired" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? "bg-[#4eb75e] text-white shadow-sm" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {["all", "weekly", "monthly"].map((p) => (
          <button key={p} onClick={() => setPlanFilter(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${planFilter === p ? "bg-[#111813] dark:bg-white text-white dark:text-[#111813]" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
            {p === "all" ? "All Plans" : `${p.charAt(0).toUpperCase()}${p.slice(1)}`}
          </button>
        ))}
      </div>

      {subsLoading && !subsData ? <VendorPageLoader />
        : subsError && !subsData ? <VendorPageError message={getErrorMessage(subsErr)} onRetry={refetchSubs} />
          : subs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {subsData?.results?.length === 0 
                ? "No subscribers yet. Share your plans to get started!"
                : `No ${activeTab} subscribers found`}
            </div>
          ) : (
            <div className="space-y-3">{subs.map((sub) => <SubscriptionCard key={sub.id} sub={sub} />)}</div>
          )}
    </VendorLayout>
  );
};

export default VendorSubscriptionsPage;