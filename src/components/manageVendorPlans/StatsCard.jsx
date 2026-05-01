import React from "react";
import PropTypes from "prop-types";

/**
 * StatsCard component for displaying a stat with icon, label, and value.
 * @param {Object} props - The component props.
 * @param {React.Component|string} props.icon - The icon component or material symbol icon name.
 * @param {string} props.label - The label for the stat.
 * @param {string|number} props.value - The value to display.
 */
const StatsCard = ({ icon, label, value }) => {
  return (
    <div className="flex min-w-35 flex-1 flex-col gap-2 rounded-xl p-4 bg-white shadow-[0_0_4px_rgba(0,0,0,0.05)] border border-grey-900">
      <div className="flex items-center gap-2">
        <div className=" text-black text-xl">{icon}</div>
        <p className="text-black text-sm font-medium leading-normal">
          {label}
        </p>
      </div>
      <p className="text-black tracking-light text-2xl font-bold leading-tight">
        {value}
      </p>
    </div>
  );
};

StatsCard.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StatsCard;
