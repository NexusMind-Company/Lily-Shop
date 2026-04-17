import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import StatsCard from "../components/manageVendorPlans/StatsCard";
import PlanCard from "../components/manageVendorPlans/PlanCard";
import MealPlanForm from "../components/manageVendorPlans/MealPlanForm";
import Pagination from "../components/subscription/Pagination";
import {
  fetchVendorSubscriptionPlans,
  fetchSubscriptionStats,
  deleteVendorMealPlan,
} from "../services/subscriptionApi";
import { CreditCard, Plus, User } from "lucide-react";

const ManageVendorPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("type");
  const mode = searchParams.get("mode");
  const isEdit = mode === "edit";

  // Get vendorId from navigate state (passed from VendorDashboard) or from Redux profile
  const { data: profileData } = useSelector((state) => state.profile); // Note: changed from profileData to data
  const { user_data } = useSelector((state) => state.auth);
  const vendorIdForApi = location.state?.vendorId ?? profileData?.user?.vendor_id ?? user_data?.vendor_id;
  console.log("📋 vendorIdForApi value:", vendorIdForApi);
  console.log("📋 vendorIdForApi type:", typeof vendorIdForApi);
  
  // Ensure vendorId is always a string
  const validVendorId =
    typeof vendorIdForApi === "string" ? vendorIdForApi : null;
  console.log("📋 validVendorId:", validVendorId);
  
  const [vendorId, setVendorId] = useState(validVendorId);

  // Update vendorId when profile data arrives
  useEffect(() => {
    if (validVendorId) {
      setVendorId(validVendorId);
    }
  }, [validVendorId]);

  const [stats, setStats] = useState({
    activeSubs: 0,
    revenue: "0.00",
    pending: 0,
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

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
          fetchVendorSubscriptionPlans(vendorId, {
            page: currentPage,
            page_size: pageSize,
          }),
        ]);

        console.log("Stats data received:", statsData);
        console.log("Plans data received:", plansData);

        setStats(statsData);
        // Extract results from paginated response
        const extractedPlans =
          plansData.results || (Array.isArray(plansData) ? plansData : []);
        console.log("Extracted plans:", extractedPlans);
        setPlans(extractedPlans);
        setTotalCount(plansData.count || 0);
      } catch (err) {
        console.error("Failed to load vendor plans:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [vendorId, currentPage]);

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
    navigate(`/vendor/plans/${id}`, { state: { mode: "edit" } });
  };

  const handleViewPlan = (id) => {
    navigate(`/vendor/plans/${id}`);
  };

  const handleCreatePlan = () => {
    navigate("/subscription/create-meal-plan", { state: { vendorId } });
  };

  const handleDeletePlan = async (planId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this meal plan? This action cannot be undone.",
      )
    ) {
      try {
        await deleteVendorMealPlan(planId);
        // Navigate to /vendor/plans page after successful deletion
        navigate("/vendor/plans", {
          state: { message: "Meal plan deleted successfully!" },
        });
      } catch (error) {
        console.error("Error deleting meal plan:", error);
        alert("Failed to delete meal plan. Please try again.");
      }
    }
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
            planId={searchParams.get("id")} // ✅ Pass the specific plan ID for editing
            vendorId={vendorId} // ✅ pass vendorId to form
          />
        </div>
      </div>
    );
  }

  // ---------------- Separate Active / Inactive Plans ----------------
  // Since there's no is_active property, we'll consider all plans as active for now
  const activePlans = plans;
  const inactivePlans = [];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
      <TopAppBar title="Manage Meal Plans" onBackClick={handleBackClick} />

      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-5xl mx-auto w-full">
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
        <div className="p-4 flex items-center justify-end max-w-4xl mx-auto w-full">
          <button
            onClick={handleCreatePlan}
            className="bg-lily flex text-white self-end  px-4 py-2 rounded-lg  transition-colors duration-200"
          >
            <Plus /> New Plan
          </button>
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
              price={
                plan.price
                  ? `₦${Number(plan.price).toLocaleString("en-NG", {
                      minimumFractionDigits: Number.isInteger(
                        Number(plan.price),
                      )
                        ? 0
                        : 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "—"
              }
              title={plan.plan_name}
              description={plan.description || "No description"}
              features={["Visible in marketplace", "Currently live"]}
              buttonText="Edit Plan details"
              onButtonClick={() => handleEditPlan(plan.id)}
              onCardClick={() => handleViewPlan(plan.id)}
              onDeleteClick={() => handleDeletePlan(plan.id)}
            />
          </div>
        ))}

        {/* Pagination */}
        {totalCount > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}

        {/* Empty State - Only when there are no plans */}
        {activePlans.length === 0 && (
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
