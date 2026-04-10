import { UtensilsCrossed } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFeed } from "../../context/feedContext";

const BottomNav = ({ activePage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerHomeRefresh } = useFeed();

  const navItems = [
    { id: "home", label: "Home", path: "/", icon: "home" },
    { id: "create", label: "Create", path: "/createContent", icon: "create" },
    { id: "food", label: "Food", path: "/food", icon: "food" },
    { id: "inbox", label: "Inbox", path: "/inbox", icon: "inbox" },
    { id: "profile", label: "Profile", path: "/profile", icon: "profile" },
  ];

  const handleHomeClick = () => {
    triggerHomeRefresh();

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex md:hidden justify-around items-center bg-white dark:bg-surface-dark h-[70px] pt-1 pb-2 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] fixed bottom-0 left-0 w-full z-sticky border-t border-gray-100 dark:border-gray-700 transition-colors duration-300"
    >
      {navItems.map((item) => {
        const isActive = activePage === item.id;

        if (item.id === "home") {
          return (
            <button
              key={item.id}
              type="button"
              onClick={handleHomeClick}
              className={`flex flex-col items-center justify-center relative flex-1 h-full ${
                isActive ? "text-lily" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <motion.div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-lily/10 dark:bg-lily/20 -mt-4 shadow-lg shadow-lily/20"
                    : "hover:bg-gray-50 dark:hover:bg-surface-dark"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6"
                  fill={isActive ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </motion.div>
              <span
                className={`text-xs font-medium mt-1 transition-all duration-300 ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-70"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-lily"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center justify-center relative flex-1 h-full ${
              isActive ? "text-lily" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-lily/10 dark:bg-lily/20 -mt-4 shadow-lg shadow-lily/20"
                  : "hover:bg-gray-50 dark:hover:bg-surface-dark"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {item.icon === "home" && (
                <svg
                  className="w-6 h-6"
                  fill={isActive ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              )}
              {item.icon === "create" && (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
                </svg>
              )}
              {item.icon === "food" && (
                <UtensilsCrossed className="w-6 h-6" />
              )}
              {item.icon === "inbox" && (
                <div className="relative">
                  <svg
                    className="w-6 h-6"
                    fill={isActive ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lily rounded-full border-2 border-white dark:border-surface-dark" />
                </div>
              )}
              {item.icon === "profile" && (
                <svg
                  className="w-6 h-6"
                  fill={isActive ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </motion.div>
            <span
              className={`text-xs font-medium mt-1 transition-all duration-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-70"
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-lily"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </motion.div>
  );
};

export default BottomNav;
