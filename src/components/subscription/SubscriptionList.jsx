import PropTypes from "prop-types";
import SubscriptionItem from "./SubscriptionItem";

/**
 * SubscriptionList component for displaying a list of subscriptions
 * @param {Object} props - Component props
 * @param {Array} props.subscriptions - Array of subscription objects
 * @param {Function} props.onViewAll - Function to handle view all action
 */
const SubscriptionList = ({ subscriptions, onViewAll }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
          Recent Subscriptions
        </h3>
        <button
          onClick={onViewAll}
          className="text-primary-dark dark:text-primary text-sm font-bold hover:underline"
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
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
            No recent subscriptions
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
      plan_type: PropTypes.string.isRequired,
      amount: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      started_at: PropTypes.string.isRequired,
      customers: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        profile_pic: PropTypes.string,
      }),
    })
  ),
  onViewAll: PropTypes.func.isRequired,
};

export default SubscriptionList;
