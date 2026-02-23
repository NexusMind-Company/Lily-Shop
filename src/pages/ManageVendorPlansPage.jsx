import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import StatsCard from "../components/manageVendorPlans/StatsCard";
import PlanCard from "../components/manageVendorPlans/PlanCard";
import MealPlanForm from "../components/manageVendorPlans/MealPlanForm";
import {
  fetchVendorSubscriptionPlans,
  fetchSubscriptionStats,
} from "../services/subscriptionApi";
import { CreditCard, User } from "lucide-react";

const ManageVendorPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("type");
  const mode = searchParams.get("mode");
  const isEdit = mode === "edit";

  // Get vendorId from navigate state (passed from VendorDashboard) or from Redux profile
  const { profileData } = useSelector((state) => state.profile);
  const initialVendorId =
    location.state?.vendorId || profileData?.user?.vendor_id || null;
  const [vendorId, setVendorId] = useState(initialVendorId);

  const [stats, setStats] = useState({
    activeSubs: 0,
    revenue: "0.00",
    pending: 0,
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- Load Vendor Stats & Plans ----------------
  useEffect(() => {
    const loadData = async () => {
      if (!vendorId) {
        console.error("Vendor ID is missing. Cannot load plans.");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("Loading data for vendorId:", vendorId);
      try {
        // Fetch subscription stats and meal plans for this vendor
        const [statsData, plansData] = await Promise.all([
          fetchSubscriptionStats(vendorId),
          fetchVendorSubscriptionPlans(vendorId, { page: 1, page_size: 100 }),
        ]);

        console.log("Stats data received:", statsData);
        console.log("Plans data received:", plansData);

        setStats(statsData);
        // Extract results from paginated response
        const extractedPlans = plansData.results || (Array.isArray(plansData) ? plansData : []);
        console.log("Extracted plans:", extractedPlans);
        setPlans(extractedPlans);
      } catch (err) {
        console.error("Failed to load vendor plans:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [vendorId]);

  // ---------------- Navigation Handlers ----------------
  const handleBackClick = () => {
    if (planType) navigate("/vendor/plans");
    else navigate(-1);
  };

  const handleSuccess = (plan) => {
    navigate("/vendor/plans", {
      state: { message: `Meal plan "${plan.name}" created successfully!` },
    });
  };

  const handleCancel = () => navigate("/vendor/plans");

  const handleEditPlan = (id) => {
    navigate(`/vendor/plans/${id}`);
  };

  const handleViewPlan = (id) => {
    navigate(`/vendor/plans/${id}`);
  };

  const handleCreatePlan = () => {
    navigate("/subscription/create-meal-plan", { state: { vendorId } });
  };

  // ---------------- Loading / Error States ----------------
  if (loading) return <div>Loading vendor information...</div>;
  if (!vendorId) return <div>Vendor information not found.</div>;

  // ---------------- Render Meal Plan Form for Create/Edit Mode ----------------
  if (planType) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
        <TopAppBar
          title={`${isEdit ? "Edit" : "Create"} ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`}
          onBackClick={handleBackClick}
        />
        <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-4xl mx-auto w-full">
          <MealPlanForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialType={planType}
            isEdit={isEdit}
            vendorId={vendorId} // ✅ pass vendorId to form
          />
        </div>
      </div>
    );
  }

  // ---------------- Separate Active / Inactive Plans ----------------
  const activePlans = plans.filter((p) => p.is_active);
  const inactivePlans = plans.filter((p) => !p.is_active);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
      <TopAppBar title="Manage Meal Plans" onBackClick={handleBackClick} />

      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-md mx-auto w-full">
        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <StatsCard
            icon={<User />}
            label="Active Plans"
            value={stats.activeSubs}
          />
          <StatsCard
            icon={<CreditCard />}
            label="Next Payout"
            value={`₦${stats.revenue}`}
          />
        </div>

        {/* Active Plans */}
        {activePlans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">Meal Plan</h3>
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                Active
              </span>
            </div>
            <PlanCard
              isActive
              imageUrl="/placeholder-food.jpg"
              price={plan.price ? `₦${plan.price}` : "—"}
              title={plan.name}
              description={plan.description || "No description"}
              features={[
                "Visible in marketplace",
                plan.menu?.is_active ? "Currently live" : "Hidden",
              ]}
              buttonText="Edit Plan details"
              onButtonClick={() => handleEditPlan(plan.id)}
              onCardClick={() => handleViewPlan(plan.id)}
            />
          </div>
        ))}

        {/* Inactive / Empty State */}
        {inactivePlans.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">Meal Plans</h3>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">
                Not Setup
              </span>
            </div>
            <PlanCard
              isActive={false}
              imageUrl="/placeholder-food.jpg"
              title="Create your first meal plan"
              description="Start selling meals by creating a subscription plan for customers."
              buttonText="Create Meal Plan"
              onButtonClick={handleCreatePlan}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendorPlansPage;
