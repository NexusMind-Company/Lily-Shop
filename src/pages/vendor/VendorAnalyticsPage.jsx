import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Lightbulb } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import { fetchVendorAnalytics } from "../../services/vendorDashboardApi";

const COLORS = ["#4eb75e", "#3da64d", "#6dd47e", "#9be8a8", "#c6f5ce"];
const PERIODS = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
];

const VendorAnalyticsPage = () => {
  const [period, setPeriod] = useState("monthly");

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendorAnalytics", period],
    queryFn: () => fetchVendorAnalytics(period),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading && !analytics)
    return (
      <VendorLayout title="Analytics">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError && !analytics)
    return (
      <VendorLayout title="Analytics">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  const a = analytics;

  return (
    <VendorLayout title="Analytics">
      <div className="flex gap-1.5 mb-4">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${period === key ? "bg-[#4eb75e] text-white shadow-sm" : "bg-white  border border-gray-100  text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isError && (
        <div className="bg-orange-50  border border-orange-100  rounded-xl px-4 py-2 flex items-center justify-between mb-4">
          <p className="text-xs text-orange-600">Showing cached data</p>
          <button
            onClick={refetch}
            className="text-xs text-[#4eb75e] font-semibold"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          {
            label: "Growth Rate",
            value: `${a.subscriber_growth_rate ?? 0}%`,
            icon: TrendingUp,
            color: "bg-[#4eb75e]",
            sub: "vs last period",
          },
          {
            label: "Retention Rate",
            value: `${a.retention_rate ?? 0}%`,
            icon: Users,
            color: "bg-blue-500",
            sub: "customers renewing",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  flex flex-col gap-2"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-[#111813] ">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-[10px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Retention Donut */}
      <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  mb-4">
        <h3 className="text-sm font-bold text-[#111813]  mb-4">
          Retention vs Churn
        </h3>
        <div className="flex items-center gap-4">
          <PieChart width={120} height={120}>
            <Pie
              data={[
                { value: a.retention_rate ?? 0 },
                { value: a.churn_rate ?? 0 },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill="#4eb75e" />
              <Cell fill="#fee2e2" />
            </Pie>
          </PieChart>
          <div className="flex-1 space-y-3">
            {[
              {
                label: "Retention",
                value: `${a.retention_rate ?? 0}%`,
                color: "#4eb75e",
                bg: "bg-[#4eb75e]",
              },
              {
                label: "Churn",
                value: `${a.churn_rate ?? 0}%`,
                color: "#f87171",
                bg: "bg-red-200",
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${bg}`} />
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
                <p className="text-xl font-bold ml-4" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal Popularity */}
      <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  mb-4">
        <h3 className="text-sm font-bold text-[#111813]  mb-4">
          Meal Popularity
        </h3>
        {(a.meal_popularity ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No meal data yet
          </p>
        ) : (
          (a.meal_popularity ?? []).map((meal, i) => (
            <div key={meal.meal_name} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-semibold text-[#111813] ">
                  {meal.meal_name}
                </p>
                <p className="text-xs font-bold text-[#4eb75e]">
                  {meal.percentage}%
                </p>
              </div>
              <div className="w-full h-2 bg-gray-100  rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${meal.percentage}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {meal.order_count} orders
              </p>
            </div>
          ))
        )}
      </div>

      {/* Ingredient Insights */}
      <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-yellow-500" />
          <h3 className="text-sm font-bold text-[#111813] ">
            Ingredient Insights
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          What customers frequently ask to remove
        </p>
        {(a.ingredient_insights ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No data yet</p>
        ) : (
          <>
            {(a.ingredient_insights ?? []).map((item) => (
              <div
                key={item.ingredient}
                className="flex items-center gap-3 mb-3"
              >
                <p className="text-sm font-semibold text-[#111813]  w-20 flex-shrink-0">
                  {item.ingredient}
                </p>
                <div className="flex-1 h-2 bg-gray-100  rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${item.removal_rate ?? 0}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-orange-500 w-10 text-right">
                  {item.removal_rate}%
                </p>
              </div>
            ))}
            {(a.ingredient_insights ?? [])[0] && (
              <div className="bg-yellow-50  rounded-xl px-3 py-2 mt-2">
                <p className="text-xs text-yellow-700 ">
                  💡 {a.ingredient_insights[0].removal_rate}% of customers
                  remove {a.ingredient_insights[0].ingredient?.toLowerCase()}.
                  Consider offering an option without it!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Plans */}
      <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-50 ">
          <h3 className="text-sm font-bold text-[#111813] ">
            Top Performing Plans
          </h3>
        </div>
        {(a.top_performing_plans ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No plan data yet
          </p>
        ) : (
          (a.top_performing_plans ?? []).map((plan, i) => (
            <div
              key={plan.plan_name}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50  last:border-0"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111813]  truncate">
                  {plan.plan_name}
                </p>
                <p className="text-xs text-gray-400">
                  {plan.subscribers} subscribers
                </p>
              </div>
              <p className="text-sm font-bold text-[#4eb75e] flex-shrink-0">
                ₦{(plan.revenue ?? 0).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorAnalyticsPage;
