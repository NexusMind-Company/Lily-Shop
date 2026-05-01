import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Calendar,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageError,
  VendorPageLoader,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import { fetchVendorSubscriptions } from "../../services/vendorDashboardApi";

const PLAN_TYPE_COLORS = {
  weekly: "bg-blue-100 text-blue-700",
  monthly: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-500",
  pending: "bg-orange-100 text-orange-600",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

const DetailRow = ({ icon: Icon, label, value, valueClassName = "" }) => {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Icon size={12} className="text-[#4eb75e]" />
        {label}
      </span>
      <span
        className={`text-right text-xs font-medium text-gray-700  ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
};

const DetailBlock = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="rounded-xl bg-gray-50 p-3 ">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="text-xs leading-relaxed text-gray-700 ">{value}</p>
    </div>
  );
};

const SubscriptionCard = ({ sub }) => {
  const totalDays = sub.duration_days || 7;
  const daysLeft =
    sub.status === "active" && sub.end_date
      ? Math.max(0, Math.ceil((new Date(sub.end_date) - new Date()) / 86400000))
      : 0;
  const progressWidth =
    sub.status === "active"
      ? `${Math.min(100, Math.max(6, 100 - (daysLeft / totalDays) * 100))}%`
      : "0%";
  const preferredDays = formatList(sub.preferred_delivery_days);
  const amountPaid = sub.amount_paid
    ? `N${Number(sub.amount_paid).toLocaleString()}`
    : "";
  const customerPhone = sub.phone || sub.customer_phone;
  const deliveryMode = sub.delivery_type
    ? sub.delivery_type.charAt(0).toUpperCase() + sub.delivery_type.slice(1)
    : "";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm  ">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4eb75e]/10 text-sm font-bold text-[#4eb75e]">
            {sub.customer_name?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111813] ">
              {sub.customer_name}
            </p>
            <p className="text-xs text-gray-500 ">
              {sub.plan_name || sub.meal_preferences}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              PLAN_TYPE_COLORS[sub.plan_type] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {sub.plan_type || "plan"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              STATUS_COLORS[sub.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {sub.status || "pending"}
          </span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f8faf8] p-3 ">
        <DetailRow
          icon={Calendar}
          label="Start"
          value={formatDate(sub.start_date)}
        />
        <DetailRow
          icon={Calendar}
          label="Expires"
          value={formatDate(sub.end_date)}
        />
        <DetailRow icon={CreditCard} label="Paid" value={amountPaid} />
        <DetailRow
          icon={Clock}
          label="Created"
          value={formatDateTime(sub.start_date)}
        />
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3 ">
        <DetailRow icon={Phone} label="Phone" value={customerPhone} />
        <DetailRow icon={Mail} label="Email" value={sub.customer_email} />
        <DetailRow icon={Truck} label="Delivery" value={deliveryMode} />
        <DetailRow
          icon={Clock}
          label="Preferred Time"
          value={sub.preferred_time}
        />
        <DetailRow
          icon={BadgeCheck}
          label="Pickup Code"
          value={sub.collection_code}
          valueClassName="text-[#4eb75e]"
        />
        <DetailRow
          icon={UtensilsCrossed}
          label="Plates"
          value={
            sub.plates_per_delivery
              ? `${sub.plates_per_delivery} per delivery`
              : ""
          }
        />
        <DetailRow
          icon={UtensilsCrossed}
          label="Portion Size"
          value={sub.portion_size}
          valueClassName="capitalize"
        />
        <DetailRow
          icon={Calendar}
          label="Delivery Days"
          value={preferredDays}
        />
        <DetailRow icon={MapPin} label="Address" value={sub.customer_address} />
      </div>

      <div className="mt-3 space-y-2">
        <DetailBlock label="Preferences" value={sub.meal_preferences} />
        <DetailBlock label="Dietary Notes" value={sub.dietary_notes} />
        <DetailBlock label="Allergies" value={sub.allergies_summary} />
        <DetailBlock
          label="Additional Notes"
          value={sub.special_instructions}
        />
      </div>

      {sub.status === "active" && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Subscription progress
            </span>
            <span className="text-[10px] font-bold text-[#4eb75e]">
              {daysLeft}d left
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 ">
            <div
              className="h-full rounded-full bg-[#4eb75e]"
              style={{ width: progressWidth }}
            />
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
    data: subsData,
    isLoading: subsLoading,
    isError: subsError,
    error: subsErr,
    refetch: refetchSubs,
  } = useQuery({
    queryKey: ["vendorSubscriptions"],
    queryFn: () => fetchVendorSubscriptions(),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const subs = (subsData?.results ?? []).filter((subscription) => {
    const matchesPlan =
      planFilter !== "all" ? subscription.plan_type === planFilter : true;
    const normalizedStatus = subscription.status?.toLowerCase();
    const matchesStatus =
      activeTab === "active"
        ? normalizedStatus === "active" || !normalizedStatus
        : normalizedStatus === activeTab;
    return matchesPlan && matchesStatus;
  });

  return (
    <VendorLayout title="Subscriptions">
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "active", label: "Active" },
          { key: "expired", label: "Expired" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-[#4eb75e] text-white shadow-sm"
                : "border border-gray-100 bg-white text-gray-500  "
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {["all", "weekly", "monthly"].map((plan) => (
          <button
            key={plan}
            onClick={() => setPlanFilter(plan)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all ${
              planFilter === plan
                ? "bg-[#111813] text-white  "
                : "border border-gray-100 bg-white text-gray-500  "
            }`}
          >
            {plan === "all"
              ? "All Plans"
              : `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`}
          </button>
        ))}
      </div>

      {subsLoading && !subsData ? (
        <VendorPageLoader />
      ) : subsError && !subsData ? (
        <VendorPageError
          message={getErrorMessage(subsErr)}
          onRetry={refetchSubs}
        />
      ) : subs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          {subsData?.results?.length === 0
            ? "No subscribers yet. Share your plans to get started!"
            : `No ${activeTab} subscribers found`}
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub) => (
            <SubscriptionCard key={sub.subscription_id || sub.id} sub={sub} />
          ))}
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorSubscriptionsPage;
