import React from "react";
import PropTypes from "prop-types";

/**
 * InfoBox component for displaying informational messages.
 * @param {Object} props - The component props.
 * @param {string} props.icon - The material symbol icon name.
 * @param {string} props.message - The message to display.
 */
const InfoBox = ({ icon, message }) => {
  return (
    <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
      <div className="text-blue-600 dark:text-blue-400 shrink-0">
        {icon}
      </div>
      <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
        {message}
      </p>
    </div>
  );
};

InfoBox.propTypes = {
  icon: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default InfoBox;
