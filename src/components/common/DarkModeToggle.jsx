import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/themeContext";

const DarkModeToggle = ({ size = "md", className = "" }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const sizeClasses = {
    sm: "w-10 h-6",
    md: "w-14 h-8",
    lg: "w-16 h-9",
  };

  const knobSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 18,
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={`
        relative flex items-center rounded-full p-1
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-lily focus:ring-offset-2
        ${sizeClasses[size]}
        ${isDarkMode ? "bg-lily-700" : "bg-gray-200"}
        ${className}
      `}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`
          absolute flex items-center justify-center rounded-full
          bg-white shadow-md
          ${knobSizes[size]}
        `}
        animate={{
          x: isDarkMode ? (size === "sm" ? 16 : size === "md" ? 24 : 28) : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDarkMode ? (
          <Moon size={iconSizes[size]} className="text-lily-700" />
        ) : (
          <Sun size={iconSizes[size]} className="text-amber-500" />
        )}
      </motion.div>
      
      {/* Icons in background */}
      <span className="absolute left-2 text-amber-500">
        <Sun size={iconSizes[size] - 2} className="opacity-50" />
      </span>
      <span className="absolute right-2 text-lily-300">
        <Moon size={iconSizes[size] - 2} className="opacity-50" />
      </span>
    </motion.button>
  );
};

export default DarkModeToggle;
