import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DashboardHeader from '../components/subscription/DashboardHeader';
import ProfileSection from '../components/subscription/ProfileSection';
import QuickStats from '../components/subscription/QuickStats';
import ManagePlansCard from '../components/subscription/ManagePlansCard';
import SubscriptionList from '../components/subscription/SubscriptionList';
import BottomNavigation from '../components/subscription/BottomNavigation';
import { fetchVendorProfile, fetchSubscriptionStats, fetchRecentSubscriptions } from '../services/subscriptionApi';

/**
 * VendorDashboard component - Main dashboard for vendors to manage subscriptions
 * @param {Object} props - Component props
 * @param {string} props.vendorId - The vendor's unique ID (would come from auth context)
 */
const VendorDashboard = ({ vendorId }) => {
  const navigate = useNavigate();

  // Fetch vendor profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['vendorProfile', vendorId],
    queryFn: () => fetchVendorProfile(vendorId),
    enabled: !!vendorId,
  });

  // Fetch subscription stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['subscriptionStats', vendorId],
    queryFn: () => fetchSubscriptionStats(vendorId),
    enabled: !!vendorId,
  });

  // Fetch recent subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useQuery({
    queryKey: ['recentSubscriptions', vendorId],
    queryFn: () => fetchRecentSubscriptions(vendorId),
    enabled: !!vendorId,
  });

  // Event handlers
  const handleBack = () => {
    navigate(-1); // Go back in history
  };

  const handleHelp = () => {
    // Implement help functionality
    console.log('Help clicked');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigate('/edit-profile');
  };

  const handleManagePlans = () => {
    // Navigate to manage plans page
    navigate('/manage-plans');
  };

  const handleViewAllSubscriptions = () => {
    // Navigate to all subscriptions page
    navigate('/subscriptions');
  };

  const handleTabChange = (tabId) => {
    // Handle bottom navigation tab changes
    switch (tabId) {
      case 'home':
        navigate('/feed');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'add':
        // Handle add new item
        console.log('Add new item');
        break;
      case 'dashboard':
        // Already on dashboard
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  // Loading state
  if (profileLoading || statsLoading || subscriptionsLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-text-main-light dark:text-text-main-dark">Loading...</div>
      </div>
    );
  }

  // Error state
  if (profileError || statsError || subscriptionsError) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen flex flex-col shadow-2xl overflow-hidden">
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

      <BottomNavigation activeTab="dashboard" onTabChange={handleTabChange} />
    </div>
  );
};

VendorDashboard.propTypes = {
  vendorId: PropTypes.string.isRequired,
};

export default VendorDashboard;