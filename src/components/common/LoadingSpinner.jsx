import { motion } from "framer-motion";

const sizes = {
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const strokeWidths = {
  xs: 3,
  sm: 3,
  md: 3,
  lg: 4,
  xl: 5,
};

const LoadingSpinner = ({
  size = "md",
  color = "lily",
  className = "",
  text,
  fullScreen = false,
}) => {
  const colorClasses = {
    lily: "text-lily",
    white: "text-white",
    gray: "text-gray-500",
    dark: "text-gray-900 dark:text-white",
  };

  const spinner = (
    <motion.svg
      className={`${sizes[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidths[size]}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm z-toast">
        {spinner}
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 dark:text-text-secondary-dark font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {spinner}
      {text && (
        <span className="mt-2 text-sm text-gray-500 dark:text-text-secondary-dark">
          {text}
        </span>
      )}
    </div>
  );
};

// Dots loading animation
export const LoadingDots = ({ size = "md", color = "lily", className = "" }) => {
  const sizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    lily: "bg-lily",
    white: "bg-white",
    gray: "bg-gray-400",
    dark: "bg-gray-900 dark:bg-white",
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} ${colorClasses[color]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Pulse loading animation
export const LoadingPulse = ({ size = "md", color = "lily", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    lily: "bg-lily",
    white: "bg-white",
    gray: "bg-gray-400",
    dark: "bg-gray-900 dark:bg-white",
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <motion.div
        className={`absolute inset-0 ${colorClasses[color]} rounded-full opacity-75`}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className={`absolute inset-0 ${colorClasses[color]} rounded-full`} />
    </div>
  );
};

export default LoadingSpinner;
