import { forwardRef } from "react";
import { motion } from "framer-motion";

const cardVariants = {
  default: "bg-white dark:bg-surface-dark",
  elevated: "bg-white dark:bg-surface-dark shadow-card hover:shadow-card-hover",
  outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
  filled: "bg-gray-50 dark:bg-background-dark",
  gradient: "bg-gradient-to-br from-lily-50 to-purple-50 dark:from-lily-900/20 dark:to-purple-900/20",
};

const paddingVariants = {
  none: "",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const radiusVariants = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
};

const Card = forwardRef(({
  children,
  variant = "elevated",
  padding = "md",
  radius = "lg",
  isHoverable = false,
  isClickable = false,
  fullWidth = false,
  className = "",
  animate = false,
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    overflow-hidden
    transition-all duration-200 ease-in-out
    ${cardVariants[variant]}
    ${paddingVariants[padding]}
    ${radiusVariants[radius]}
    ${isHoverable ? "hover:scale-[1.02] cursor-pointer" : ""}
    ${isClickable ? "cursor-pointer active:scale-[0.98]" : ""}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={isHoverable ? { y: -4 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// Card subcomponents for structured layouts
export const CardHeader = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(({ children, className = "", as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={`text-lg font-semibold text-text-main-light dark:text-text-main-dark ${className}`}
    {...props}
  >
    {children}
  </Component>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(({ children, className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export default Card;
