import PropTypes from "prop-types";

/**
 * FloatingActionButton component for quick actions
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to handle button click
 */
const FloatingActionButton = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-10">
      <button
        onClick={onClick}
        className="flex items-center justify-center w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
};

FloatingActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FloatingActionButton;
