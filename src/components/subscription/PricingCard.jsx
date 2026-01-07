import PropTypes from "prop-types";

/**
 * PricingCard component for displaying meal plan options
 * @param {Object} props - Component props
 * @param {Object} props.plan - Plan data
 * @param {boolean} props.isSelected - Whether this plan is selected
 * @param {boolean} props.isPopular - Whether this is the most popular plan
 * @param {Function} props.onSelect - Function to handle plan selection
 */
const PricingCard = ({ plan, isSelected, isPopular, onSelect }) => {
  return (
    <div className="relative group cursor-pointer">
      <input
        className="peer sr-only"
        id={`plan_${plan.id}`}
        name="plan"
        type="radio"
        checked={isSelected}
        onChange={() => onSelect(plan.id)}
      />
      <label
        className={`flex flex-col gap-4 rounded-2xl border-2 p-5 shadow-sm transition-all ${
          isSelected
            ? "border-primary bg-surface-light dark:bg-surface-dark shadow-[0_4px_20px_-4px_rgba(19,236,73,0.15)]"
            : "border-transparent bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-opacity-80"
        }`}
        htmlFor={`plan_${plan.id}`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-primary text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {plan.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {plan.description}
            </p>
          </div>
          <div
            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "border-primary bg-primary"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {isSelected ? (
              <span className="material-symbols-outlined text-green-950 text-[16px] font-bold">
                check
              </span>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">
            ${plan.price}
          </span>
          <span className="text-sm font-bold text-slate-400">
            /{plan.period}
          </span>
        </div>
        <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
        <div className="flex flex-col gap-2.5">
          {plan.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">
                check_circle
              </span>
              {feature}
            </div>
          ))}
        </div>
      </label>
    </div>
  );
};

PricingCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    period: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isPopular: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export default PricingCard;
