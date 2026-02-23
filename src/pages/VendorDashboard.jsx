import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

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

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

  // ✅ vendorId resolves AFTER redux hydrates
  console.log("📋 VendorDashboard received props:", vendorId);
  console.log("📋 Profile data from Redux:", profileData);

  const vendorIdForApi = vendorId ?? profileData?.user?.vendor_id;
  console.log("📋 vendorIdForApi value:", vendorIdForApi);
  console.log("📋 vendorIdForApi type:", typeof vendorIdForApi);

  // Ensure vendorId is always a string
  const validVendorId =
    typeof vendorIdForApi === "string" ? vendorIdForApi : null;
  console.log("📋 validVendorId:", validVendorId);

  // ---------------- Queries ----------------

  const {
    data: statsRaw,
    isFetching: statsFetching,
    error: statsError,
  } = useQuery({
    queryKey: ["subscriptionStats", validVendorId],
    queryFn: async () => {
      console.log(" Fetching subscription stats with vendorId:", validVendorId);
      const result = await fetchSubscriptionStats(validVendorId);
      console.log(" Subscription stats result:", result);
      return result;
    },
    enabled: Boolean(validVendorId),
  });

  const {
    data: plansData,
    isFetching: subscriptionsFetching,
    error: subscriptionsError,
  } = useQuery({
    queryKey: ["vendorSubscriptionPlans", validVendorId],
    queryFn: async () => {
      console.log(
        "🔍 Fetching vendor subscription plans with vendorId:",
        validVendorId,
      );
      const result = await fetchVendorSubscriptionPlans(validVendorId, {
        page: 1,
        page_size: 10,
      });
      console.log(" Vendor subscription plans result:", result);
      return result;
    },
    enabled: Boolean(validVendorId),
  });

  // Extract results from paginated response
  const subscriptions =
    plansData?.results || (Array.isArray(plansData) ? plansData : []);

  // ---------------- Derived data ----------------

  const vendorProfile = profileData?.user
    ? {
        id: user_data?.vendor_id || profileData?.user?.vendor_id,
        username: profileData.user.username,
        profile_pic: profileData.user.profile_pic,
        verified: profileData.user.verified,
      }
    : null;
  console.log(" VendorDashboard statsRaw:", statsRaw);
  const stats = statsRaw
    ? {
        activeSubs: Number(statsRaw.activeSubs ?? 0),
        revenue: Number(statsRaw.revenue ?? 0),
        pending: Number(statsRaw.pending ?? 0),
      }
    : null;

  // ---------------- Handlers ----------------

  const handleBack = () => navigate(-1);
  const handleHelp = () => console.log("Help clicked");
  const handleEditProfile = () => navigate("/editProfile");
  const handleManagePlans = () =>
    navigate("/vendor/plans", { state: { vendorId: vendorProfile.id } });
  const handleViewAllSubscriptions = () => navigate("/subscriptions");

  // ---------------- Loading / Error ----------------

  if (statsFetching || subscriptionsFetching) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813] dark:text-text-main-dark">
          Loading...
        </div>
      </div>
    );
  }

  if (statsError || subscriptionsError) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  // ---------------- Render ----------------

  return (
    <div className="relative w-full max-w-md bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex flex-col shadow-2xl overflow-hidden">
      <DashboardHeader onBack={handleBack} onHelp={handleHelp} />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-6 px-4 pt-6">
        {vendorProfile && (
          <ProfileSection
            profile={vendorProfile}
            onEditProfile={handleEditProfile}
          />
        )}

        {stats && <QuickStats stats={stats} />}

        <ManagePlansCard onManagePlans={handleManagePlans} />

        <SubscriptionList
          subscriptions={subscriptions}
          onViewAll={handleViewAllSubscriptions}
        />
      </main>
    </div>
  );
};

VendorDashboard.propTypes = {
  vendorId: PropTypes.string,
};

export default VendorDashboard;
