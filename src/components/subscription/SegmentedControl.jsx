import PropTypes from "prop-types";

/**
 * SegmentedControl component for switching between tabs
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Array} props.tabs - Array of tab objects
 * @param {Function} props.onTabChange - Function to handle tab change
 */
const SegmentedControl = ({ activeTab, tabs, onTabChange }) => {
  return (
    <section className="px-4 mb-4">
      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-[#ffffff] dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
};

SegmentedControl.propTypes = {
  activeTab: PropTypes.string.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default SegmentedControl;
