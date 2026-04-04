import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import MenuPreview from "../components/subscription/MenuPreview";
import StickyCTA from "../components/subscription/StickyCTA";
import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
import { fetchVendorDetails } from "../services/subscriptionApi";
import { fetchReviewsForVendor } from "../services/subscriptionApi";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  fetchMealPlansByVendor,
  fetchFoodVendor,
  fetchMealsByVendor,
} from "../services/api";

const VendorSubscriptionPage = ({ vendorId: propVendorId }) => {
  const navigate = useNavigate();
  const { vendorId: paramVendorId } = useParams();
  const vendorId = propVendorId || paramVendorId;

  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Fetch vendor details
  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ["vendorDetails", vendorId],
    queryFn: () => fetchVendorDetails(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  // Fetch subscription plans 
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ["mealPlans", vendorId],
    queryFn: () => fetchMealPlansByVendor(vendorId),
    enabled: !!vendorId,
  });

  // Fetch vendor profile for extra info 
  const { data: vendorWithMenu, isLoading: vendorWithMenuLoading } = useQuery({
    queryKey: ["vendorWithMenu", vendorId],
    queryFn: () => fetchFoodVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  // Fetch meal items 
  const { data: mealItemsData } = useQuery({
    queryKey: ["mealItems", vendorId],
    queryFn: () => fetchMealsByVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  // Fetch reviews 
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => fetchReviewsForVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  //  Derived state 
  const filteredPlans = plans?.results?.filter(plan => plan.frequency === selectedPlan) || [];

  const selectedPlans =
    plans?.results?.filter(plan => selectedPlanIds.includes(plan.id)) || [];

  const totalPrice = selectedPlans.reduce((sum, plan) => sum + Number(plan.price || 0), 0);

  console.log("Selected Plan IDs:", selectedPlanIds);
  console.log("Selected Plans objects:", selectedPlans);
  console.log("Total price:", totalPrice);

  const menuItems = Array.isArray(mealItemsData)
    ? mealItemsData
    : Array.isArray(mealItemsData?.results)
    ? mealItemsData.results
    : [];

  //  Handlers
  const handleBack = () => navigate(-1);
  const handleMore = () => console.log("More options");

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanIds([]);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanIds((prev) => {
      if (prev.includes(planId)) return prev.filter(id => id !== planId);
      return [...prev, planId];
    });
  };

  const handleViewAllMenu = () => navigate(`/vendor/${vendorId}/menu`);
  const handleMealClick = (meal) => setSelectedMeal(meal);
  const handleCloseMealDetails = () => setSelectedMeal(null);

  const handleSubscribe = () => {
    if (selectedPlanIds.length === 0) {
      alert("Please select at least one plan");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmSubscription = () => {
    if (selectedPlanIds.length === 0) {
      alert("Please select at least one plan");
      return;
    }

    setIsModalOpen(false);

    // SubscriptionPaymentPage expects a single plan — use the first selected
    const plan = selectedPlans[0];

    navigate(`/subscription/payment/${plan.id}`, {
      state: {
        plan,
        vendor,
      },
    });
  };

  //  Loading 
  if (plansLoading || vendorLoading || vendorWithMenuLoading || reviewsLoading) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813] dark:text-text-main-dark">Loading...</div>
      </div>
    );
  }

  if (plansError) {
    console.error("Fatal: could not load subscription plans:", plansError?.message);
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-red-500 font-semibold mb-2">
            Could not load subscription plans.
          </p>
          <p className="text-gray-400 text-sm mb-4">Please check your connection and try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#13ec49] text-[#111813] font-bold px-6 py-3 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (vendorError) {
    console.warn("Vendor details unavailable (500/404), rendering without vendor info");
  }

 
  return (
    <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen pb-32">
      {/* App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Vendor Profile
          </h2>
          <button
            onClick={handleMore}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical />
          </button>
        </div>
      </div>

      <VendorHero vendor={vendor || null} reviews={reviews?.results || []} />
      <PlanToggle selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />

      <div className="grid grid-cols-1 gap-4 px-4 py-4">
        {selectedPlan === "monthly" ? (
          <div className="mx-auto py-16 w-full md:w-1/2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-6 py-10 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 text-center">
            <span className="text-xl md:text-3xl font-extrabold">
              Monthly plans coming soon!
            </span>
          </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanIds.includes(plan.id)}
              isPopular={plan.popular}
              onSelect={handlePlanSelect}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No {selectedPlan} plans available
          </div>
        )}
      </div>

      <MenuPreview
        menuItems={menuItems}
        onViewAll={handleViewAllMenu}
        onMealClick={handleMealClick}
      />

      <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />

      <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
        selectedPlans={selectedPlans}
        vendor={vendor}
        isLoading={false}
      />
    </div>
  );
};

export default VendorSubscriptionPage;