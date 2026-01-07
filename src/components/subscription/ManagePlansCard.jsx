import PropTypes from "prop-types";

/**
 * ManagePlansCard component for managing meal plans
 * @param {Object} props - Component props
 * @param {Function} props.onManagePlans - Function to handle manage plans action
 */
const ManagePlansCard = ({ onManagePlans }) => {
  return (
    <section className="relative overflow-hidden bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 group cursor-pointer transition-transform active:scale-[0.98]">
      {/* Decorative Image Background */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjcF5JXe0W8d6wfpSMmcf3H8kGOLKpFyTgt3uIAGdlOFJe-vOV3HaZPJq0JgtvtbvNMi-GtT6IrUgj73Y9ec3xj5-2gqeVnkgc1vfLTcLrzUIcB7QmLuCWb2sMDANKs9HvukEM0zLZkTlv0MFx3ymVIe9CmJpENumu5G-NRFwondNGY-5scfm4KNZNwqsydHgeOtsIs0fDXASLKPQJcEfkK4bStUa4zZK08twLadpyqPTj2REC8ayRWHOsK3MJKC0MphpYuSQFLGQV')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface-light dark:to-surface-dark"></div>
      </div>
      <div className="relative z-10 p-6 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg text-primary-dark dark:text-primary">
            <span className="material-symbols-outlined">restaurant_menu</span>
          </div>
          <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
            Your Meal Plans
          </h3>
        </div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed max-w-[80%]">
          Set up your weekly or monthly menus. Create new offerings or update
          existing ones.
        </p>
        <button
          onClick={onManagePlans}
          className="w-full mt-2 bg-primary hover:bg-primary-dark text-text-main-light font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>Manage Plans</span>
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
};

ManagePlansCard.propTypes = {
  onManagePlans: PropTypes.func.isRequired,
};

export default ManagePlansCard;
