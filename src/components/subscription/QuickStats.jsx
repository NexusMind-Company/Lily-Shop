import { CreditCard, Receipt, User } from "lucide-react";
import PropTypes from "prop-types";

/**
 * QuickStats component displaying key subscription metrics
 * @param {Object} props - Component props
 * @param {Object} props.stats - Stats data object
 */
const QuickStats = ({ stats }) => {
  if (!stats) return null;

  const colorMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};


  const statItems = [
    {
      IconComponent: User,
      value: stats.activeSubs,
      label: "Active Subs",
      color: colorMap.blue,
    },
    {
      IconComponent: CreditCard,
      value: `$${stats.revenue}`,
      label: "Revenue",
      color: colorMap.green,
    },
    {
      IconComponent: Receipt,
      value: stats.pending,
      label: "Pending",
      color: colorMap.orange,
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-[#ffffff] dark:bg-surface-dark p-4 rounded-2xl shadow-soft flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-800"
        >
          <div
            className={`p-2 ${item.color} rounded-full mb-1`}
          >
            <item.IconComponent className="text-xl" />
          </div>
          <span className="text-2xl font-bold text-[#111813]  dark:text-text-main-dark">
            {item.value}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#61896b] dark:text-text-secondary-dark">
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
