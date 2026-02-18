import PropTypes from "prop-types";

/**
<<<<<<< HEAD
 * SubscriptionItem component for displaying individual subscription plan for a vendor
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription plan data from vendor API
=======
 * SubscriptionItem component for displaying individual subscription
 * @param {Object} props - Component props
 * @param {Object} props.subscription - Subscription data
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
 * @param {Function} props.onClick - Click handler for the item
 */
const SubscriptionItem = ({ subscription, onClick }) => {
  if (!subscription) return null;

<<<<<<< HEAD
  const planName = subscription.plan_name;
  const price = subscription.price;
  const frequency = subscription.frequency;
  const subscribers = subscription.subscribers;
  const trialDays = subscription.trial_days;
  const nextPaymentDate = subscription.next_payment_date;
  const status = subscription.status || "active";
=======
  const customer = subscription.customers;
  const planName = subscription.plan_name || subscription.plan_type;
  const amount = subscription.amount;
  const status = subscription.status;
  const avatar = customer?.profile_pic;
  const name = customer?.name || "Unknown Customer";
  const isPast = status === "past";
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46

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
<<<<<<< HEAD
      case "expired":
        return {
          text: "Expired",
          className:
            "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-400/20",
=======
      case "past":
        return {
          text: "Past",
          className:
            "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10",
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
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

<<<<<<< HEAD
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
=======
  const getAvatarBadge = (planName) => {
    if (planName?.toLowerCase().includes("weekly")) return "WK";
    if (planName?.toLowerCase().includes("monthly")) return "MO";
    return "";
  };

  const avatarBadge = getAvatarBadge(planName);

  return (
    <div
      className={`group relative flex items-center justify-between p-4 bg-[#ffffff] dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer ${
        isPast ? "opacity-70 grayscale-[0.5]" : ""
      }`}
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
      onClick={() => onClick && onClick(subscription)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
<<<<<<< HEAD
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
=======
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
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-text-main dark:text-white leading-tight">
<<<<<<< HEAD
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
=======
            {name}
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {planName}
          </p>
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-text-main dark:text-white">
<<<<<<< HEAD
          ${parseFloat(price).toFixed(2)}
=======
          ${parseFloat(amount).toFixed(0)}
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
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
<<<<<<< HEAD
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
=======
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
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
  }),
  onClick: PropTypes.func,
};

export default SubscriptionItem;
