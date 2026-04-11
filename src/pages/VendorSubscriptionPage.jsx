import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import MenuPreview from "../components/subscription/MenuPreview";
import StickyCTA from "../components/subscription/StickyCTA";
import { fetchVendorDetails, fetchReviewsForVendor } from "../services/subscriptionApi";
import { ArrowLeft, MoreVertical, BadgeCheck, Clock, MapPin } from "lucide-react";
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
  const [selectedMeal, setSelectedMeal] = useState(null);

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
 
 // 🔌 TODO: Remove mock data and uncomment useQuery calls when API is ready

const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
  queryKey: ["vendorDetails", vendorId],
  queryFn: () => fetchVendorDetails(vendorId),
  enabled: !!vendorId,
  retry: false,
});
const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
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

 
  const filteredPlans = plans?.results?.filter(plan => plan.frequency === selectedPlan) || [];

  const selectedPlans =
    plans?.results?.filter(plan => selectedPlanIds.includes(plan.id)) || [];

 const totalPrice = selectedPlans.reduce((sum, plan) => sum + Number(plan.price || 0), 0) * quantity;

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
    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
  );
};
  const handleMore = () => console.log("More options");

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanIds([]);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanIds([planId]);
  };

  const handleViewAllMenu = () => navigate("/vendor/dashboard/menu");
  const handleMealClick = (meal) => setSelectedMeal(meal);
  const handleCloseMealDetails = () => setSelectedMeal(null);

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
      address: plan.address,
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
      
      {/* Address Display for Selection Transparency */}
      {selectedPlanIds.length > 0 && selectedPlans[0]?.address && (
        <div className="mx-4 mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-[#13ec49]/30 flex items-start gap-3 shadow-sm">
          <div className="mt-1 flex-shrink-0 text-[#13ec49]">
            <BadgeCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pickup/Restaurant Address</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{selectedPlans[0].address}</p>
          </div>
        </div>
      )}

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

      {/* Customization Section - only show if a plan is selected */}
{selectedPlanIds.length > 0 && (
  <div className="px-4 py-4 space-y-6">

    {/* Quantity */}
    <div>
      <h3 className="text-base font-bold mb-3">
        Number of Plates <span className="text-red-500">*</span>
      </h3>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
        >
          −
        </button>
        <span className="text-xl font-bold w-6 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
        >
          +
        </button>
        <span className="text-sm text-gray-400">plate{quantity > 1 ? "s" : ""} per delivery</span>
      </div>
    </div>

    {/* Preferred Time */}
    <div>
      <h3 className="text-base font-bold mb-3">Preferred {deliveryType === "delivery" ? "Delivery" : "Pickup"} Time</h3>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200">
        <Clock className="text-gray-400" size={20} />
        <input
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold dark:text-white"
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2">Vendors will try their best to meet this time daily.</p>
    </div>

    {/* Collection Code */}
    <div>
      <h3 className="text-base font-bold mb-3">Collection Code (Optional)</h3>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200">
        <BadgeCheck className="text-gray-400" size={20} />
        <input
          type="text"
          value={collectionCode}
          onChange={(e) => setCollectionCode(e.target.value)}
          placeholder="Enter vendor's collection code"
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold dark:text-white"
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2">If the vendor provided a collection code, enter it here.</p>
    </div>

    {/* Delivery Method Selector (New) */}
    <div>
      <h3 className="text-base font-bold mb-3">How do you want it?</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setDeliveryType("delivery")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
            deliveryType === "delivery"
              ? "border-[#13ec49] bg-green-50 dark:bg-green-900/20"
              : "border-gray-200 bg-white dark:bg-slate-800"
          }`}
        >
          <MapPin size={24} className={deliveryType === "delivery" ? "text-[#13ec49]" : "text-gray-400"} />
          <span className="text-sm font-bold">Deliver to me</span>
        </button>
        <button
          onClick={() => setDeliveryType("pickup")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
            deliveryType === "pickup"
              ? "border-[#13ec49] bg-green-50 dark:bg-green-900/20"
              : "border-gray-200 bg-white dark:bg-slate-800"
          }`}
        >
          <div className="relative">
            <Clock size={24} className={deliveryType === "pickup" ? "text-[#13ec49]" : "text-gray-400"} />
            <div className="absolute -top-1 -right-1 bg-[#13ec49] w-2 h-2 rounded-full" />
          </div>
          <span className="text-sm font-bold">Pickup myself</span>
        </button>
      </div>
      {deliveryType === "pickup" && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
            💡 <strong>Logistics via Code:</strong> You'll get a unique code after payment. Show it at the restaurant to collect your food.
          </p>
        </div>
      )}
    </div>

  </div>
)}

      <MenuPreview
        menuItems={menuItems}
        onViewAll={handleViewAllMenu}
        onMealClick={handleMealClick}
      />

      <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />

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
