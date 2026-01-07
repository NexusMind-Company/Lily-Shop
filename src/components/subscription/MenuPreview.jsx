import PropTypes from "prop-types";
import MenuItem from "./MenuItem";

/**
 * MenuPreview component for displaying a horizontal scrollable menu preview
 * @param {Object} props - Component props
 * @param {Array} props.menuItems - Array of menu items
 * @param {Function} props.onViewAll - Function to handle view all action
 */
const MenuPreview = ({ menuItems, onViewAll }) => {
  return (
    <div className="mt-4 pb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold tracking-tight">This Week's Menu</h2>
        <button onClick={onViewAll} className="text-primary text-sm font-bold">
          See All
        </button>
      </div>
      <div
        className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x hide-scrollbar"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => <MenuItem key={item.id} item={item} />)
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
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
      days: PropTypes.string,
      isSnack: PropTypes.bool,
    })
  ),
  onViewAll: PropTypes.func.isRequired,
};

export default MenuPreview;
