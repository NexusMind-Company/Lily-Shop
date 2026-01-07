import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import MenuPreview from "../components/subscription/MenuPreview";
import StickyCTA from "../components/subscription/StickyCTA";
import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
import {
  fetchVendorDetails,
  fetchMealPlans,
  fetchMenuItems,
} from "../services/subscriptionApi";

/**
 * VendorSubscriptionPage component - Page for customers to subscribe to vendor meal plans
 * @param {Object} props - Component props
 */
const VendorSubscriptionPage = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams(); // Assuming vendorId from URL params

  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch vendor details
  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useQuery({
    queryKey: ["vendorDetails", vendorId],
    queryFn: () => fetchVendorDetails(vendorId),
    enabled: !!vendorId,
  });

  // Fetch meal plans
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["mealPlans", vendorId],
    queryFn: () => fetchMealPlans(vendorId),
    enabled: !!vendorId,
  });

  // Fetch menu items
  const {
    data: menuItems,
    isLoading: menuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ["menuItems", vendorId],
    queryFn: () => fetchMenuItems(vendorId),
    enabled: !!vendorId,
  });

  // Event handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleMore = () => {
    // Handle more options
    console.log("More options");
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    // Reset selected plan when switching periods
    setSelectedPlanId(null);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const handleViewAllMenu = () => {
    // Navigate to full menu
    navigate(`/vendor/${vendorId}/menu`);
  };

  const handleSubscribe = () => {
    if (!selectedPlanId) {
      alert("Please select a plan first");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmSubscription = async () => {
    setIsSubscribing(true);
    try {
      // Here you would implement the actual subscription logic
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to success page or show success message
      navigate("/subscription-success");
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setIsSubscribing(false);
      setIsModalOpen(false);
    }
  };

  // Filter plans by selected period
  const filteredPlans =
    plans?.filter((plan) => plan.period === selectedPlan) || [];

  // Calculate total price
  const selectedPlanData = plans?.find((plan) => plan.id === selectedPlanId);
  const totalPrice = selectedPlanData ? selectedPlanData.price : 0;

  // Loading state
  if (vendorLoading || plansLoading || menuLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-text-main-light dark:text-text-main-dark">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || plansError || menuError) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading subscription page. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Vendor Profile
          </h2>
          <button
            onClick={handleMore}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              more_vert
            </span>
          </button>
        </div>
      </div>

      <VendorHero vendor={vendor} />

      <PlanToggle selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 py-4">
        {filteredPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            isPopular={plan.popular}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      <MenuPreview menuItems={menuItems} onViewAll={handleViewAllMenu} />

      <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />

      <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
        selectedPlan={selectedPlanData}
        vendor={vendor}
        isLoading={isSubscribing}
      />
    </div>
  );
};

export default VendorSubscriptionPage;
