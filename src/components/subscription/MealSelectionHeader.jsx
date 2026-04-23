import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

/**
 * MealSelectionHeader component for the meal selection page
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 * @param {Function} props.onFilter - Function to handle filter action
 */
const MealSelectionHeader = ({ onBack, _onFilter }) => {
  return (
    <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center p-4 justify-between">
        <button
          onClick={onBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
        >
          <ArrowLeft />
        </button>
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
          Customize Your Plan
        </h2>
      </div>
    </header>
  );
};

MealSelectionHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  _onFilter: PropTypes.func,
};

export default MealSelectionHeader;
