import React from "react";
import PropTypes from "prop-types";
import { CheckCircle, ExternalLink, Plus } from "lucide-react";

/**
 * PlanCard component for displaying a subscription plan.
 * @param {Object} props - The component props.
 * @param {boolean} props.isActive - Whether the plan is active or not.
 * @param {string} props.imageUrl - URL of the background image.
 * @param {string} [props.price] - Price to display (only for active plans).
 * @param {string} props.title - Title of the plan.
 * @param {string} props.description - Description of the plan.
 * @param {string[]} [props.features] - Array of feature strings (only for active plans).
 * @param {string} props.buttonText - Text for the button.
 * @param {function} props.onButtonClick - Function to call when button is clicked.
 */
const PlanCard = ({
  isActive,
  imageUrl,
  price,
  title,
  description,
  features,
  buttonText,
  onButtonClick,
}) => {
  if (isActive) {
    return (
      <div className="flex flex-col rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-white dark:bg-[#1a2c1e] overflow-hidden">
        <div
          className="w-full h-40 bg-center bg-no-repeat bg-cover relative"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        >
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            <span className="text-xs font-bold text-[#111813] dark:text-white">
              {price}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <h4 className="text-[#111813] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              {title}
            </h4>
            <p className="text-[#61896b] dark:text-gray-400 text-sm mt-1">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-[#61896b] dark:text-gray-400"
              >
                <CheckCircle/>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-11 px-4 border border-[#13ec49] bg-transparent text-[#111813] dark:text-white hover:bg-[#13ec49]/10 transition-colors text-sm font-bold"
            onClick={onButtonClick}
          >
            <span>{buttonText}</span>
            <ExternalLink />
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl pt-[100px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative overflow-hidden group"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="relative z-10 flex w-full flex-col gap-4 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-white text-2xl font-bold leading-tight">
              {title}
            </p>
            <p className="text-gray-200 text-sm font-normal leading-relaxed opacity-90">
              {description}
            </p>
          </div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#13ec49] text-[#111813] hover:bg-[#0fd641] transition-colors text-sm font-bold shadow-lg"
            onClick={onButtonClick}
          >
            <Plus/>
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    );
  }
};

PlanCard.propTypes = {
  isActive: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string.isRequired,
  price: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string),
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

export default PlanCard;
