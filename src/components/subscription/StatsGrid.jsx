import PropTypes from "prop-types";

/**
 * StatsGrid component displaying subscription statistics
 * @param {Object} props - Component props
 * @param {Object} props.stats - Stats data object
 */
const StatsGrid = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      icon: "group",
      label: "Active",
      value: stats.activeCount,
      color: "primary",
    },
    {
      icon: "attach_money",
      label: "Weekly",
      value: `$${stats.weeklyRevenue?.toLocaleString()}`,
      color: "primary",
    },
  ];

  return (
    <section className="px-4 py-6">
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 rounded-xl p-5 bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-full bg-${stat.color}/20 text-green-800 dark:text-${stat.color}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {stat.icon}
                </span>
              </div>
              <p className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-bold text-text-main dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
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
