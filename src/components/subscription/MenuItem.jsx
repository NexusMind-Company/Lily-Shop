import PropTypes from "prop-types";

// import PropTypes from "prop-types";

// /**
//  * MenuItem component for displaying individual menu items
//  * @param {Object} props - Component props
//  * @param {Object} props.item - Menu item data
//  * @param {Function} props.onClick - Function to handle click
//  */
// const MenuItem = ({ item, onClick }) => {
//   return (
//     <div
//       className="snap-start shrink-0 w-36 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//       onClick={onClick}
//     >
//       <div
//         className="bg-slate-200 dark:bg-slate-800 rounded-xl aspect-square bg-cover bg-center overflow-hidden relative group"
//         style={{
//           backgroundImage: `url("${
//             item.image || "https://via.placeholder.com/144"
//           }")`,
//         }}
//         alt={item.name}
//       >
//         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
//         {item.isSnack && (
//           <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
//             Snack
//           </div>
//         )}
//       </div>
//       <p className="text-xs font-bold truncate">{item}</p>
//       <p className="text-[10px] text-slate-500 font-medium -mt-1">Available</p>
//     </div>
//   );
// };

// MenuItem.propTypes = {
//   item: PropTypes.string.isRequired,
//   onClick: PropTypes.func.isRequired,
// };

// export default MenuItem;




/**
 * MenuItem component for displaying individual menu items
 * @param {Object} props - Component props
 * @param {Object} props.item - Menu item data (can be object or string)
 * @param {Function} props.onClick - Function to handle click
 */
const MenuItem = ({ item, onClick }) => {
  // Handle both object and string types
  const itemName = typeof item === 'string' ? item : (item.name || 'Menu Item');
  const itemImage = typeof item === 'object' ? (item.image || item.all_media_urls?.[0]) : null;
  const isSnack = typeof item === 'object' ? item.isSnack : false;

  return (
    <div
      className="snap-start shrink-0 w-36 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <div
        className="bg-slate-200 dark:bg-slate-800 rounded-xl aspect-square bg-cover bg-center overflow-hidden relative group"
        style={{
          backgroundImage: `url("${
            itemImage || "https://via.placeholder.com/144"
          }")`,
        }}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        {isSnack && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
            Snack
          </div>
        )}
      </div>
      <p className="text-xs font-bold truncate">{itemName}</p>
      <p className="text-[10px] text-slate-500 font-medium -mt-1">Available</p>
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string,
      image: PropTypes.string,
      all_media_urls: PropTypes.array,
      isSnack: PropTypes.bool,
    })
  ]).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MenuItem;
