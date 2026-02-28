import PropTypes from "prop-types";
import MenuItem from "./MenuItem";

/**
 * MenuPreview component for displaying a horizontal scrollable menu preview
 * @param {Object} props - Component props
 * @param {Array} props.menuItems - Array of menu items
 * @param {Function} props.onViewAll - Function to handle view all action
 * @param {Function} props.onMealClick - Function to handle meal click
 */
const MenuPreview = ({ menuItems, onViewAll, onMealClick }) => {
  // Extract menu items from nested structure (menu_items property)
  const flattenedMenuItems = menuItems && menuItems.length > 0 
    ? menuItems.flatMap(menu => menu.menu_items || [])
    : [];

  return (
    <div className="mt-4 pb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold tracking-tight">This Week's Menu</h2>
        <button
          onClick={onViewAll}
          className="text-[#13ec49] text-sm font-bold"
        >
          See All
        </button>
      </div>
      <div
        className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x hide-scrollbar"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {flattenedMenuItems.length > 0 ? (
          flattenedMenuItems.map((item, index) => (
            <MenuItem 
              key={index} 
              item={item} 
              onClick={() => onMealClick(item)} 
            />
          ))
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No menu items available
          </p>
        )}
      </div>
    </div>
  );
};

MenuPreview.propTypes = {
  menuItems: PropTypes.array,
  onViewAll: PropTypes.func.isRequired,
  onMealClick: PropTypes.func.isRequired,
};

export default MenuPreview;
