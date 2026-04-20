import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import StickyCTA from "../components/subscription/StickyCTA";
import {
  fetchVendorDetails,
  fetchReviewsForVendor,
} from "../services/subscriptionApi";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock, MapPin } from "lucide-react";
import {
  fetchMealPlansByVendor,
  fetchFoodVendor,
  fetchMealsByVendor,
  fetchPublicProfile,
} from "../services/api";
import { saveSubscriptionFlowState } from "../utils/subscriptionFlow";

const VendorSubscriptionPage = ({ vendorId: propVendorId }) => {
  const navigate = useNavigate();
  const { vendorId: paramVendorId } = useParams();
  const vendorId = propVendorId || paramVendorId;

  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDays, setSelectedDays] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [preferredTime, setPreferredTime] = useState("12:00");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [collectionCode, setCollectionCode] = useState("");

  const DELIVERY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // // Fetch vendor details
  // const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
  //   queryKey: ["vendorDetails", vendorId],
  //   queryFn: () => fetchVendorDetails(vendorId),
  //   enabled: !!vendorId,
  //   retry: false,
  // });

  // // Fetch subscription plans
  // const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
  //   queryKey: ["mealPlans", vendorId],
  //   queryFn: () => fetchMealPlansByVendor(vendorId),
  //   enabled: !!vendorId,
  // });

  // // Fetch vendor profile for extra info
  // const { data: vendorWithMenu, isLoading: vendorWithMenuLoading } = useQuery({
  //   queryKey: ["vendorWithMenu", vendorId],
  //   queryFn: () => fetchFoodVendor(vendorId),
  //   enabled: !!vendorId,
  //   retry: false,
  // });

  // // Fetch meal items
  // const { data: mealItemsData } = useQuery({
  //   queryKey: ["mealItems", vendorId],
  //   queryFn: () => fetchMealsByVendor(vendorId),
  //   enabled: !!vendorId,
  //   retry: false,
  // });

  // // Fetch reviews
  // const { data: reviews, isLoading: reviewsLoading } = useQuery({
  //   queryKey: ["reviews", vendorId],
  //   queryFn: () => fetchReviewsForVendor(vendorId),
  //   enabled: !!vendorId,
  //   retry: false,
  // });

  //  Derived state

  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useQuery({
    queryKey: ["vendorDetails", vendorId],
    queryFn: () => fetchVendorDetails(vendorId),
    enabled: !!vendorId,
    retry: false,
  });
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["mealPlans", vendorId],
    queryFn: () => fetchMealPlansByVendor(vendorId),
    enabled: !!vendorId,
  });
  const { data: vendorWithMenu, isLoading: vendorWithMenuLoading } = useQuery({
    queryKey: ["vendorWithMenu", vendorId],
    queryFn: () => fetchFoodVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });
  const { data: mealItemsData } = useQuery({
    queryKey: ["mealItems", vendorId],
    queryFn: () => fetchMealsByVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => fetchReviewsForVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  const filteredPlans =
    plans?.results?.filter((plan) => plan.frequency === selectedPlan) || [];

  const selectedPlans =
    plans?.results?.filter((plan) => selectedPlanIds.includes(plan.id)) || [];

  const totalPrice =
    selectedPlans.reduce((sum, plan) => sum + Number(plan.price || 0), 0) *
    quantity;

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
  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const handleMore = () => console.log("More options");

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanIds([]);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [planId],
    );
  };

  const handleSubscribe = () => {
    if (selectedPlanIds.length === 0) {
      alert("Please select a plan to continue");
      return;
    }

    const plan = selectedPlans[0];
    const subscriptionFlowState = {
      plan,
      vendor,
      vendorId,
      totalPrice,
      selectedDays,
      quantity,
      preferredTime,
      deliveryType,
      address: "",
      collectionCode,
    };

    saveSubscriptionFlowState(subscriptionFlowState);
    navigate("/subscription/details", {
      state: subscriptionFlowState,
    });
  };

  //   const handleCloseModal = () => setIsModalOpen(false);

  //   const handleConfirmSubscription = () => {
  //     if (selectedPlanIds.length === 0) {
  //       alert("Please select at least one plan");
  //       return;
  //     }

  //     setIsModalOpen(false);

  //    navigate(`/subscription/payment`, {
  //   state: {
  //     plans: selectedPlans,
  //     vendor,
  //     totalPrice,
  //     selectedDays,
  //     quantity,
  //     addExtra,
  //     extraPrice: EXTRA_PRICE,
  //   },
  // });
  //   };

  //  Loading
  if (
    plansLoading ||
    vendorLoading ||
    vendorWithMenuLoading ||
    reviewsLoading
  ) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813] dark:text-text-main-dark">
          Loading...
        </div>
      </div>
    );
  }

  if (plansError) {
    console.error(
      "Fatal: could not load subscription plans:",
      plansError?.message,
    );
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-red-500 font-semibold mb-2">
            Could not load subscription plans.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Please check your connection and try again.
          </p>
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
    console.warn(
      "Vendor details unavailable (500/404), rendering without vendor info",
    );
  }

  return (
    <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen pb-32">
      {/* App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Vendor Profile
          </h2>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-8 px-4">
          {/* Left Column: Vendor Info and Plans */}
          <div className="flex-1 lg:max-w-[65%]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <VendorHero
                vendor={vendor || null}
                reviews={reviews?.results || []}
                hasSubscriptionPlans={filteredPlans.length > 0}
              />
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 px-2">Choose a Plan</h3>
              <PlanToggle
                selectedPlan={selectedPlan}
                onPlanChange={handlePlanChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {selectedPlan === "monthly" ? (
                  <div className="col-span-full py-16 w-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 text-center">
                    <span className="text-xl md:text-2xl font-extrabold">
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
                  <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 text-sm">
                    No {selectedPlan} plans available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customization (Sticky on Desktop) */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
              <h3 className="text-xl font-bold border-b border-gray-50 dark:border-gray-800 pb-4">
                Customize Subscription
              </h3>

              {selectedPlanIds.length > 0 ? (
                <div className="space-y-6">
                  {/* Address Display for Selection Transparency */}
                  {selectedPlans[0]?.address && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-[#13ec49]/20 flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 text-[#13ec49]">
                        <BadgeCheck size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Pickup/Restaurant Address
                        </p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {selectedPlans[0].address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Number of Plates <span className="text-red-500">*</span>
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-white"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold w-6 text-center dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((prev) => Math.min(10, prev + 1))
                        }
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-white"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400">
                        plate{quantity > 1 ? "s" : ""} per delivery
                      </span>
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Preferred{" "}
                      {deliveryType === "delivery" ? "Delivery" : "Pickup"} Time
                    </h3>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Clock className="text-gray-400" size={18} />
                      <input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Method Selector */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      How do you want it?
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("delivery")}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          deliveryType === "delivery"
                            ? "border-[#13ec49] bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <MapPin
                          size={20}
                          className={
                            deliveryType === "delivery"
                              ? "text-[#13ec49]"
                              : "text-gray-400"
                          }
                        />
                        <span className="text-xs font-bold dark:text-white">
                          Deliver to me
                        </span>
                      </button>
                      <button
                        onClick={() => setDeliveryType("pickup")}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          deliveryType === "pickup"
                            ? "border-[#13ec49] bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className="relative">
                          <Clock
                            size={20}
                            className={
                              deliveryType === "pickup"
                                ? "text-[#13ec49]"
                                : "text-gray-400"
                            }
                          />
                        </div>
                        <span className="text-xs font-bold dark:text-white">
                          Pickup myself
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Collection Code */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Collection Code (Optional)
                    </h3>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      <BadgeCheck className="text-gray-400" size={18} />
                      <input
                        type="text"
                        value={collectionCode}
                        onChange={(e) => setCollectionCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                        ₦{Number(totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={!totalPrice}
                      className="w-full bg-[#13ec49] text-green-950 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#13ec49]/20 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Subscribe Now
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <BadgeCheck className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-400 text-sm max-w-[200px]">
                    Select a meal plan to start customizing your subscription
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />
      </div>

      {/* <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
        selectedPlans={selectedPlans}
        vendor={vendor}
        isLoading={false}
      /> */}
    </div>
  );
};

export default VendorSubscriptionPage;
