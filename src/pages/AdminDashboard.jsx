import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { TrendingUp, Users, Store, Wallet, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import api from "../services/api";

const COLORS = ['#4eb75e', '#13ec49', '#f59e0b', '#6366f1', '#ec4899'];

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['adminStatistics', startDate, endDate],
    queryFn: async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await api.get('/foods/admin/statistics/', { params });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-background-dark p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-background-dark p-6 flex items-center justify-center">
        <div className="text-red-500">Error loading admin dashboard: {error.message}</div>
      </div>
    );
  }

  const stats = {
    totalRevenue: adminData?.total_revenue || 0,
    lilyshopsShare: adminData?.lilyshops_share || 0,
    lilyshopsPercentage: adminData?.lilyshops_percentage || 10,
    totalVendors: adminData?.total_vendors || 0,
    totalCustomers: adminData?.total_customers || 0,
    totalSubscriptions: adminData?.total_subscriptions || 0,
    monthlyGrowth: adminData?.monthly_growth || 0,
  };

  const revenueData = adminData?.monthly_data || [];
  const subscriptionData = adminData?.subscription_data || [];

  const formatCurrency = (value) => {
    return `₦${(value / 1000000).toFixed(1)}M`;
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8f6] dark:bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lilyshops Admin Dashboard</h1>
          <p className="text-gray-500 mb-4">Platform overview and revenue analytics</p>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-surface-dark rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
                placeholder="Start Date"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-surface-dark rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
                placeholder="End Date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={Wallet}
            color="bg-[#4eb75e]"
            trend="up"
            trendValue={stats.monthlyGrowth}
          />
          <StatCard
            title="Lilyshops Share (15%)"
            value={formatCurrency(stats.lilyshopsShare)}
            icon={TrendingUp}
            color="bg-[#13ec49]"
            trend="up"
            trendValue={stats.monthlyGrowth}
          />
          <StatCard
            title="Total Vendors"
            value={stats.totalVendors}
            icon={Store}
            color="bg-purple-500"
            trend="up"
            trendValue={8.2}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            color="bg-blue-500"
            trend="up"
            trendValue={15.3}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.totalSubscriptions}
            icon={Wallet}
            color="bg-orange-500"
            trend="up"
            trendValue={12.1}
          />
          <StatCard
            title="Revenue Share"
            value={`${stats.lilyshopsPercentage}%`}
            icon={TrendingUp}
            color="bg-pink-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#4eb75e" radius={[4, 4, 0, 0]} name="Total Revenue" />
                <Bar dataKey="lilyshops" fill="#13ec49" radius={[4, 4, 0, 0]} name="Lilyshops Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Subscription Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Table */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Monthly Revenue Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Total Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Lilyshops Share (15%)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Vendor Payout (85%)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Growth</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.revenue)}</td>
                    <td className="py-4 px-4 text-sm text-right text-green-600 font-semibold">{formatCurrency(item.lilyshops)}</td>
                    <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.revenue - item.lilyshops)}</td>
                    <td className="py-4 px-4 text-sm text-right">
                      <span className="text-green-600 font-semibold">
                        +{index > 0 ? ((item.revenue - revenueData[index - 1].revenue) / revenueData[index - 1].revenue * 100).toFixed(1) : '0'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
