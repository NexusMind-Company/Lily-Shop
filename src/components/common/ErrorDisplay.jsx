import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";

const ErrorDisplay = ({
  message,
  center = false,
  onRetry,
  retryLabel = "Try Again",
  fullScreen = false,
  className = "",
}) => {
  // Ensure message is a string, provide a fallback
  const displayMessage =
    typeof message === "string" && message
      ? message
      : "An unexpected error occurred.";

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        center || fullScreen
          ? "flex flex-col items-center justify-center text-center"
          : "flex items-center gap-3"
      } ${
        fullScreen
          ? "min-h-[50vh]"
          : center
            ? "p-6"
            : "p-4 rounded-xl bg-error/10 border border-error/20 dark:bg-error/5 dark:border-error/10"
      } ${className}`}
      role="alert"
    >
      <div
        className={`${center || fullScreen ? "w-16 h-16 mb-4" : "w-10 h-10"} rounded-full bg-error/10 flex items-center justify-center`}
      >
        <AlertTriangle
          className={`${center || fullScreen ? "w-8 h-8" : "w-5 h-5"} text-error`}
        />
      </div>

      <div className={center || fullScreen ? "max-w-md" : "flex-1"}>
        <h3
          className={`${center || fullScreen ? "text-lg font-semibold mb-2" : "font-medium"} text-error dark:text-error`}
        >
          {center || fullScreen ? "Oops! Something went wrong" : displayMessage}
        </h3>
        {(center || fullScreen) && (
          <p className="text-gray-600 dark:text-text-secondary-dark text-sm mb-4">
            {displayMessage}
          </p>
        )}
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className={center || fullScreen ? "mt-2" : "ml-auto"}
        >
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-4">
        {content}
      </div>
    );
  }

  return content;
};

export default ErrorDisplay;
