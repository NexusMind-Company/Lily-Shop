import PropTypes from "prop-types";

/**
 * SubscriptionListItem component for individual subscription display
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription data
 * @param {Function} props.onClick - Function to handle item click
 */
const SubscriptionListItem = ({ subscription, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-green-700 dark:text-primary ring-primary/20";
      case "paused":
        return "bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 ring-yellow-400/20";
      case "past":
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-gray-500/10";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-gray-500/10";
    }
  };

  const getPlanBadgeColor = (planType) => {
    switch (planType) {
      case "WK":
        return "bg-primary text-black";
      case "MO":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const isPast = subscription.status === "past";
  const itemClasses = `group relative flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer ${
    isPast ? "opacity-70 grayscale-[0.5]" : ""
  }`;

  return (
    <div className={itemClasses} onClick={() => onClick(subscription)}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-primary"
            style={{
              backgroundImage: `url("${
                subscription.customer?.avatar ||
                "https://via.placeholder.com/48"
              }")`,
            }}
          />
          <div
            className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-surface-dark ${getPlanBadgeColor(
              subscription.planType
            )}`}
          >
            {subscription.planType}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-text-main dark:text-white leading-tight">
            {subscription.customer?.name}
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {subscription.planName}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-text-main dark:text-white">
          ${subscription.amount}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(
            subscription.status
          )}`}
        >
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

SubscriptionListItem.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    customer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    planName: PropTypes.string.isRequired,
    planType: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    status: PropTypes.oneOf(["active", "paused", "past"]).isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SubscriptionListItem;
