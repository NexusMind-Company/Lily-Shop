import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi'; // Example icon

const ErrorDisplay = ({ message, center = false }) => {
  // Ensure message is a string, provide a fallback
  const displayMessage = typeof message === 'string' && message ? message : 'An unexpected error occurred.';

  // Base classes
  let containerClasses = 'p-3 text-red-700 bg-red-100 rounded-md border border-red-300 flex items-center gap-2';

  // Centering classes
  if (center) {
    containerClasses = 'flex flex-col items-center justify-center text-center p-4 text-red-700';
  }

  return (
    <div className={containerClasses} role="alert">
      <FiAlertTriangle className={`w-5 h-5 flex-shrink-0 ${center ? 'mb-2' : ''}`} />
      <span>{displayMessage}</span>
    </div>
  );
};

export default ErrorDisplay; 