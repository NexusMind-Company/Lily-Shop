import { ArrowLeft, FilterIcon } from "lucide-react";
import PropTypes from "prop-types";

/**
 * SubscriptionsHeader component for the subscriptions overview page
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 * @param {Function} props.onFilter - Function to handle filter action
 */
const SubscriptionsHeader = ({ onBack, onFilter }) => {
  return (
    <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-3 flex items-center justify-between">
      <button
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-text-main dark:text-white transition-colors"
        onClick={onBack}
      >
        <ArrowLeft/>
      </button>
      <h1 className="text-lg font-bold tracking-tight text-center">
        Subscriptions
      </h1>
      <button
        className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-text-main dark:text-white transition-colors"
        onClick={onFilter}
      >
        <FilterIcon/>
      </button>
    </header>
  );
};

SubscriptionsHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
};

export default SubscriptionsHeader;
