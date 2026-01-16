import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { createSubscription } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { getCurrentUserId } from "../services/supabase";
import { ArrowLeft, MoreVertical } from "lucide-react";

/**
 * VendorSubscriptionPage component - Page for customers to subscribe to vendor meal plans
 * @param {Object} props - Component props
 */
const VendorSubscriptionPage = () => {
  const navigate = useNavigate();
  const vendorId = getCurrentUserId(); // Get vendor ID from logged-in session

  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const subscriptionMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: (data) => {
      // Handle Paystack payment redirect
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        // For wallet payments or instant approvals
        navigate("/subscription-success");
      }
    },
    onError: (error) => {
      console.error("Subscription creation failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create subscription. Please try again."
      );
    },
  });

  const handleConfirmSubscription = async () => {
    if (!selectedPlanId) {
      alert("Please select a plan first");
      return;
    }

    const subscriptionPayload = {
      vendor_id: vendorId,
      plan_id: selectedPlanId,
      payment_method: "paystack", // Default to Paystack, could be made configurable
      // meal_selections and delivery_address_id can be added later
    };

    subscriptionMutation.mutate(subscriptionPayload);
    setIsModalOpen(false);
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
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813]  dark:text-text-main-dark">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || plansError || menuError) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading subscription page. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen pb-32">
      {/* Top App Bar */}
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
        isLoading={subscriptionMutation.isPending}
      />
    </div>
  );
};

export default VendorSubscriptionPage;
