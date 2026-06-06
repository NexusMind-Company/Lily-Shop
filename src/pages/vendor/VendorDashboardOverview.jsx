import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  UserPlus,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Settings,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  fetchVendorDashboardOverview,
  fetchSubscriberGrowth,
  fetchRecentActivity,
} from "../../services/vendorDashboardApi";
import { fetchVendorProfileFormData } from "../../services/api";
import VendorEditProfileForm from "../../components/vendor/VendorEditProfileForm";
import VendorDashboardHeader from "../../components/vendor/VendorDashboardHeader";

const StatCard = ({ icon: Icon, label, value, color, sub, subUp }) => (
  // ... (StatCard implementation remains same)
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-900 flex flex-col gap-2">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-black">{value}</p>
    <p className="text-xs text-black font-medium">{label}</p>
    {sub && (
      <div
        className={`flex items-center gap-1 text-xs font-semibold ${subUp ? "text-lily" : "text-red-500"}`}
      >
        {subUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {sub}
      </div>
    )}
  </div>
);

const ActivityRow = ({ item }) => {
  // ... (ActivityRow implementation remains same)
  const colorMap = {
    subscribed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    renewed: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-900 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-lily">
        {item.customer_name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black truncate">
          {item.customer_name}
        </p>
        <p className="text-xs text-black truncate">{item.meal_plan}</p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${colorMap[item.action] ?? "bg-gray-100 text-gray-600"}`}
      >
        {item.action}
      </span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  // ... (CustomTooltip implementation remains same)
  if (active && payload?.length) {
    return (
      <div className="bg-white shadow-lg rounded-xl px-3 py-2 text-xs border border-gray-900">
        <p className="text-black mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
const VendorDashboardOverview = () => {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [headerStyle, setHeaderStyle] = useState(() => {
    return localStorage.getItem("vendorHeaderStyle") || "hero";
  });

  const toggleHeaderStyle = () => {
    const newStyle = headerStyle === "hero" ? "compact" : "hero";
    setHeaderStyle(newStyle);
    localStorage.setItem("vendorHeaderStyle", newStyle);
  };

  const { data: vendorProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["vendorProfileFormData"],
    queryFn: fetchVendorProfileFormData,
  });

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

  const { data: growth, isError: growthError } = useQuery({
    queryKey: ["subscriberGrowth", "weekly"],
    queryFn: () => fetchSubscriberGrowth("weekly"),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activity, isError: activityError } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: fetchRecentActivity,
    staleTime: 1000 * 30,
  });

  // Show skeleton only on the very first load (no placeholder data yet)
  if (overviewLoading && !overview) {
    return (
      <VendorLayout title="Overview">
        <VendorPageLoader />
      </VendorLayout>
    );
  }

  // Only block the page if the primary data failed AND we have nothing to show
  if (overviewError && !overview) {
    return (
      <VendorLayout title="Overview">
        <VendorPageError
          message={getErrorMessage(overviewErr)}
          onRetry={refetchOverview}
        />
      </VendorLayout>
    );
  }

  const o = overview ?? {};
  const g = growth ?? {};
  const a = activity ?? [];

  const chartData = (g?.labels ?? []).map((label, i) => ({
    name: label,
    New: g.new_subscribers?.[i] ?? 0,
    Lost: g.lost_subscribers?.[i] ?? 0,
  }));

  if (showEditProfile) {
    return (
      <VendorLayout
        title="Edit Profile"
        showBack
        onBack={() => setShowEditProfile(false)}
      >
        <div className="w-full mx-auto">
          <VendorEditProfileForm
            onCancel={() => setShowEditProfile(false)}
            onSuccess={() => {
              setShowEditProfile(false);
              refetchOverview();
              refetchProfile();
            }}
          />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout title="Overview">
      <VendorDashboardHeader
        profile={vendorProfile}
        style={headerStyle}
        onToggle={toggleHeaderStyle}
        onEdit={() => setShowEditProfile(true)}
      />

      {(growthError || activityError) && (
        <div className="bg-white border border-gray-900 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-xs text-black">
            ⚠️ Some data couldn't refresh — showing last known values.
          </p>
        </div>
      )}

      {/* Top Section: Quick Actions & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        {/* Quick Actions - Left on Desktop */}
        <div className="md:col-span-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-900 h-full">
            <h3 className="text-sm font-bold text-black mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex flex-col items-center justify-center gap-2 px-3 py-6 rounded-xl bg-lily hover:bg-lily/90 transition-colors text-center"
              >
                <Edit3 size={20} className="text-white" />
                <span className="text-[10px] font-semibold text-white">
                  Edit Profile
                </span>
              </button>
              <button
                onClick={() => navigate("/vendor/dashboard/subscriptions")}
                className="flex flex-col items-center justify-center gap-2 px-3 py-6 rounded-xl bg-lily hover:bg-lily/90 transition-colors text-center"
              >
                <Users size={20} className="text-white" />
                <span className="text-[10px] font-semibold text-white">
                  View Subscribers
                </span>
              </button>
              <button
                onClick={() => navigate("/vendor/plans")}
                className="flex flex-col items-center justify-center gap-2 px-3 py-6 rounded-xl bg-lily hover:bg-lily/90 transition-colors text-center"
              >
                <Settings size={20} className="text-white" />
                <span className="text-[10px] font-semibold text-white">
                  Manage Plans
                </span>
              </button>
              <button
                onClick={() => navigate("/subscription/create-meal-plan")}
                className="flex flex-col items-center justify-center gap-2 px-3 py-6 rounded-xl bg-lily hover:bg-lily/90 transition-colors text-center"
              >
                <Plus size={20} className="text-white" />
                <span className="text-[10px] font-semibold text-white">
                  Add Plan
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Right on Desktop */}
        <div className="md:col-span-8">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={ShoppingBag}
              label="Today's Subscriptions"
              value={o.today_subscriptions ?? o.today_orders ?? "—"}
              color="bg-lily"
              sub={
                o.net_growth > 0
                  ? `+${o.net_growth} vs yesterday`
                  : `${o.net_growth} vs yesterday`
              }
              subUp={o.net_growth > 0}
            />
            <StatCard
              icon={Users}
              label="This Week's Subscriptions"
              value={o.this_week_subscriptions ?? o.active_subscriptions ?? "—"}
              color="bg-blue-500"
              sub={`+${o.new_subscribers_this_week ?? 0} this week`}
              subUp
            />
            <StatCard
              icon={TrendingUp}
              label="Weekly Revenue"
              value={`₦${(o.weekly_revenue ?? 0).toLocaleString()}`}
              color="bg-purple-500"
              sub={o.weekly_revenue > 0 ? "↑ Revenue" : "No revenue"}
              subUp={o.weekly_revenue > 0}
            />
            <StatCard
              icon={UserPlus}
              label="New Subscribers"
              value={o.new_subscribers_this_week ?? 0}
              color="bg-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Subscriber Growth Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-900 mb-4">
        <h3 className="text-sm font-bold text-black mb-4">Subscriber Growth</h3>
        {growthError ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Chart unavailable
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4eb75e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4eb75e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="New"
                stroke="#4eb75e"
                strokeWidth={2}
                fill="url(#newGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Lost"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#lostGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-lily" />
            <h3 className="text-sm font-bold text-black">Recent Activity</h3>
          </div>
          <button
            onClick={() => navigate("/vendor/dashboard/subscriptions")}
            className="flex items-center gap-1 text-lily text-xs font-semibold"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        {activityError ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Activity feed unavailable
          </p>
        ) : !a || a.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          a.slice(0, 5).map((item) => <ActivityRow key={item.id} item={item} />)
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorDashboardOverview;
