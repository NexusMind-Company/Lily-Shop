import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

/**
 * PlanSelectionCard component for displaying a selectable plan option.
 * @param {Object} props - The component props.
 * @param {React.Component|string} props.icon - The icon component or material symbol icon name.
 * @param {string} props.badge - The badge text.
 * @param {string} props.title - The title of the plan.
 * @param {string} props.description - The description of the plan.
 * @param {string} props.imageUrl - URL of the background image.
 * @param {function} props.onClick - Function to call when the card is clicked.
 */
const PlanSelectionCard = ({
  icon,
  badge,
  title,
  description,
  imageUrl,
  onClick,
}) => {
  return (
    <div
      className="group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-2xl bg-card-light dark:bg-card-dark p-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-transparent hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="flex-1 p-5 flex flex-col justify-center gap-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary">
            <div className="">{icon}</div>
          </div>
          <span className="bg-primary/10 text-primary-dark dark:text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
        <div>
          <h3 className="text-[#111813] dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-[#61896b] dark:text-gray-400 text-sm font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {/* Image Section */}
      <div className="w-full sm:w-32 h-40 sm:h-auto shrink-0 relative overflow-hidden rounded-xl sm:rounded-r-xl sm:rounded-l-none order-last sm:order-last">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:hidden"></div>
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        ></div>
        <div className="absolute bottom-3 right-3 sm:hidden">
          <ArrowRight />
        </div>
      </div>
      {/* Desktop Hover Arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/60 backdrop-blur rounded-full p-2 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        <ArrowRight />
      </div>
    </div>
  );
};

PlanSelectionCard.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  badge: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PlanSelectionCard;
