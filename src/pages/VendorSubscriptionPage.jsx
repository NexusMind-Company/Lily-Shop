import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import MenuPreview from "../components/subscription/MenuPreview";
import StickyCTA from "../components/subscription/StickyCTA";
// import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
import { fetchVendorDetails } from "../services/subscriptionApi";
import {
  fetchMealPlansByVendor,
  fetchFoodVendor,
  fetchMealsByVendor,
} from "../services/api";
import { fetchReviewsForVendor } from "../services/subscriptionApi";
import { ArrowLeft, MoreVertical } from "lucide-react";

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
const [addExtra, setAddExtra] = useState(false);


const DELIVERY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EXTRA_PRICE = 300;
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

// const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
//   queryKey: ["vendorDetails", vendorId],
//   queryFn: () => fetchVendorDetails(vendorId),
//   enabled: !!vendorId,
//   retry: false,
// });
// const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
//   queryKey: ["mealPlans", vendorId],
//   queryFn: () => fetchMealPlansByVendor(vendorId),
//   enabled: !!vendorId,
// });
// const { data: vendorWithMenu, isLoading: vendorWithMenuLoading } = useQuery({
//   queryKey: ["vendorWithMenu", vendorId],
//   queryFn: () => fetchFoodVendor(vendorId),
//   enabled: !!vendorId,
//   retry: false,
// });
// const { data: mealItemsData } = useQuery({
//   queryKey: ["mealItems", vendorId],
//   queryFn: () => fetchMealsByVendor(vendorId),
//   enabled: !!vendorId,
//   retry: false,
// });
// const { data: reviews, isLoading: reviewsLoading } = useQuery({
//   queryKey: ["reviews", vendorId],
//   queryFn: () => fetchReviewsForVendor(vendorId),
//   enabled: !!vendorId,
//   retry: false,
// });

const vendor = {
  id: vendorId,
  name: "Mama's Kitchen",
  description: "Delicious home cooked meals delivered fresh daily",
  cuisine: "Nigerian",
  location: "Lekki, Lagos",
  rating: 4.5,
  reviewCount: "128",
  verified: true,
  phone: "08012345678",
  all_media_urls: "https://i.pinimg.com/736x/03/e9/84/03e984afeb479490cab605c39bfdac03.jpg",
};

const plans = {
  results: [
    {
      id: "plan-1",
      plan_name: "Basic Plan",
      price: 15000,
      frequency: "weekly",
      description: "1 meal per day, Mon-Fri",
      popular: false,
    },
    {
      id: "plan-2",
      plan_name: "Standard Plan",
      price: 25000,
      frequency: "weekly",
      description: "2 meals per day, Mon-Fri",
      popular: true,
    },
    {
      id: "plan-3",
      plan_name: "Premium Plan",
      price: 35000,
      frequency: "weekly",
      description: "3 meals per day, Mon-Sun",
      popular: false,
    },
  ],
};

const mealItemsData = [
  {
    id: "meal-1",
    name: "Jollof Rice & Chicken",
    description: "Classic Nigerian jollof rice with grilled chicken",
    price: 2500,
    all_media_urls: [],
  },
  {
    id: "meal-2",
    name: "Egusi Soup & Eba",
    description: "Rich egusi soup served with smooth eba",
    price: 2000,
    all_media_urls: [],
  },
  {
    id: "meal-3",
    name: "Pepper Soup",
    description: "Spicy catfish pepper soup",
    price: 3000,
    all_media_urls: [],
  },
  {
    id: "meal-4",
    name: "Fried Rice & Plantain",
    description: "Nigerian fried rice with sweet fried plantain",
    price: 2800,
    all_media_urls: [],
  },
];

const reviews = {
  results: [
    {
      id: "review-1",
      user_name: "Chioma A.",
      rating: 5,
      review_text: "Best food delivery service I've used! Always fresh and on time.",
      created_at: "2024-11-01T10:00:00Z",
    },
    {
      id: "review-2",
      user_name: "Emeka O.",
      rating: 4,
      review_text: "Great food, portions are generous. Would recommend!",
      created_at: "2024-10-28T14:30:00Z",
    },
    {
      id: "review-3",
      user_name: "Aisha M.",
      rating: 5,
      review_text: "Mama's Kitchen never disappoints. The jollof rice is 🔥",
      created_at: "2024-10-20T09:15:00Z",
    },
  ],
};

const vendorLoading = false;
const vendorError = null;
const plansLoading = false;
const plansError = null;
const vendorWithMenuLoading = false;
const reviewsLoading = false;
 
 
  const filteredPlans = plans?.results?.filter(plan => plan.frequency === selectedPlan) || [];

  const selectedPlans =
    plans?.results?.filter(plan => selectedPlanIds.includes(plan.id)) || [];

 const extraTotal = addExtra ? EXTRA_PRICE : 0;
const totalPrice = selectedPlans.reduce((sum, plan) => sum + Number(plan.price || 0), 0) * quantity + extraTotal;

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
  if (selectedDays.length === 0) {
    alert("Please select at least one delivery day");
    return;
  }
  navigate("/subscription/details", {
    state: {
      plans: selectedPlans,
      vendor,
      totalPrice,
      selectedDays,
      quantity,
      addExtra,
      extraPrice: EXTRA_PRICE,
    },
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

    {/* Delivery Days */}
    <div>
      <h3 className="text-base font-bold mb-3">
        Select Delivery Days <span className="text-red-500">*</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {DELIVERY_DAYS.map((day) => (
          <button
            key={day}
            onClick={() => handleDayToggle(day)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              selectedDays.includes(day)
                ? "bg-[#13ec49] text-[#111813] border-[#13ec49]"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      {selectedDays.length === 0 && (
        <p className="text-xs text-red-400 mt-2">Please select at least one day</p>
      )}
    </div>

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

    {/* Extra */}
    <div>
      <h3 className="text-base font-bold mb-3">Add Extra</h3>
      <div
        onClick={() => setAddExtra((prev) => !prev)}
        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
          addExtra
            ? "border-[#13ec49] bg-green-50 dark:bg-green-900/20"
            : "border-gray-200 bg-white dark:bg-slate-800"
        }`}
      >
        <div>
          <p className="font-semibold text-sm">Add Extra Portion</p>
          <p className="text-xs text-gray-400">An additional portion added to your delivery</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#13ec49]">+₦{EXTRA_PRICE}</span>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            addExtra ? "border-[#13ec49] bg-[#13ec49]" : "border-gray-300"
          }`}>
            {addExtra && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
      </div>
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