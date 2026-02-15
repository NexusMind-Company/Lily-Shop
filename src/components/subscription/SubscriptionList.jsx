import PropTypes from "prop-types";
import SubscriptionItem from "./SubscriptionItem";

/**
 * SubscriptionList component for displaying a list of subscription plans for a vendor
 * @param {Object} props - Component props
 * @param {Array} props.subscriptions - Array of subscription plan objects from the vendor API
 * @param {Function} props.onViewAll - Function to handle view all action
 */
const SubscriptionList = ({ subscriptions, onViewAll }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#111813] dark:text-text-main-dark">
          Subscription Plans
        </h3>
        <button
          onClick={onViewAll}
          className="text-primary-dark dark:text-[#13ec49] text-sm font-bold hover:underline"
        >
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
            />
          ))
        ) : (
          <p className="text-[#61896b] dark:text-text-secondary-dark text-center py-8">
            No subscription plans available
          </p>
        )}
      </div>
    </section>
  );
};

SubscriptionList.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
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
    }),
  ),
  onViewAll: PropTypes.func.isRequired,
};

export default SubscriptionList;
