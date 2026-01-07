import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CustomerSubscriptionHeader from "../components/subscription/CustomerSubscriptionHeader";
import SubscriptionSegmentedControl from "../components/subscription/SubscriptionSegmentedControl";
import ExpandableSubscriptionCard from "../components/subscription/ExpandableSubscriptionCard";
import CustomerSubscriptionFooter from "../components/subscription/CustomerSubscriptionFooter";
import { fetchCustomerSubscriptions } from "../services/subscriptionApi";

/**
 * CustomerSubscriptionsPage component - Customer view of their subscriptions
 */
const CustomerSubscriptionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch customer subscriptions
  const {
    data: subscriptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customerSubscriptions"],
    queryFn: fetchCustomerSubscriptions,
    enabled: true,
  });

  // Event handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSkipWeek = (subscriptionId) => {
    // Implement skip week functionality
    console.log("Skip week for subscription:", subscriptionId);
  };

  const handleManage = (subscriptionId) => {
    // Navigate to manage subscription page
    navigate(`/subscription/${subscriptionId}/manage`);
  };

  const handleResume = (subscriptionId) => {
    // Implement resume functionality
    console.log("Resume subscription:", subscriptionId);
  };

  const handleBrowseNewPlans = () => {
    // Navigate to browse plans
    navigate("/browse-plans");
  };

  // Filter subscriptions based on active tab
  const filteredSubscriptions =
    subscriptions?.filter((subscription) => {
      if (activeTab === "active") {
        return subscription.status.toLowerCase() === "active";
      }
      return (
        subscription.status.toLowerCase() === "past" ||
        subscription.status.toLowerCase() === "paused"
      );
    }) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-text-main dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading subscriptions. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 min-h-screen flex flex-col antialiased">
      <CustomerSubscriptionHeader onBack={handleBack} />

      <main className="flex-1 w-full max-w-md mx-auto flex flex-col pb-24 px-4 pt-4">
        <SubscriptionSegmentedControl
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="flex flex-col gap-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => (
              <ExpandableSubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onSkipWeek={handleSkipWeek}
                onManage={handleManage}
                onResume={handleResume}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-text-sub dark:text-gray-400">
                No {activeTab} subscriptions
              </p>
            </div>
          )}
        </div>
      </main>

      <CustomerSubscriptionFooter onBrowseNewPlans={handleBrowseNewPlans} />
    </div>
  );
};

export default CustomerSubscriptionsPage;
