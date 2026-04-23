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
      <div className="bg-white border border-slate-200 p-1 rounded-xl flex relative">
        <button
          onClick={() => onPlanChange("weekly")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-center transition-all ${
            selectedPlan === "weekly"
              ? "bg-lily text-white shadow-sm"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => onPlanChange("monthly")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition-all relative ${
            selectedPlan === "monthly"
              ? "bg-lily text-white shadow-sm"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          Monthly{" "}
          <span className="text-[10px] bg-lily/10 text-darklily px-1.5 py-0.5 rounded ml-1">
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
