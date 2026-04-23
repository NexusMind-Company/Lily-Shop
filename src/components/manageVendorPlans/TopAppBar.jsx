import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

/**
 * TopAppBar component for displaying a header with back button and title.
 * @param {Object} props - The component props.
 * @param {string} props.title - The title to display in the header.
 * @param {function} props.onBackClick - Function to call when back button is clicked.
 */
const TopAppBar = ({ title, onBackClick }) => {
  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-50 border-b border-gray-100">
      <div
        className="text-[#111813] flex size-12 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
        onClick={onBackClick}
      >
        <ArrowLeft />
      </div>
      <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
        {title}
      </h2>
    </div>
  );
};

TopAppBar.propTypes = {
  title: PropTypes.string.isRequired,
  onBackClick: PropTypes.func.isRequired,
};

export default TopAppBar;
