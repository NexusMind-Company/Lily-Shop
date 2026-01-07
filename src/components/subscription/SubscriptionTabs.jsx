import PropTypes from "prop-types";

/**
 * SubscriptionTabs component for switching between Active and Past subscriptions
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab ('active' or 'past')
 * @param {Function} props.onTabChange - Function to handle tab change
 */
const SubscriptionTabs = ({ activeTab, onTabChange }) => {
  return (
    <section className="px-4 mb-4">
      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl relative">
        {/* Active Tab */}
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "active"
              ? "bg-surface-light dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
          onClick={() => onTabChange("active")}
        >
          Active
        </button>
        {/* Past Tab */}
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "past"
              ? "bg-surface-light dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
          onClick={() => onTabChange("past")}
        >
          Past
        </button>
      </div>
    </section>
  );
};

SubscriptionTabs.propTypes = {
  activeTab: PropTypes.oneOf(["active", "past"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default SubscriptionTabs;
