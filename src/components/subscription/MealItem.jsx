import PropTypes from "prop-types";

/**
 * MealItem component for individual meal selection
 * @param {Object} props - Component props
 * @param {Object} props.meal - Meal data
 * @param {boolean} props.isSelected - Whether the meal is selected
 * @param {Function} props.onToggle - Function to handle selection toggle
 */
const MealItem = ({ meal, isSelected, onToggle }) => {
  return (
    <label
      className={`group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer shadow-sm transition-all ${
        isSelected
          ? "bg-surface-light dark:bg-surface-dark border-2 border-primary"
          : "bg-surface-light dark:bg-surface-dark border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      }`}
    >
      <div className="absolute top-3 right-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(meal.id)}
          className="custom-checkbox h-6 w-6 rounded-full border-gray-300 text-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
        />
      </div>
      <div
        className="h-20 w-20 rounded-lg bg-gray-200 bg-cover bg-center shrink-0"
        style={{
          backgroundImage: `url("${
            meal.image || "https://via.placeholder.com/80"
          }")`,
        }}
      />
      <div className="flex flex-col gap-1 pr-8">
        <h4
          className={`font-bold leading-tight ${
            isSelected
              ? "text-text-main dark:text-white"
              : "text-text-main dark:text-white font-medium"
          }`}
        >
          {meal.name}
        </h4>
        <div className="flex flex-wrap gap-1">
          {meal.tags?.map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                tag.type === "protein"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : tag.type === "omega"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : tag.type === "iron"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : tag.type === "plant"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : tag.type === "carb"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {tag.label}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {meal.calories} kcal
          </span>
        </div>
      </div>
    </label>
  );
};

MealItem.propTypes = {
  meal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
      })
    ),
    calories: PropTypes.number.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default MealItem;
