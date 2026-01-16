import { DollarSign, User } from "lucide-react";
import PropTypes from "prop-types";

/**
 * SubscriptionStats component for displaying subscription statistics
 * @param {Object} props - Component props
 * @param {number} props.activeCount - Number of active subscriptions
 * @param {number} props.weeklyAmount - Total weekly amount
 */
const SubscriptionStats = ({ activeCount, weeklyAmount }) => {
  return (
    <section className="px-4 py-6">
      <div className="grid grid-cols-2 gap-3">
        {/* Active Stat Card */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-[#ffffff] dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-full bg-primary/20 text-green-800 dark:text-primary">
              <User/>
            </div>
            <p className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">
              Active
            </p>
          </div>
          <p className="text-2xl font-bold text-text-main dark:text-white">
            {activeCount}
          </p>
        </div>
        {/* Weekly Stat Card */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-[#ffffff] dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-full bg-primary/20 text-green-800 dark:text-primary">
             <DollarSign/>
            </div>
            <p className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">
              Weekly
            </p>
          </div>
          <p className="text-2xl font-bold text-text-main dark:text-white">
            ${weeklyAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
};

SubscriptionStats.propTypes = {
  activeCount: PropTypes.number.isRequired,
  weeklyAmount: PropTypes.number.isRequired,
};

export default SubscriptionStats;
