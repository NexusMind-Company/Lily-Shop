import { useState } from "react";
import PropTypes from "prop-types";

/**
 * ExpandableSubscriptionCard component for customer subscription cards
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription data
 * @param {Function} props.onSkipWeek - Function to handle skip week action
 * @param {Function} props.onManage - Function to handle manage action
 * @param {Function} props.onResume - Function to handle resume action
 */
const ExpandableSubscriptionCard = ({
  subscription,
  onSkipWeek,
  onManage,
  onResume,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subscription) return null;

  const {
    id,
    vendor_name,
    vendor_image,
    plan_name,
    amount,
    frequency,
    meal_count,
    status,
    next_billing,
    next_delivery,
    paused_date,
    paused_reason,
  } = subscription;

  const isPaused = status.toLowerCase() === "paused";

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          text: "Active",
          className:
            "bg-primary/20 text-green-700 dark:text-green-300 border border-primary/20",
        };
      case "paused":
        return {
          text: "Paused",
          className:
            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30",
        };
      default:
        return {
          text: status,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800/30",
        };
    }
  };

  const statusBadge = getStatusBadge(status);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSkipWeek = (e) => {
    e.stopPropagation();
    onSkipWeek(id);
  };

  const handleManage = (e) => {
    e.stopPropagation();
    onManage(id);
  };

  const handleResume = (e) => {
    e.stopPropagation();
    onResume(id);
  };

  return (
    <details
      className={`group bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 shadow-soft overflow-hidden transition-all duration-300 ${
        isExpanded ? "open:ring-1 open:ring-primary/20" : ""
      } ${isPaused ? "opacity-90 hover:opacity-100" : ""}`}
      open={isExpanded}
    >
      <summary
        className="flex items-start gap-3 p-4 cursor-pointer select-none list-none"
        onClick={handleToggle}
      >
        {/* Vendor Image */}
        <div
          className={`w-14 h-14 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 bg-cover bg-center ${
            isPaused ? "grayscale" : ""
          }`}
          style={{
            backgroundImage: `url("${
              vendor_image || "https://via.placeholder.com/56"
            }")`,
          }}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-base font-bold truncate leading-tight ${
                isPaused
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-text-main dark:text-white"
              }`}
            >
              {vendor_name}
            </h3>
            <span
              className={`shrink-0 text-sm font-bold ${
                isPaused ? "text-gray-400" : "text-text-main dark:text-white"
              }`}
            >
              ${amount}
              <span className="text-xs font-normal text-text-sub">
                /{frequency === "monthly" ? "mo" : "wk"}
              </span>
            </span>
          </div>
          <p
            className={`text-xs truncate ${
              isPaused
                ? "text-text-sub dark:text-gray-500"
                : "text-text-sub dark:text-gray-400"
            }`}
          >
            {plan_name} • {meal_count} Meals
          </p>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.className}`}
            >
              {statusBadge.text}
            </span>
            <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform duration-300 text-[20px]">
              expand_more
            </span>
          </div>
        </div>
      </summary>

      {/* Expanded Content */}
      <div className="px-4 pb-4 pt-1 border-t border-dashed border-gray-100 dark:border-white/10 mt-1">
        {isPaused ? (
          <>
            <p className="text-sm text-gray-500 py-2">
              {paused_reason ||
                `You paused this subscription on ${
                  paused_date || "recently"
                }. Resume anytime to start receiving meals again.`}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                className="w-full h-10 rounded-lg bg-primary text-primary-content text-sm font-bold hover:bg-green-400 transition-colors shadow-md hover:shadow-lg"
                onClick={handleResume}
              >
                Resume Subscription
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-sub dark:text-gray-500">
                  Next Billing
                </span>
                <span className="text-sm font-medium text-text-main dark:text-white">
                  {next_billing || "TBD"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-sub dark:text-gray-500">
                  Next Delivery
                </span>
                <span className="text-sm font-medium text-text-main dark:text-white">
                  {next_delivery || "TBD"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-white/20 text-sm font-bold text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                onClick={handleSkipWeek}
              >
                Skip Week
              </button>
              <button
                className="flex-1 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                onClick={handleManage}
              >
                Manage
              </button>
            </div>
          </>
        )}
      </div>
    </details>
  );
};

ExpandableSubscriptionCard.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    vendor_name: PropTypes.string.isRequired,
    vendor_image: PropTypes.string,
    plan_name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    frequency: PropTypes.string.isRequired,
    meal_count: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    next_billing: PropTypes.string,
    next_delivery: PropTypes.string,
    paused_date: PropTypes.string,
    paused_reason: PropTypes.string,
  }).isRequired,
  onSkipWeek: PropTypes.func.isRequired,
  onManage: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
};

export default ExpandableSubscriptionCard;
