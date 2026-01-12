import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import DashboardHeader from "../components/subscription/DashboardHeader";
import ProfileSection from "../components/subscription/ProfileSection";
import QuickStats from "../components/subscription/QuickStats";
import ManagePlansCard from "../components/subscription/ManagePlansCard";
import SubscriptionList from "../components/subscription/SubscriptionList";
import BottomNavigation from "../components/subscription/BottomNavigation";
import {
  fetchVendorProfile,
  fetchSubscriptionStats,
  fetchRecentSubscriptions,
} from "../services/subscriptionApi";
import { getCurrentUserId } from "../services/supabase";

/**
 * VendorDashboard component - Main dashboard for vendors to manage subscriptions
 * @param {Object} props - Component props
 * @param {string} props.vendorId - The vendor's unique ID (would come from auth context)
 */
const VendorDashboard = ({ vendorId }) => {
  const navigate = useNavigate();
  const vendorIdToUse = vendorId || getCurrentUserId();

  // Fetch vendor profile (demo data if no vendor)
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["vendorProfile", vendorIdToUse || "demo"],
    queryFn: () =>
      vendorIdToUse
        ? fetchVendorProfile(vendorIdToUse)
        : Promise.resolve({
            name: "Demo Vendor",
            image: null,
            verified: false,
            cuisine: "Various",
            location: "Demo Location",
            rating: 4.5,
            review_count: 0,
            description: "This is a demo vendor profile for testing purposes.",
          }),
    enabled: true,
  });

  // Fetch subscription stats (demo data if no vendor)
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["subscriptionStats", vendorIdToUse || "demo"],
    queryFn: () =>
      vendorIdToUse
        ? fetchSubscriptionStats(vendorIdToUse)
        : Promise.resolve({
            activeSubs: 0,
            revenue: "0.00",
            pending: 0,
          }),
    enabled: true,
  });

  // Fetch recent subscriptions (empty array if no vendor)
  const {
    data: subscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useQuery({
    queryKey: ["recentSubscriptions", vendorIdToUse || "demo"],
    queryFn: () =>
      vendorIdToUse
        ? fetchRecentSubscriptions(vendorIdToUse)
        : Promise.resolve([]),
    enabled: true,
  });

  // Event handlers
  const handleBack = () => {
    navigate(-1); // Go back in history
  };

  const handleHelp = () => {
    // Implement help functionality
    console.log("Help clicked");
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigate("/editProfile");
  };

  const handleManagePlans = () => {
    // Navigate to manage plans page
    navigate("/subscription/manage");
  };

  const handleViewAllSubscriptions = () => {
    // Navigate to all subscriptions page
    navigate("/subscriptions");
  };

  const handleTabChange = (tabId) => {
    // Handle bottom navigation tab changes
    switch (tabId) {
      case "home":
        navigate("/feed");
        break;
      case "orders":
        navigate("/orders");
        break;
      case "add":
        // Handle add new item
        console.log("Add new item");
        break;
      case "dashboard":
        // Already on dashboard
        break;
      case "profile":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  // Loading state
  if (profileLoading || statsLoading || subscriptionsLoading) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813]  dark:text-text-main-dark">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (profileError || statsError || subscriptionsError) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex flex-col shadow-2xl overflow-hidden">
      <DashboardHeader onBack={handleBack} onHelp={handleHelp} />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-6 px-4 pt-6">
        <ProfileSection profile={profile} onEditProfile={handleEditProfile} />

        <QuickStats stats={stats} />

        <ManagePlansCard onManagePlans={handleManagePlans} />

        <SubscriptionList
          subscriptions={subscriptions}
          onViewAll={handleViewAllSubscriptions}
        />
      </main>

      {/* <BottomNavigation activeTab="dashboard" onTabChange={handleTabChange} /> */}
    </div>
  );
};

VendorDashboard.propTypes = {
  vendorId: PropTypes.string,
};

export default VendorDashboard;
