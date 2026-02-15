import PropTypes from "prop-types";

/**
 * PlanRecapCard component showing current plan details
 * @param {Object} props - Component props
 * @param {Object} props.plan - Current plan data
 * @param {Function} props.onChange - Function to handle plan change
 */
const PlanRecapCard = ({ plan, onChange }) => {
  if (!plan) return null;

  return (
    <div className="bg-[#ffffff] dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start gap-4">
        <div
          className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${
              plan.image || "https://via.placeholder.com/80"
            }")`,
          }}
        />
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#13ec49] text-xs font-bold uppercase tracking-wider">
                Active Plan
              </p>
              <h3 className="text-text-main dark:text-white text-base font-bold">
                {plan.name}
              </h3>
            </div>
            <button
              onClick={onChange}
              className="text-text-muted hover:text-[#13ec49] text-xs font-medium px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 transition-colors"
            >
              Change
            </button>
          </div>
          <p className="text-text-muted text-sm">
            {plan.mealsPerWeek} meals / week • ₦{plan.price?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

PlanRecapCard.propTypes = {
  plan: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    mealsPerWeek: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
};

export default PlanRecapCard;
