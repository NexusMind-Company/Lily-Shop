import PropTypes from "prop-types";

/**
 * SubscriptionItem component for displaying individual subscription
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription data
 * @param {Function} props.onClick - Click handler for the item
 */
const SubscriptionItem = ({ subscription, onClick }) => {
  if (!subscription) return null;

  const customer = subscription.customers;
  const planName = subscription.plan_name || subscription.plan_type;
  const amount = subscription.amount;
  const status = subscription.status;
  const avatar = customer?.profile_pic;
  const name = customer?.name || "Unknown Customer";
  const isPast = status === "past";

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          text: "Active",
          className:
            "bg-primary/10 text-green-700 dark:text-primary ring-1 ring-inset ring-primary/20",
        };
      case "paused":
        return {
          text: "Paused",
          className:
            "bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-400/20",
        };
      case "past":
        return {
          text: "Past",
          className:
            "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10",
        };
      default:
        return {
          text: status,
          className:
            "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10",
        };
    }
  };

  const statusBadge = getStatusBadge(status);

  const getAvatarBadge = (planName) => {
    if (planName?.toLowerCase().includes("weekly")) return "WK";
    if (planName?.toLowerCase().includes("monthly")) return "MO";
    return "";
  };

  const avatarBadge = getAvatarBadge(planName);

  return (
    <div
      className={`group relative flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer ${
        isPast ? "opacity-70 grayscale-[0.5]" : ""
      }`}
      onClick={() => onClick && onClick(subscription)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-primary"
            style={{
              backgroundImage: `url("${
                avatar || "https://via.placeholder.com/48"
              }")`,
            }}
          />
          {avatarBadge && (
            <div
              className={`absolute -bottom-1 -right-1 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-surface-dark ${
                avatarBadge === "WK"
                  ? "bg-primary"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {avatarBadge}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-text-main dark:text-white leading-tight">
            {name}
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {planName}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-text-main dark:text-white">
          ${parseFloat(amount).toFixed(0)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}
        >
          {statusBadge.text}
        </span>
      </div>
    </div>
  );
};

SubscriptionItem.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    plan_type: PropTypes.string,
    plan_name: PropTypes.string,
    amount: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    started_at: PropTypes.string,
    customers: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      profile_pic: PropTypes.string,
    }),
  }),
  onClick: PropTypes.func,
};

export default SubscriptionItem;
