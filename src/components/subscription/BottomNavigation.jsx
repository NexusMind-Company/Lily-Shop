import { Grid, Home, Plus, Receipt, User } from "lucide-react";
import PropTypes from "prop-types";

/**
 * BottomNavigation component for the dashboard
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Function to handle tab changes
 */
const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "orders", icon: Receipt, label: "Orders" },
    { id: "add", icon: Plus, label: "", isCenter: true },
    { id: "dashboard", icon: Grid, label: "Dashboard", fill: true },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="bg-[#ffffff] dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center z-20 absolute bottom-0 w-full">
      {tabs.map((tab) => {
        if (tab.isCenter) {
          return (
            <div key={tab.id} className="relative -top-6">
              <button
                onClick={() => onTabChange(tab.id)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-[#13ec49] text-[#111813]  shadow-lg hover:scale-105 transition-transform border-4 border-[#f6f8f6] dark:border-background-dark"
              >
                <div className=" text-3xl">
                  {tab.icon}
                </div>
              </button>
            </div>
          );
        }

        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 text-[#61896b] dark:text-text-secondary-dark hover:text-[#13ec49] dark:hover:text-[#13ec49] transition-colors ${
              isActive ? "text-[#13ec49] dark:text-[#13ec49] font-bold" : ""
            }`}
          >
            <div
              className={` text-2xl ${
                tab.fill && isActive ? "fill-current" : ""
              }`}
            >
              {tab.icon}
            </div>
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
