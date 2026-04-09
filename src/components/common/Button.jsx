import { forwardRef } from "react";
import { motion } from "framer-motion";

const buttonVariants = {
  primary: "bg-lily text-white hover:bg-lily-dark active:bg-lily-700 focus:ring-lily-300",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-300 dark:bg-surface-dark dark:text-text-main-dark dark:hover:bg-gray-700",
  outline: "bg-transparent border-2 border-lily text-lily hover:bg-lily-50 active:bg-lily-100 focus:ring-lily-300 dark:hover:bg-lily-900/20",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300 dark:text-text-secondary-dark dark:hover:bg-surface-dark",
  danger: "bg-error text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-300",
  success: "bg-success text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-300",
};

const sizeVariants = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

const radiusVariants = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  radius = "full",
  isLoading = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = "",
  animate = true,
  type = "button",
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
    ${buttonVariants[variant]}
    ${sizeVariants[size]}
    ${radiusVariants[radius]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </>
  );

  if (animate) {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={baseClasses}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        whileHover={{ scale: isDisabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
