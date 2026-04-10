import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

const StickyCTA = ({ totalPrice, onSubscribe }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-dock border-t border-slate-100 bg-[#f6f8f6] p-4 pb-8 dark:border-slate-800 dark:bg-background-dark">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ₦{Number(totalPrice || 0).toLocaleString()}
          </span>
        </div>

        <button
          onClick={onSubscribe}
          disabled={!totalPrice}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#13ec49] text-lg font-bold text-green-950 shadow-lg shadow-primary/25 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
