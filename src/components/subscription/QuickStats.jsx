import PropTypes from "prop-types";

/**
 * QuickStats component displaying key subscription metrics
 * @param {Object} props - Component props
 * @param {Object} props.stats - Stats data object
 */
const QuickStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      icon: "group",
      value: stats.activeSubs,
      label: "Active Subs",
      color: "blue",
    },
    {
      icon: "payments",
      value: `$${stats.revenue}`,
      label: "Revenue",
      color: "green",
    },
    {
      icon: "receipt_long",
      value: stats.pending,
      label: "Pending",
      color: "orange",
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-soft flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-800"
        >
          <div
            className={`p-2 bg-${item.color}-50 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-full mb-1`}
          >
            <span className="material-symbols-outlined text-xl">
              {item.icon}
            </span>
          </div>
          <span className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
            {item.value}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
            {item.label}
          </span>
        </div>
      ))}
    </section>
  );
};

QuickStats.propTypes = {
  stats: PropTypes.shape({
    activeSubs: PropTypes.number.isRequired,
    revenue: PropTypes.string.isRequired,
    pending: PropTypes.number.isRequired,
  }),
};

export default QuickStats;
