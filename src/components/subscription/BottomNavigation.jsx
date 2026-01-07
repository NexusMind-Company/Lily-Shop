import PropTypes from "prop-types";

/**
 * BottomNavigation component for the dashboard
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Function to handle tab changes
 */
const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "orders", icon: "receipt_long", label: "Orders" },
    { id: "add", icon: "add", label: "", isCenter: true },
    { id: "dashboard", icon: "grid_view", label: "Dashboard", fill: true },
    { id: "profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center z-20 absolute bottom-0 w-full">
      {tabs.map((tab) => {
        if (tab.isCenter) {
          return (
            <div key={tab.id} className="relative -top-6">
              <button
                onClick={() => onTabChange(tab.id)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-text-main-light shadow-lg hover:scale-105 transition-transform border-4 border-background-light dark:border-background-dark"
              >
                <span className="material-symbols-outlined text-3xl">
                  {tab.icon}
                </span>
              </button>
            </div>
          );
        }

        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors ${
              isActive ? "text-primary dark:text-primary font-bold" : ""
            }`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                tab.fill && isActive ? "fill-current" : ""
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

BottomNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default BottomNavigation;
