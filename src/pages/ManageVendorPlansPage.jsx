import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import StatsCard from "../components/manageVendorPlans/StatsCard";
import PlanCard from "../components/manageVendorPlans/PlanCard";
import InfoBox from "../components/manageVendorPlans/InfoBox";
import {
  fetchMealPlans,
  fetchSubscriptionStats,
} from "../services/subscriptionApi";
import { getCurrentUserId } from "../services/supabase";
import { CreditCard, Plus, User } from "lucide-react";

/**
 * ManageVendorPlansPage component for managing vendor meal plans.
 * Displays stats, active and inactive plans, and informational footer.
 */
const ManageVendorPlansPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeSubs: 0,
    revenue: "0.00",
    pending: 0,
  });
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const vendorId = getCurrentUserId();
    if (vendorId) {
      fetchSubscriptionStats(vendorId).then(setStats).catch(console.error);
      fetchMealPlans(vendorId).then(setPlans).catch(console.error);
    }
  }, []);

  const handleBackClick = () => {
    // Handle back navigation
    navigate(-1);
  };

  const handleEditPlan = () => {
    // Navigate to edit plan page
    navigate("/subscription/edit");
  };

  const handleCreatePlan = () => {
    // Navigate to create plan page
    navigate("/subscription/create");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
      <TopAppBar title="Manage Meal Plans" onBackClick={handleBackClick} />
      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-md mx-auto w-full">
        {/* Stats Overview */}
        <div className="flex flex-wrap gap-3">
          <StatsCard
            icon={<User />}
            label="Subscribers"
            value={stats.activeSubs}
          />
          <StatsCard
            icon={<CreditCard />}
            label="Next Payout"
            value={`$${stats.revenue}`}
          />
        </div>
        {/* Weekly Plan Section (Active State) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[#111813] dark:text-white text-lg font-bold leading-tight">
              Weekly Subscription
            </h3>
            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
              Active
            </span>
          </div>
          <PlanCard
            isActive={true}
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuD_7IKqsIZwPItaCTHPDiRaGf0r-ybaFWL2mkX2ETZLxdu-4C_FePIKJpVd7hP9vyjx2vpWNMadSsJySyShUQLpcrTMznVFiQ09XsPcspvOyieFyQ_z_Isysy-9aym9IPGlWZLjApk67ZqhzQ3fn8KzOpTuy-LhBPZYsifOiEuyUUozXlvSZk95nHM4MS-zdSzOR3TYLFGwMaZU8CDIftvwQh1_Zru50BI45vgSSW2moHjEX5XxK6aVCnt9qw6xA8w9jxPVMNVT0ed6"
            price="$50.00 / week"
            title="Standard Weekly Box"
            description="5 Meals • Vegetarian Options • Delivery on Mondays"
            features={["Visible in marketplace", "Next cutoff: Sunday 8PM"]}
            buttonText="Edit Plan details"
            onButtonClick={handleEditPlan}
          />
        </div>
        {/* Monthly Plan Section (Empty/Upsell State) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[#111813] dark:text-white text-lg font-bold leading-tight">
              Monthly Subscription
            </h3>
            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">
              Not Setup
            </span>
          </div>
          <PlanCard
            isActive={false}
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAB3w-4Cyvmk0BNL7McgMkwaqC_Mx2Vnds65JsPh-Ez230Vl-kmaahvHT4DHS95cVEZ7vV13VqBAKqcv8qVuGf_giN-VG3Wnaf05D-WGD9eomqIbowa3Tg71LWEoYbPi5bKF4_TU7r534GFgt86HiKni_fUgweuyntDQHK_TLD74kCcHgnLlNge0ZwI4I-hrjziYlQO4JlI1YnjVrj8JFZLdPx_XQMz4E09AUCedrSics2zFP3u1yRoPxEKu1QgXe0M1PIEBAFwiOek"
            title="Monthly Saver Plan"
            description="Secure loyal customers by offering a monthly subscription at a discounted rate."
            buttonText="Create Monthly Plan"
            onButtonClick={handleCreatePlan}
          />
        </div>
        {/* Footer Info */}
        <div className="mt-4 px-2">
          <InfoBox
            icon={<Plus />}
            message="Plan details are managed externally via our partner portal (Airtable). Changes may take up to 5 minutes to reflect in the app."
          />
        </div>
      </div>
    </div>
  );
};

export default ManageVendorPlansPage;
("info");
