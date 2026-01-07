import PropTypes from "prop-types";

/**
 * DashboardHeader component for the vendor dashboard
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 * @param {Function} props.onHelp - Function to handle help action
 */
const DashboardHeader = ({ onBack, onHelp }) => {
  return (
    <header className="flex items-center justify-between px-6 pt-12 pb-4 bg-surface-light dark:bg-surface-dark sticky top-0 z-20 shadow-sm">
      <button
        onClick={onBack}
        className="text-text-main-light dark:text-text-main-dark flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">
        Dashboard
      </h1>
      <button
        onClick={onHelp}
        className="text-text-secondary-light dark:text-text-secondary-dark font-semibold text-sm hover:text-primary transition-colors"
      >
        Help
      </button>
    </header>
  );
};

DashboardHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  onHelp: PropTypes.func.isRequired,
};

export default DashboardHeader;
