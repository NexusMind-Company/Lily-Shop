// import { Check, CheckCircle } from "lucide-react";
// import PropTypes from "prop-types";

// /**
//  * PricingCard component for displaying meal plan options
//  * @param {Object} props - Component props
//  * @param {Object} props.plan - Plan data
//  * @param {boolean} props.isSelected - Whether this plan is selected
//  * @param {boolean} props.isPopular - Whether this is the most popular plan
//  * @param {Function} props.onSelect - Function to handle plan selection
//  */
// const PricingCard = ({ plan, isSelected, isPopular, onSelect }) => {
//   return (
//     <div className="relative group cursor-pointer">
//       <input
//         className="peer sr-only"
//         id={`plan_${plan.id}`}
//         name="plan"
//         type="radio"
//         checked={isSelected}
//         onChange={() => onSelect(plan.id)}
//       />
//       <label
//         className={`flex flex-col gap-4 rounded-2xl border-2 p-5 shadow-sm transition-all ${
//           isSelected
//             ? "border-[#13ec49] bg-[#ffffff] dark:bg-surface-dark shadow-[0_4px_20px_-4px_rgba(19,236,73,0.15)]"
//             : "border-transparent bg-[#ffffff] dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-opacity-80"
//         }`}
//         htmlFor={`plan_${plan.id}`}
//       >
//         {isPopular && (
//           <div className="absolute top-0 right-0 bg-[#13ec49] text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
//             Most Popular
//           </div>
//         )}
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//               {plan.name}
//             </h3>
//             <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
//               {plan.description}
//             </p>
//           </div>
//           <div
//             className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
//               isSelected
//                 ? "border-[#13ec49] bg-primary"
//                 : "border-slate-300 dark:border-slate-600"
//             }`}
//           >
//             {isSelected ? (
//               <Check/>
//             ) : (
//               <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
//             )}
//           </div>
//         </div>
//         <div className="flex items-baseline gap-1">
//           <span className="text-3xl font-black tracking-tight">
//             ${plan.price}
//           </span>
//           <span className="text-sm font-bold text-slate-400">
//             /{plan.period}
//           </span>
//         </div>
//         <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
//         <div className="flex flex-col gap-2.5">
//           {plan.features.map((feature, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
//             >
//                <CheckCircle/>
//               {feature}
//             </div>
//           ))}
//         </div>
//       </label>
//     </div>
//   );
// };

// PricingCard.propTypes = {
//   plan: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     description: PropTypes.string,
//     price: PropTypes.number.isRequired,
//     period: PropTypes.string.isRequired,
//     features: PropTypes.arrayOf(PropTypes.string).isRequired,
//   }).isRequired,
//   isSelected: PropTypes.bool.isRequired,
//   isPopular: PropTypes.bool,
//   onSelect: PropTypes.func.isRequired,
// };

// export default PricingCard;


import { Check, CheckCircle } from "lucide-react";
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
  // Map API fields to component expectations
  const planName = plan.plan_name || plan.name || 'Unnamed Plan';
  const planPrice = plan.price || 0;
  const planDescription = plan.description || '';
  const planFrequency = plan.frequency || 'week';
  const mealsPerCycle = plan.meals_per_cycle || plan.meal_per_cycle || 0;
  
  // Generate features from available data
  const features = [
    `${mealsPerCycle} meals per ${planFrequency}`,
    plan.trial_days > 0 ? `${plan.trial_days} days free trial` : null,
    'Flexible delivery schedule',
    'Cancel anytime'
  ].filter(Boolean); // Remove null values

  return (
    <div className="relative group cursor-pointer">
      <input
        className="peer sr-only"
        id={`plan_${safePlan.id}`}
        name="plan"
        type="radio"
        checked={isSelected}
        onChange={() => onSelect(safePlan.id)}
      />
      <label
        className={`flex flex-col gap-4 rounded-2xl border-2 p-5 shadow-sm transition-all ${
          isSelected
            ? "border-[#13ec49] bg-[#ffffff] dark:bg-surface-dark shadow-[0_4px_20px_-4px_rgba(19,236,73,0.15)]"
            : "border-transparent bg-[#ffffff] dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-opacity-80"
        }`}
        htmlFor={`plan_${safePlan.id}`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-[#13ec49] text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {planName}
            </h3>
            {planDescription && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {planDescription}
              </p>
            )}
          </div>
          <div
            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-2 ${
              isSelected
                ? "border-[#13ec49] bg-[#13ec49]"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">
            ₦{typeof planPrice === 'number' ? planPrice.toLocaleString() : planPrice}
          </span>
          <span className="text-sm font-bold text-slate-400">
            /{planFrequency}
          </span>
        </div>
        <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
        <div className="flex flex-col gap-2.5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <CheckCircle className="w-4 h-4 text-[#13ec49] flex-shrink-0" />
              <span>{feature}</span>
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
    plan_name: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    frequency: PropTypes.string,
    meals_per_cycle: PropTypes.number,
    meal_per_cycle: PropTypes.number,
    trial_days: PropTypes.number,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isPopular: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export default PricingCard;
