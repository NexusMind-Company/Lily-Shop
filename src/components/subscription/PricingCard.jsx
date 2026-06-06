import { Check } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";

/**
 * PricingCard component for displaying meal plan options
 * @param {Object} props - Component props
 * @param {Object} props.plan - Plan data
 * @param {boolean} props.isSelected - Whether this plan is selected
 * @param {boolean} props.isPopular - Whether this is the most popular plan
 * @param {Function} props.onSelect - Function to handle plan selection
 */
const PricingCard = ({ plan, isSelected, isPopular, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  // Map API fields to component expectations
  const planName = plan.plan_name || plan.name || "Unnamed Plan";
  const planPrice = plan.price || 0;
  const planDescription = plan.description || "";
  const planFrequency = plan.frequency || "week";

  // Get media URL - try multiple possible field names
  const mediaUrl =
    plan.image_url ||
    plan.image ||
    plan.media ||
    plan.all_media_urls?.[0] ||
    null;
  const isVideo =
    mediaUrl &&
    (mediaUrl.includes(".mp4") ||
      mediaUrl.includes(".webm") ||
      mediaUrl.includes(".mov"));

  return (
    <div className="relative group cursor-pointer">
      <input
        className="peer sr-only"
        id={`plan_${plan.id}`}
        name="plans"
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(plan.id)}
      />
      <label
        className={`flex flex-col gap-4 rounded-2xl border-2 p-5 shadow-sm transition-all cursor-pointer ${
          isSelected
            ? "border-lily bg-white shadow-[0_4px_20px_-4px_rgba(19,236,73,0.15)]"
            : "border-transparent bg-white hover:bg-slate-50"
        }`}
        htmlFor={`plan_${plan.id}`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-lily text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider z-10">
            Most Popular
          </div>
        )}

        {/* Media Display */}
        {mediaUrl && !imageError && (
          <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 bg-gray-100 shadow-md">
            {isVideo ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                controls
                onError={() => setImageError(true)}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={planName}
                className="w-full h-full object-cover"
                loading="eager"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{planName}</h3>
            {planDescription && (
              <p className="text-slate-500 text-sm mt-0.5">{planDescription}</p>
            )}
          </div>
          <div
            className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ml-2 ${
              isSelected ? "border-lily bg-lily" : "border-slate-300"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">
            ₦
            {typeof planPrice === "number"
              ? planPrice.toLocaleString()
              : planPrice}
          </span>
          <span className="text-sm font-bold text-slate-400">
            /{planFrequency}
          </span>
        </div>
      </label>
    </div>
  );
};

PricingCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    plan_name: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    frequency: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isPopular: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export default PricingCard;
