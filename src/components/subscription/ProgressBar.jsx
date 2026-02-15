import PropTypes from "prop-types";

/**
 * ProgressBar component showing meal selection progress
 * @param {Object} props - Component props
 * @param {number} props.selectedCount - Number of selected meals
 * @param {number} props.totalRequired - Total meals required for the plan
 */
const ProgressBar = ({ selectedCount, totalRequired }) => {
  const progress = (selectedCount / totalRequired) * 100;
  const remaining = totalRequired - selectedCount;

  return (
    <div className="px-4 pb-4">
      <div className="flex items-end justify-between mb-2">
        <p className="text-text-main dark:text-white text-sm font-semibold">
          {selectedCount} of {totalRequired} meals selected
        </p>
        <p className="text-text-muted text-xs font-medium">
          {remaining > 0 ? `${remaining} more to go` : "Complete!"}
        </p>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#13ec49] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  totalRequired: PropTypes.number.isRequired,
};

export default ProgressBar;
