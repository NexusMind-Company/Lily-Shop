import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SubscriptionsHeader from "../components/subscription/SubscriptionsHeader";
import SubscriptionStats from "../components/subscription/SubscriptionStats";
import SubscriptionTabs from "../components/subscription/SubscriptionTabs";
import FullSubscriptionList from "../components/subscription/FullSubscriptionList";
import { fetchAllSubscriptions } from "../services/subscriptionApi";
import { Plus } from "lucide-react";

/**
 * VendorSubscriptionsOverview component - Page for vendors to view all their subscriptions
 */
const VendorSubscriptionsOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const vendorId = "test-vendor";

  // Fetch all subscriptions for the vendor (or demo data if no vendor)
  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allSubscriptions", vendorId || "demo", currentPage, pageSize],
    queryFn: () =>
      vendorId
        ? fetchAllSubscriptions(vendorId, {
            page: currentPage,
            page_size: pageSize,
          })
        : Promise.resolve({ results: [], count: 0 }),
    enabled: true,
  });

  const subscriptions = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const pagination = {
    currentPage,
    totalPages,
    totalCount,
    pageSize,
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
  // Note: Stats are calculated based on all data, not just current page
  // In a real app, you might want to fetch separate stats data
  const activeSubscriptions =
    subscriptions?.filter((sub) => sub.status.toLowerCase() !== "past") || [];
  const activeCount = activeSubscriptions.length;
  const weeklyAmount = activeSubscriptions.reduce(
    (total, sub) => total + parseFloat(sub.amount || 0),
    0,
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-text-main dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading subscriptions. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full max-w-md mx-auto min-h-screen bg-[#f6f8f6] dark:bg-background-dark">
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
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button className="flex items-center justify-center w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-105 transition-transform">
          <Plus />
        </button>
      </div>
    </div>
  );
};

export default VendorSubscriptionsOverview;
