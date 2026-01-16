import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

/**
 * CustomerSubscriptionHeader component for the customer subscriptions page
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 */
const CustomerSubscriptionHeader = ({ onBack }) => {
  return (
    <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          aria-label="Go back"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white"
          onClick={onBack}
        >
         <ArrowLeft/>
        </button>
        <h1 className="text-lg font-bold text-text-main dark:text-white tracking-tight">
          My Subscriptions
        </h1>
        <div className="w-10"></div> {/* Spacer for optical centering */}
      </div>
    </header>
  );
};

CustomerSubscriptionHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default CustomerSubscriptionHeader;
