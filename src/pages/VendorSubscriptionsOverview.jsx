import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SubscriptionsHeader from "../components/subscription/SubscriptionsHeader";
import SubscriptionStats from "../components/subscription/SubscriptionStats";
import SubscriptionTabs from "../components/subscription/SubscriptionTabs";
import FullSubscriptionList from "../components/subscription/FullSubscriptionList";
import { fetchAllSubscriptions } from "../services/subscriptionApi";

/**
 * VendorSubscriptionsOverview component - Page for vendors to view all their subscriptions
 */
const VendorSubscriptionsOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch all subscriptions for the vendor
  const {
    data: subscriptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allSubscriptions"],
    queryFn: fetchAllSubscriptions, // This would need to be implemented in the API service
    enabled: true,
  });

  // Event handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log("Filter clicked");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Calculate stats
  const activeSubscriptions =
    subscriptions?.filter((sub) => sub.status.toLowerCase() !== "past") || [];
  const activeCount = activeSubscriptions.length;
  const weeklyAmount = activeSubscriptions.reduce(
    (total, sub) => total + parseFloat(sub.amount || 0),
    0
  );

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
    <div className="relative flex flex-col w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark">
      <SubscriptionsHeader onBack={handleBack} onFilter={handleFilter} />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <SubscriptionStats
          activeCount={activeCount}
          weeklyAmount={weeklyAmount}
        />

        <SubscriptionTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <FullSubscriptionList
          subscriptions={subscriptions || []}
          activeTab={activeTab}
        />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button className="flex items-center justify-center w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>
    </div>
  );
};

export default VendorSubscriptionsOverview;
