import PropTypes from "prop-types";

/**
 * SubscriptionItem component for displaying individual subscription plan for a vendor
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription plan data from vendor API
 * @param {Function} props.onClick - Click handler for the item
 */
const SubscriptionItem = ({ subscription, onClick }) => {
  if (!subscription) return null;

  const planName = subscription.plan_name;
  const price = subscription.price;
  const frequency = subscription.frequency;
  const subscribers = subscription.subscribers;
  const trialDays = subscription.trial_days;
  const nextPaymentDate = subscription.next_payment_date;
  const status = subscription.status || "active";

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          text: "Active",
          className:
            "bg-primary/10 text-green-700 dark:text-[#13ec49] ring-1 ring-inset ring-primary/20",
        };
      case "paused":
        return {
          text: "Paused",
          className:
            "bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-400/20",
        };
      case "expired":
        return {
          text: "Expired",
          className:
            "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-400/20",
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

  const getFrequencyBadge = (freq) => {
    if (!freq) return null;
    const freqMap = {
      weekly: { text: "Weekly", bg: "bg-primary" },
      monthly: { text: "Monthly", bg: "bg-blue-100 text-blue-700" },
      fortnightly: { text: "Bi-weekly", bg: "bg-purple-100 text-purple-700" },
      daily: { text: "Daily", bg: "bg-green-100 text-green-700" },
    };
    return freqMap[freq.toLowerCase()] || { text: freq, bg: "bg-gray-100 text-gray-700" };
  };

  const frequencyBadge = getFrequencyBadge(frequency);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`group relative flex items-center justify-between p-4 bg-[#ffffff] dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer`}
      onClick={() => onClick && onClick(subscription)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
            <span className="text-primary dark:text-[#13ec49] font-bold text-lg">
              {planName?.charAt(0) || "P"}
            </span>
          </div>
          {frequencyBadge && (
            <div
              className={`absolute -bottom-1 -right-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-surface-dark ${frequencyBadge.bg}`}
            >
              {frequencyBadge.text?.substring(0, 2)}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-text-main dark:text-white leading-tight">
            {planName}
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {trialDays > 0 ? `${trialDays} day trial` : "No trial"} • {subscribers || 0} subscribers
          </p>
          {nextPaymentDate && (
            <p className="text-xs text-text-secondary dark:text-gray-400">
              Next: {formatDate(nextPaymentDate)}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-text-main dark:text-white">
         ₦{Number(price).toLocaleString('en-NG', {
            minimumFractionDigits: Number.isInteger(Number(price)) ? 0 : 2,
            maximumFractionDigits: 2
          })}
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
    plan_name: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    subscribers: PropTypes.string,
    subscription_date: PropTypes.string,
    trial_days: PropTypes.number,
    trial_end_date: PropTypes.string,
    frequency: PropTypes.string,
    last_payment_date: PropTypes.string,
    next_payment_date: PropTypes.string,
    status: PropTypes.string,
  }),
  onClick: PropTypes.func,
};

export default SubscriptionItem;
