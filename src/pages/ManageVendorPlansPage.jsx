import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import StatsCard from "../components/manageVendorPlans/StatsCard";
import PlanCard from "../components/manageVendorPlans/PlanCard";
import Pagination from "../components/subscription/Pagination";
import VendorLayout from "../components/vendor/VendorLayout";
import {
  fetchVendorSubscriptionPlans,
  fetchSubscriptionStats,
  deleteVendorMealPlan,
} from "../services/subscriptionApi";
import { CreditCard, Plus, User, Copy, Eye } from "lucide-react";

const ManageVendorPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [_searchParams] = useSearchParams();
  const toastProcessed = useRef(false);
  const queryClient = useQueryClient();

  // Get vendorId from navigate state (passed from VendorDashboard) or from Redux profile
  const { data: profileData } = useSelector((state) => state.profile);
  const { user_data } = useSelector((state) => state.auth);
  const vendorIdForApi =
    location.state?.vendorId ??
    profileData?.user?.vendor_id ??
    user_data?.vendor_id;

  // Ensure vendorId is always a string
  const validVendorId =
    typeof vendorIdForApi === "string" ? vendorIdForApi : null;

  const [vendorId, setVendorId] = useState(validVendorId);

  // Update vendorId when profile data arrives
  useEffect(() => {
    if (validVendorId) {
      setVendorId(validVendorId);
    }
  }, [validVendorId]);

  // Handle success messages/toasts from other pages
  useEffect(() => {
    if (location.state?.message) {
      if (!toastProcessed.current) {
        toastProcessed.current = true;
        toast.success(location.state.message);
        // Clear state to prevent toast on re-renders/refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else {
      toastProcessed.current = false;
    }
  }, [location.state, navigate, location.pathname]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ---------------- Load Vendor Stats & Plans ----------------
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["vendorStats", vendorId],
    queryFn: () => fetchSubscriptionStats(vendorId),
    enabled: !!vendorId,
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["vendorPlans", vendorId, currentPage],
    queryFn: () =>
      fetchVendorSubscriptionPlans(vendorId, {
        page: currentPage,
        page_size: pageSize,
      }),
    enabled: !!vendorId,
  });

  const stats = statsData || { activeSubs: 0, revenue: "0.00", pending: 0 };
  const plans =
    plansData?.results || (Array.isArray(plansData) ? plansData : []);
  const totalCount = plansData?.count || 0;
  const loading = statsLoading || plansLoading;

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // ---------------- Navigation Handlers ----------------
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleEditPlan = (id) => {
    navigate(`/vendor/plans/${id}/edit`);
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

        // Invalidate queries to trigger refresh
        queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
        queryClient.invalidateQueries({ queryKey: ["vendorStats"] });

        // Navigate to /vendor/plans page after successful deletion
        navigate("/vendor/plans", {
          state: { message: "Meal plan deleted successfully!" },
        });
      } catch (error) {
        console.error("Error deleting meal plan:", error);
        toast.error("Failed to delete meal plan. Please try again.");
      }
    }
  };

  // Handle copy meal plan link
  const handleCopyMealPlanLink = (planId) => {
    const planLink = `${window.location.origin}/vendor/plans/${planId}`;
    navigator.clipboard.writeText(planLink);
    toast.success("Meal plan link copied to clipboard!");
  };

  // ---------------- Loading / Error States ----------------
  if (loading) return <div>Loading vendor information...</div>;
  if (!vendorId) return <div>Vendor information not found.</div>;

  // ---------------- Separate Active / Inactive Plans ----------------
  // Since there's no is_active property, we'll consider all plans as active for now
  const activePlans = plans;

  return (
    <VendorLayout
      title="Manage Meal Plans"
      showBack={true}
      onBack={handleBackClick}
    >
      <div className="flex flex-col gap-6 w-full">
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

        <div className="flex items-center justify-end w-full">
          <button
            onClick={handleCreatePlan}
            className="bg-lily flex text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus /> New Plan
          </button>
        </div>

        {/* Active Plans */}
        {activePlans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-black">Meal Plan</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyMealPlanLink(plan.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-lily text-lily font-semibold text-xs hover:bg-lily/5 transition-colors"
                  title="Copy meal plan link"
                >
                  <Copy size={14} />
                  <span className="hidden sm:inline">Copy Link</span>
                </button>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">
                  Active
                </span>
              </div>
            </div>
            <PlanCard
              isActive
              imageUrl={
                plan.all_media_urls && plan.all_media_urls.length > 0
                  ? plan.all_media_urls[0]
                  : "/placeholder-food.jpg"
              }
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
              <h3 className="text-lg font-bold text-black">Meal Plans</h3>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase">
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
    </VendorLayout>
  );
};

export default ManageVendorPlansPage;
