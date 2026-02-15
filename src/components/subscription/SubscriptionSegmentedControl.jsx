import PropTypes from "prop-types";

/**
 * SubscriptionSegmentedControl component for switching between Active and Past subscriptions
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab ('active' or 'past')
 * @param {Function} props.onTabChange - Function to handle tab change
 */
const SubscriptionSegmentedControl = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <div className="flex p-1 bg-gray-200/50 dark:bg-surface-dark rounded-xl relative">
        <label className="flex-1 relative cursor-pointer group">
          <input
            checked={activeTab === "active"}
            className="peer sr-only"
            name="sub_type"
            type="radio"
            value="active"
            onChange={() => onTabChange("active")}
          />
          <div className="flex items-center justify-center py-2.5 px-4 rounded-[10px] text-sm font-bold text-text-sub dark:text-gray-400 transition-all duration-200 peer-checked:bg-white dark:peer-checked:bg-background-dark peer-checked:text-text-main dark:peer-checked:text-white peer-checked:shadow-sm">
            Active
          </div>
        </label>
        <label className="flex-1 relative cursor-pointer group">
          <input
            checked={activeTab === "past"}
            className="peer sr-only"
            name="sub_type"
            type="radio"
            value="past"
            onChange={() => onTabChange("past")}
          />
          <div className="flex items-center justify-center py-2.5 px-4 rounded-[10px] text-sm font-bold text-text-sub dark:text-gray-400 transition-all duration-200 peer-checked:bg-white dark:peer-checked:bg-background-dark peer-checked:text-text-main dark:peer-checked:text-white peer-checked:shadow-sm">
            Past
          </div>
        </label>
      </div>
    </div>
  );
};

SubscriptionSegmentedControl.propTypes = {
  activeTab: PropTypes.oneOf(["active", "past"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default SubscriptionSegmentedControl;
