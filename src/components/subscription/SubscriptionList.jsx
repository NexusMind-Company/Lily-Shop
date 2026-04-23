import PropTypes from "prop-types";
import SubscriptionItem from "./SubscriptionItem";
import Pagination from "./Pagination";

/**
 * SubscriptionList component for displaying a list of subscription plans for a vendor
 * @param {Object} props - Component props
 * @param {Array} props.subscriptions - Array of subscription plan objects from the vendor API
 * @param {Function} props.onViewAll - Function to handle view all action
 * @param {Object} props.pagination - Pagination information {currentPage, totalPages, totalCount, pageSize}
 * @param {Function} props.onPageChange - Function to handle page change
 */
const SubscriptionList = ({
  subscriptions,
  _onViewAll,
  pagination,
  onPageChange,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#111813] dark:text-text-main-dark">
          Subscription Plans
        </h3>
        {/* <button
          onClick={onViewAll}
          className="text-primary-dark dark:text-[#13ec49] text-sm font-bold hover:underline"
        >
          View All
        </button> */}
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

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
};

SubscriptionList.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      plan_name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      subscribers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subscription_date: PropTypes.string,
      trial_days: PropTypes.number,
      trial_end_date: PropTypes.string,
      frequency: PropTypes.string,
      last_payment_date: PropTypes.string,
      next_payment_date: PropTypes.string,
    }),
  ),
  _onViewAll: PropTypes.func,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
  }),
  onPageChange: PropTypes.func,
};

export default SubscriptionList;
