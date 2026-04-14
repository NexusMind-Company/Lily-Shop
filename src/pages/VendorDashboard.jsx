import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useState } from "react";

import DashboardHeader from "../components/subscription/DashboardHeader";
import ProfileSection from "../components/subscription/ProfileSection";
import QuickStats from "../components/subscription/QuickStats";
import ManagePlansCard from "../components/subscription/ManagePlansCard";
import SubscriptionList from "../components/subscription/SubscriptionList";

import {
  fetchSubscriptionStats,
  fetchVendorSubscriptionPlans,
} from "../services/subscriptionApi";

const VendorDashboard = ({ vendorId }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state) => state.profile);

  // Resolve vendorId from props → auth state → profile state
  const vendorIdForApi =
    vendorId ??
    user_data?.vendor_id ??
    profileData?.user?.vendor_id ??
    null;

  // Only use it if it's actually a string (backend returns string IDs)
  const validVendorId =
    vendorIdForApi && typeof vendorIdForApi === "string"
      ? vendorIdForApi
      : vendorIdForApi
      ? String(vendorIdForApi)
      : null;

  // ---------------- Queries ----------------

  const {
    data: statsRaw,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["subscriptionStats", validVendorId],
    queryFn: () => fetchSubscriptionStats(validVendorId),
    enabled: Boolean(validVendorId),
    retry: 1,
  });

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["vendorSubscriptionPlans", validVendorId, currentPage, pageSize],
    queryFn: () =>
      fetchVendorSubscriptionPlans(validVendorId, {
        page: currentPage,
        page_size: pageSize,
      }),
    enabled: Boolean(validVendorId),
    retry: 1,
  });

  // ---------------- Derived data ----------------

  const subscriptions =
    plansData?.results || (Array.isArray(plansData) ? plansData : []);
  const totalCount = plansData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = { currentPage, totalPages, totalCount, pageSize };

  const vendorProfile = profileData?.user
    ? {
        id: validVendorId,
        username: profileData.user.username,
        profile_pic: profileData.user.profile_pic,
        verified: profileData.user.verified,
      }
    : null;

  const stats = statsRaw
    ? {
        activeSubs: Number(statsRaw.activeSubs ?? 0),
        revenue: Number(statsRaw.revenue ?? 0),
        pending: Number(statsRaw.pending ?? 0),
      }
    : null;

  // ---------------- Handlers ----------------

  const handleBack = () => navigate(-1);
  const handleHelp = () => {};
  const handleEditProfile = () => navigate("/vendor/dashboard/profile");
  const handleManagePlans = () => {
    if (!validVendorId) return;
    navigate("/vendor/plans", { state: { vendorId: validVendorId } });
  };
  const handleViewAllSubscriptions = () => navigate("/subscriptions");
  const handlePageChange = (newPage) => setCurrentPage(newPage);

  // ---------------- Loading / Error states ----------------

  // Still waiting for profile to load from backend
  if (profileLoading && !profileData) {
    return (
      <div className="bg-[#f6f8f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4eb75e] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#111813] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Profile loaded but no vendor_id — user is not a vendor yet
  if (!validVendorId && !profileLoading) {
    return (
      <div className="bg-[#f6f8f6] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#4eb75e]/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🍽️</span>
        </div>
        <h2 className="text-xl font-bold text-[#111813] mb-2">No Vendor Profile Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          You haven't set up a food vendor profile yet. Create one to start managing subscriptions.
        </p>
        <button
          onClick={() => navigate("/create-vendor")}
          className="bg-[#4eb75e] text-white font-bold py-3 px-6 rounded-2xl"
        >
          Create Vendor Profile
        </button>
      </div>
    );
  }

  // Data queries failed
  if (statsError && plansError) {
    return (
      <div className="bg-[#f6f8f6] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 text-sm mb-4">
          Error loading dashboard. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#4eb75e] text-white font-bold py-3 px-6 rounded-2xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------------- Render ----------------

  const isLoadingData = statsLoading || plansLoading;

  return (
    <div className="relative w-full bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex flex-col">
      <DashboardHeader onBack={handleBack} onHelp={handleHelp} />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-6 px-4 pt-6">
        {vendorProfile && (
          <ProfileSection
            profile={vendorProfile}
            onEditProfile={handleEditProfile}
          />
        )}

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-4 border-[#4eb75e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {stats && <QuickStats stats={stats} />}

            <ManagePlansCard onManagePlans={handleManagePlans} />

            <SubscriptionList
              subscriptions={subscriptions}
              onViewAll={handleViewAllSubscriptions}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

VendorDashboard.propTypes = {
  vendorId: PropTypes.string,
};

export default VendorDashboard;



