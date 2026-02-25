import PropTypes from "prop-types";

/**
 * MenuItem component for displaying individual menu items
 * @param {Object} props - Component props
 * @param {Object} props.item - Menu item data
 * @param {Function} props.onClick - Function to handle click
 */
const MenuItem = ({ item, onClick }) => {
  return (
    <div
      className="snap-start shrink-0 w-36 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <div
        className="bg-slate-200 dark:bg-slate-800 rounded-xl aspect-square bg-cover bg-center overflow-hidden relative group"
        style={{
          backgroundImage: `url("${
            item.image || "https://via.placeholder.com/144"
          }")`,
        }}
        alt={item.name}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        {item.isSnack && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
            Snack
          </div>
        )}
      </div>
      <p className="text-xs font-bold truncate">{item.name || 'Unnamed Item'}</p>
      <p className="text-[10px] text-slate-500 font-medium -mt-1">Available</p>
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    image: PropTypes.string,
    isSnack: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MenuItem;
