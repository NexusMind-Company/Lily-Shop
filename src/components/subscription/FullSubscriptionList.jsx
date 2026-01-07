import { useState } from "react";
import PropTypes from "prop-types";
import SubscriptionItem from "./SubscriptionItem";
import SubscriberDetailModal from "./SubscriberDetailModal";

/**
 * FullSubscriptionList component for displaying all subscriptions with tabs
 * @param {Object} props - Component props
 * @param {Array} props.subscriptions - Array of all subscriptions
 * @param {string} props.activeTab - Currently active tab
 */
const FullSubscriptionList = ({ subscriptions, activeTab }) => {
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter subscriptions based on active tab
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    if (activeTab === "active") {
      return subscription.status.toLowerCase() !== "past";
    }
    return subscription.status.toLowerCase() === "past";
  });

  const handleItemClick = (subscription) => {
    const subscriber = {
      name: subscription.customers?.name || "Unknown",
      avatar: subscription.customers?.profile_pic,
      memberSince: subscription.started_at
        ? new Date(subscription.started_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Unknown",
      status:
        subscription.status.charAt(0).toUpperCase() +
        subscription.status.slice(1),
      planName:
        subscription.plan_name || subscription.plan_type || "Unknown Plan",
      nextPayment: "Oct 24th", // This would come from API
      amount: parseFloat(subscription.amount),
      dietaryNotes: subscription.dietary_notes || null, // This would come from API
    };
    setSelectedSubscriber(subscriber);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubscriber(null);
  };

  const handleCall = (subscriber) => {
    // Implement call functionality
    console.log("Calling", subscriber.name);
    // You could use window.location.href = `tel:${subscriber.phone}` if phone number is available
  };

  const handleMessage = (subscriber) => {
    // Implement message functionality
    console.log("Messaging", subscriber.name);
    // Navigate to chat or open messaging interface
  };

  return (
    <>
      <section className="px-4 flex flex-col gap-3">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              onClick={handleItemClick}
            />
          ))
        ) : (
          <p className="text-text-secondary dark:text-gray-400 text-center py-8">
            No {activeTab} subscriptions
          </p>
        )}
      </section>

      <SubscriberDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subscriber={selectedSubscriber}
        onCall={handleCall}
        onMessage={handleMessage}
      />
    </>
  );
};

FullSubscriptionList.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      plan_type: PropTypes.string,
      plan_name: PropTypes.string,
      amount: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      started_at: PropTypes.string,
      dietary_notes: PropTypes.string,
      customers: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        profile_pic: PropTypes.string,
      }),
    })
  ).isRequired,
  activeTab: PropTypes.oneOf(["active", "past"]).isRequired,
};

export default FullSubscriptionList;
