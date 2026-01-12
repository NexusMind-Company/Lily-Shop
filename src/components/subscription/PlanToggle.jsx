import PropTypes from "prop-types";

/**
 * PlanToggle component for switching between weekly and monthly plans
 * @param {Object} props - Component props
 * @param {string} props.selectedPlan - Currently selected plan ('weekly' or 'monthly')
 * @param {Function} props.onPlanChange - Function to handle plan change
 */
const PlanToggle = ({ selectedPlan, onPlanChange }) => {
  return (
    <div className="px-4 py-2">
      <div className="bg-[#ffffff] dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-1 rounded-xl flex relative">
        <button
          onClick={() => onPlanChange("weekly")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-center transition-all ${
            selectedPlan === "weekly"
              ? "bg-[#13ec49] text-green-950 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => onPlanChange("monthly")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition-all relative ${
            selectedPlan === "monthly"
              ? "bg-[#13ec49] text-green-950 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Monthly{" "}
          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-1">
            -15%
          </span>
        </button>
      </div>
    </div>
  );
};

PlanToggle.propTypes = {
  selectedPlan: PropTypes.oneOf(["weekly", "monthly"]).isRequired,
  onPlanChange: PropTypes.func.isRequired,
};

export default PlanToggle;
