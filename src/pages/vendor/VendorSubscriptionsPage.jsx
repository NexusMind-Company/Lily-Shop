import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import {
  fetchVendorSubscriptions,
  fetchSubscriptionRequests,
  acceptSubscriptionRequest,
  declineSubscriptionRequest,
} from "../../services/vendorDashboardApi";

const mockSubscriptions = [
  { id: "SUB001", customer_name: "Amaka Obi", meal_preferences: "No onions", plan_type: "weekly", start_date: "2024-01-01", end_date: "2024-01-07", status: "active", duration_days: 7 },
  { id: "SUB002", customer_name: "Chukwudi Eze", meal_preferences: "Extra protein", plan_type: "monthly", start_date: "2024-01-01", end_date: "2024-01-31", status: "active", duration_days: 30 },
  { id: "SUB003", customer_name: "Fatima Bello", meal_preferences: "Vegetarian", plan_type: "weekly", start_date: "2023-12-25", end_date: "2023-12-31", status: "expired", duration_days: 7 },
];
const mockRequests = [
  { id: "REQ001", customer_name: "Blessing Nwosu", requested_plan: "Monthly – Large", requested_at: "10 min ago", meal_preferences: "No pepper" },
  { id: "REQ002", customer_name: "Emeka Okafor", requested_plan: "Weekly – Medium", requested_at: "1 hr ago", meal_preferences: "Extra portion" },
];

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

const RequestCard = ({ req, onAccept, onDecline, isProcessing }) => (
  <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-gray-800">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
        {req.customer_name?.charAt(0) ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#111813] dark:text-white truncate">{req.customer_name}</p>
        <p className="text-xs text-gray-400">{req.requested_plan}</p>
      </div>
      <span className="text-[10px] text-gray-400 flex-shrink-0">{req.requested_at}</span>
    </div>
    {req.meal_preferences && (
      <p className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg px-3 py-1.5 mb-3">
        🍽 Preference: {req.meal_preferences}
      </p>
    )}
    <div className="flex gap-2">
      <button onClick={() => onAccept(req.id)} disabled={isProcessing}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#4eb75e] text-white text-xs font-bold hover:bg-[#3da64d] disabled:opacity-60 transition-colors">
        <Check size={13} /> Accept
      </button>
      <button onClick={() => onDecline(req.id)} disabled={isProcessing}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-60 transition-colors">
        <X size={13} /> Decline
      </button>
    </div>
  </div>
);

const VendorSubscriptionsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [planFilter, setPlanFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const {
    data: subsData, isLoading: subsLoading, isError: subsError, error: subsErr, refetch: refetchSubs,
  } = useQuery({
    queryKey: ["vendorSubscriptions", activeTab, planFilter],
    queryFn: () => fetchVendorSubscriptions({
      status: activeTab !== "requests" ? activeTab : undefined,
      plan_type: planFilter !== "all" ? planFilter : undefined,
    }),
    placeholderData: { results: mockSubscriptions },
    enabled: activeTab !== "requests",
    retry: 2,
    staleTime: 1000 * 60,
  });

  const {
    data: requests, isLoading: reqLoading, isError: reqError, error: reqErr, refetch: refetchReqs,
  } = useQuery({
    queryKey: ["subscriptionRequests"],
    queryFn: fetchSubscriptionRequests,
    placeholderData: mockRequests,
    enabled: activeTab === "requests",
    retry: 2,
    staleTime: 1000 * 30,
  });

  const { mutate: accept } = useMutation({
    mutationFn: (id) => acceptSubscriptionRequest(id),
    onMutate: (id) => setProcessingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["vendorSubscriptions"] });
      toast.success("Subscription accepted!");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setProcessingId(null),
  });

  const { mutate: decline } = useMutation({
    mutationFn: (id) => declineSubscriptionRequest(id),
    onMutate: (id) => setProcessingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionRequests"] });
      toast.success("Request declined.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setProcessingId(null),
  });

  const subs = (subsData?.results ?? []).filter((s) =>
    planFilter !== "all" ? s.plan_type === planFilter : true
  );
  const reqs = requests ?? [];
  const pendingCount = reqs.length;

  return (
    <VendorLayout title="Subscriptions">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "active", label: "Active" },
          { key: "expired", label: "Expired" },
          { key: "requests", label: pendingCount > 0 ? `Requests (${pendingCount})` : "Requests" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? "bg-[#4eb75e] text-white shadow-sm" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab !== "requests" && (
        <div className="flex gap-2">
          {["all", "weekly", "monthly"].map((p) => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${planFilter === p ? "bg-[#111813] dark:bg-white text-white dark:text-[#111813]" : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500"}`}>
              {p === "all" ? "All Plans" : `${p.charAt(0).toUpperCase()}${p.slice(1)}`}
            </button>
          ))}
        </div>
      )}

      {/* Subscriptions tab */}
      {activeTab !== "requests" && (
        subsLoading && !subsData ? <VendorPageLoader />
          : subsError && !subsData ? <VendorPageError message={getErrorMessage(subsErr)} onRetry={refetchSubs} />
            : subs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No {activeTab} subscriptions found</div>
            ) : (
              <div className="space-y-3">{subs.map((sub) => <SubscriptionCard key={sub.id} sub={sub} />)}</div>
            )
      )}

      {/* Requests tab */}
      {activeTab === "requests" && (
        reqLoading && !requests ? <VendorPageLoader />
          : reqError && !requests ? <VendorPageError message={getErrorMessage(reqErr)} onRetry={refetchReqs} />
            : reqs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No pending requests</div>
            ) : (
              <div className="space-y-3">
                {reqs.map((req) => (
                  <RequestCard key={req.id} req={req}
                    isProcessing={processingId === req.id}
                    onAccept={accept} onDecline={decline} />
                ))}
              </div>
            )
      )}
    </VendorLayout>
  );
};

export default VendorSubscriptionsPage;