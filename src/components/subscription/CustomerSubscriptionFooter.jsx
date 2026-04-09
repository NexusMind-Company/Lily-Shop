import { Plus } from "lucide-react";
import PropTypes from "prop-types";

/**
 * CustomerSubscriptionFooter component with sticky CTA
 * @param {Object} props - Component props
 * @param {Function} props.onBrowseNewPlans - Function to handle browse new plans action
 */
const CustomerSubscriptionFooter = ({ onBrowseNewPlans }) => {
  return (
    <div className="fixed bottom-0 w-full z-dock">
      {/* Gradient fade for smooth content scroll under footer */}
      <div className="absolute bottom-full left-0 w-full h-12 bg-gradient-to-t from-[#f6f8f6] dark:from-background-dark to-transparent pointer-events-none"></div>
      <div className="bg-[#f6f8f6] dark:bg-background-dark p-4 pb-8 max-w-md mx-auto">
        <button
          className="w-full h-14 rounded-xl bg-[#13ec49] hover:bg-green-400 text-primary-content text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
          onClick={onBrowseNewPlans}
        >
         <Plus/>
          Browse New Plans
        </button>
      </div>
    </div>
  );
};

CustomerSubscriptionFooter.propTypes = {
  onBrowseNewPlans: PropTypes.func.isRequired,
};

export default CustomerSubscriptionFooter;
