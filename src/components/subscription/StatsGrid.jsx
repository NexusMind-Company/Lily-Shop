import PropTypes from "prop-types";
import {  DollarSign, UsersRound } from "lucide-react";

/**
 * StatsGrid component displaying subscription statistics
 * @param {Object} props - Component props
 * @param {Object} props.stats - Stats data object
 */
const StatsGrid = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      icon: UsersRound,
      label: "Active",
      value: stats.activeCount,
      color: "primary",
    },
    {
      icon: DollarSign,
      label: "Weekly",
      value: `$${stats.weeklyRevenue?.toLocaleString()}`,
      color: "primary",
    },
  ];

  return (
    <section className="px-4 py-6">
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-full h-7 w-7 bg-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  <Icon className="w-5 h-5" />
                </div>

                <p className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>

              <p className="text-2xl font-bold text-text-main dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

StatsGrid.propTypes = {
  stats: PropTypes.shape({
    activeCount: PropTypes.number.isRequired,
    weeklyRevenue: PropTypes.number.isRequired,
  }),
};

export default StatsGrid;
