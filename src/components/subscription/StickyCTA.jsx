import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

/**
 * StickyCTA component for the subscription call-to-action
 * @param {Object} props - Component props
 * @param {number} props.totalPrice - Total price to display
 * @param {Function} props.onSubscribe - Function to handle subscription
 */
const StickyCTA = ({ totalPrice, onSubscribe }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f6f8f6] dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 z-40 pb-8">
      <div className="flex items-center gap-4 max-w-lg mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <button
          onClick={onSubscribe}
          className="flex-1 bg-[#13ec49] text-green-950 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:brightness-105 active:scale-[0.98] transition-all"
        >
          Subscribe Now
          <ArrowRight />
        </button>
      </div>
    </div>
  );
};

StickyCTA.propTypes = {
  totalPrice: PropTypes.number.isRequired,
  onSubscribe: PropTypes.func.isRequired,
};

export default StickyCTA;
