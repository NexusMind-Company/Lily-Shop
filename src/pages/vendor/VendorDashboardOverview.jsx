import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, UtensilsCrossed, Users, TrendingUp,
  UserPlus, UserMinus, Activity, ChevronRight,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import {
  fetchVendorDashboardOverview,
  fetchSubscriberGrowth,
  fetchRecentActivity,
} from "../../services/vendorDashboardApi";
import { updateFoodVendor } from "../../services/api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { MapPin, Edit3, Check, X } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, sub, subUp }) => (
  <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-2">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-[#111813] dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    {sub && (
      <div className={`flex items-center gap-1 text-xs font-semibold ${subUp ? "text-[#4eb75e]" : "text-red-500"}`}>
        {subUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {sub}
      </div>
    )}
  </div>
);

const ActivityRow = ({ item }) => {
  const colorMap = {
    subscribed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    renewed: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-[#4eb75e]">
        {item.customer_name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111813] dark:text-white truncate">{item.customer_name}</p>
        <p className="text-xs text-gray-400 truncate">{item.meal_plan}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${colorMap[item.action] ?? "bg-gray-100 text-gray-600"}`}>
        {item.action}
      </span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl px-3 py-2 text-xs border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const VendorDashboardOverview = () => {
  const navigate = useNavigate();
  const { data: profileData } = useSelector((state) => state.profile);
  const vendorId = profileData?.user?.vendor_id;

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleUpdateAddress = async () => {
    if (!newAddress.trim()) {
      toast.error("Please enter a valid address");
      return;
    }
    if (!vendorId) {
      toast.error("Vendor ID not found. Please refresh the page.");
      return;
    }

    setIsSavingAddress(true);
    try {
      console.log("Updating vendor address:", { vendorId, address: newAddress.trim() });
      await updateFoodVendor(vendorId, { address: newAddress.trim() });
      toast.success("Address updated successfully!");
      setIsEditingAddress(false);
      // We don't necessarily need to reload profile here as VendorHero will pick it up on next render 
      // if it fetches fresh, or the user can refresh.
    } catch (err) {
      console.error("Error updating vendor address:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      toast.error("Failed to update address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErr,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["vendorDashboardOverview"],
    queryFn: fetchVendorDashboardOverview,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: growth,
    isError: growthError,
  } = useQuery({
    queryKey: ["subscriberGrowth", "weekly"],
    queryFn: () => fetchSubscriberGrowth("weekly"),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: activity,
    isError: activityError,
  } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: fetchRecentActivity,
    staleTime: 1000 * 30,
  });

  // Show skeleton only on the very first load (no placeholder data yet)
  if (overviewLoading && !overview) {
    return <VendorLayout title="Overview"><VendorPageLoader /></VendorLayout>;
  }

  // Only block the page if the primary data failed AND we have nothing to show
  if (overviewError && !overview) {
    return (
      <VendorLayout title="Overview">
        <VendorPageError message={getErrorMessage(overviewErr)} onRetry={refetchOverview} />
      </VendorLayout>
    );
  }

  const o = overview ?? {};
  const g = growth ?? {};
  const a = activity;

  const chartData = (g?.labels ?? []).map((label, i) => ({
    name: label,
    New: g.new_subscribers?.[i] ?? 0,
    Lost: g.lost_subscribers?.[i] ?? 0,
  }));

  return (
    <VendorLayout title="Overview">
      {/* Welcome & Quick Address Fix */}
      <div className="flex items-start justify-between group">
        <div className="pt-1">
          <p className="text-xs text-gray-400 font-medium">Good afternoon 👋</p>
          <h2 className="text-xl font-bold text-[#111813] dark:text-white">
            {profileData?.user?.username ?? "Vendor"}
          </h2>
        </div>
        {!isEditingAddress ? (
          <button 
            onClick={() => setIsEditingAddress(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-[#4eb75e] bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
          >
            <MapPin size={12} /> Update Address
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 p-1.5 rounded-xl shadow-sm">
            <input 
              type="text"
              placeholder="Enter street address..."
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="text-xs px-2 py-1 outline-none text-black dark:bg-transparent dark:text-white min-w-[150px]"
              autoFocus
            />
            <button 
              disabled={isSavingAddress}
              onClick={handleUpdateAddress}
              className="p-1 text-[#4eb75e] hover:bg-green-50 rounded-lg disabled:opacity-50"
            >
               {isSavingAddress ? <div className="w-3 h-3 border-2 border-[#4eb75e] border-t-transparent animate-spin rounded-full" /> : <Check size={14} />}
            </button>
            <button 
               onClick={() => setIsEditingAddress(false)}
               className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {(growthError || activityError) && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl px-4 py-2.5 mt-2">
          <p className="text-xs text-orange-700 dark:text-orange-400">
            ⚠️ Some data couldn't refresh — showing last known values.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={o.today_orders ?? "—"} color="bg-[#4eb75e]" sub="+3 from yesterday" subUp />
        <StatCard icon={UtensilsCrossed} label="Meals to Prepare" value={o.meals_to_prepare ?? "—"} color="bg-orange-400" />
        <StatCard icon={Users} label="Active Subscriptions" value={o.active_subscriptions ?? "—"} color="bg-blue-500" sub={`+${o.new_subscribers_this_week ?? 0} this week`} subUp />
        <StatCard icon={TrendingUp} label="Weekly Revenue" value={`₦${(o.weekly_revenue ?? 0).toLocaleString()}`} color="bg-purple-500" sub="vs last week" subUp />
      </div>

      <div className="bg-[#4eb75e] rounded-2xl px-5 py-4 flex items-center justify-between shadow-md cursor-pointer" onClick={() => navigate("/vendor/dashboard/earnings")}>
        <div>
          <p className="text-green-100 text-xs font-medium mb-0.5">Total Earnings</p>
          <p className="text-white text-2xl font-bold">₦{(o.total_earnings ?? 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/20 rounded-full p-2 w-10 h-10 flex items-center justify-center text-white font-bold text-xl">₦</div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#111813] dark:text-white mb-3">This Week's Growth</h3>
        <div className="flex gap-2">
          {[
            { label: "New Subscribers", value: o.new_subscribers_this_week ?? 0, icon: UserPlus, color: "bg-[#4eb75e]" },
            { label: "Cancelled", value: o.cancelled_subscriptions ?? 0, icon: UserMinus, color: "bg-red-400" },
            { label: "Net Growth", value: `+${o.net_growth ?? 0}`, icon: TrendingUp, color: "bg-blue-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex-1 bg-white dark:bg-surface-dark rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center ${color}`}><Icon size={14} className="text-white" /></div>
              <p className="text-lg font-bold text-[#111813] dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">Subscriber Growth</h3>
          <div className="flex gap-3 text-[10px] font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4eb75e] inline-block" />New</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Lost</span>
          </div>
        </div>
        {growthError ? (
          <p className="text-xs text-gray-400 text-center py-8">Chart unavailable</p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4eb75e" stopOpacity={0.2} /><stop offset="95%" stopColor="#4eb75e" stopOpacity={0} /></linearGradient>
                <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.2} /><stop offset="95%" stopColor="#f87171" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="New" stroke="#4eb75e" strokeWidth={2} fill="url(#newGrad)" dot={false} />
              <Area type="monotone" dataKey="Lost" stroke="#f87171" strokeWidth={2} fill="url(#lostGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#4eb75e]" />
            <h3 className="text-sm font-bold text-[#111813] dark:text-white">Recent Activity</h3>
          </div>
          <button onClick={() => navigate("/vendor/dashboard/subscriptions")} className="flex items-center gap-1 text-[#4eb75e] text-xs font-semibold">
            See all <ChevronRight size={14} />
          </button>
        </div>
        {activityError
          ? <p className="text-xs text-gray-400 text-center py-4">Activity feed unavailable</p>
          : a.length === 0
            ? <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
            : a.slice(0, 5).map((item) => <ActivityRow key={item.id} item={item} />)
        }
      </div>
    </VendorLayout>
  );
};

export default VendorDashboardOverview;