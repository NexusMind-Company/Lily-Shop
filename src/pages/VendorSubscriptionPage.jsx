// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useNavigate, useParams } from "react-router-dom";
// import VendorHero from "../components/subscription/VendorHero";
// import PlanToggle from "../components/subscription/PlanToggle";
// import PricingCard from "../components/subscription/PricingCard";
// import MenuPreview from "../components/subscription/MenuPreview";
// import StickyCTA from "../components/subscription/StickyCTA";
// import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
// import { fetchVendorDetails } from "../services/subscriptionApi";
// import {
//   fetchMealPlansByVendor,
//   fetchFoodVendor,
// } from "../services/api";
// import { fetchReviewsForVendor } from "../services/subscriptionApi";
// import { ArrowLeft, MoreVertical } from "lucide-react";

// /**
//  * VendorSubscriptionPage component - Page for customers to subscribe to vendor meal plans
//  */
// const VendorSubscriptionPage = ({ vendorId: propVendorId }) => {
//   const navigate = useNavigate();
//   const { vendorId: paramVendorId } = useParams();
//   const vendorId = propVendorId || paramVendorId;

//   const [selectedPlan, setSelectedPlan] = useState("weekly");
//   const [selectedPlanId, setSelectedPlanId] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedMeal, setSelectedMeal] = useState(null);

//   // Fetch vendor details
//   const {
//     data: vendor,
//     isLoading: vendorLoading,
//     error: vendorError,
//   } = useQuery({
//     queryKey: ["vendorDetails", vendorId],
//     queryFn: () => fetchVendorDetails(vendorId),
//     enabled: !!vendorId,
//   });

//   // Fetch meal plans (subscription plans for this vendor)
//   const {
//     data: plans,
//     isLoading: plansLoading,
//     error: plansError,
//   } = useQuery({
//     queryKey: ["mealPlans", vendorId],
//     queryFn: () => fetchMealPlansByVendor(vendorId),
//     enabled: !!vendorId,
//   });

//   // Fetch vendor details with menu items
//   const {
//     data: vendorWithMenu,
//     isLoading: vendorWithMenuLoading,
//     error: vendorWithMenuError,
//   } = useQuery({
//     queryKey: ["vendorWithMenu", vendorId],
//     queryFn: () => fetchFoodVendor(vendorId),
//     enabled: !!vendorId,
//   });

//   // Fetch vendor reviews
//   const {
//     data: reviews,
//     isLoading: reviewsLoading,
//     error: reviewsError,
//   } = useQuery({
//     queryKey: ["reviews", vendorId],
//     queryFn: () => fetchReviewsForVendor(vendorId),
//     enabled: !!vendorId,
//   });

//   // --- Event Handlers ---

//   const handleBack = () => navigate(-1);

//   const handleMore = () => {
//     console.log("More options");
//   };

//   const handlePlanChange = (plan) => {
//     setSelectedPlan(plan);
//     setSelectedPlanId(null);
//   };

//   const handlePlanSelect = (planId) => {
//     setSelectedPlanId(planId);
//   };

//   const handleViewAllMenu = () => {
//     navigate(`/vendor/${vendorId}/menu`);
//   };

//   const handleMealClick = (meal) => {
//     setSelectedMeal(meal);
//   };

//   const handleCloseMealDetails = () => {
//     setSelectedMeal(null);
//   };

//   const handleSubscribe = () => {
//     if (!selectedPlanId) {
//       alert("Please select a plan first");
//       return;
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   // ✅ FIXED: Navigate to payment page instead of calling API directly
//   const handleConfirmSubscription = () => {
//     if (!selectedPlanId) {
//       alert("Please select a plan first");
//       return;
//     }

//     setIsModalOpen(false);

//     navigate(`/subscription/payment/${selectedPlanId}`, {
//       state: {
//         plan: plans?.results?.find((p) => p.id === selectedPlanId),
//         vendor: vendor,
//       },
//     });
//   };

//   // Filter plans by selected period
//   const filteredPlans =
//     plans?.results?.filter((plan) => plan.frequency === selectedPlan) || [];

//   // Get selected plan data for price display
//   const selectedPlanData = plans?.results?.find(
//     (plan) => plan.id === selectedPlanId,
//   );
//   const totalPrice = selectedPlanData ? selectedPlanData.price : 0;

//   // Loading state
//   if (vendorLoading || plansLoading || vendorWithMenuLoading || reviewsLoading) {
//     return (
//       <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
//         <div className="text-[#111813] dark:text-text-main-dark">Loading...</div>
//       </div>
//     );
//   }

//   // Error state
//   if (vendorError || plansError || vendorWithMenuError || reviewsError) {
//     console.error("Error details:", {
//       vendorError: vendorError?.message,
//       plansError: plansError?.message,
//       vendorWithMenuError: vendorWithMenuError?.message,
//       reviewsError: reviewsError?.message,
//     });
//     return (
//       <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
//         <div className="text-red-500">
//           Error loading subscription page. Please try again.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen pb-32">
//       {/* Top App Bar */}
//       <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
//         <div className="flex items-center p-4 justify-between">
//           <button
//             onClick={handleBack}
//             className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft />
//           </button>
//           <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
//             Vendor Profile
//           </h2>
//           <button
//             onClick={handleMore}
//             className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//           >
//             <MoreVertical />
//           </button>
//         </div>
//       </div>

//       <VendorHero vendor={vendor} reviews={reviews?.results || []} />

//       <PlanToggle selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />

//       {/* Pricing Cards */}
//       <div className="grid grid-cols-1 gap-4 px-4 py-4">
//         {filteredPlans.map((plan) => (
//           <PricingCard
//             key={plan.id}
//             plan={plan}
//             isSelected={selectedPlanId === plan.id}
//             isPopular={plan.popular}
//             onSelect={handlePlanSelect}
//           />
//         ))}
//       </div>

//       <MenuPreview
//         menuItems={vendorWithMenu?.menus || []}
//         onViewAll={handleViewAllMenu}
//         onMealClick={handleMealClick}
//       />

//       {/* Meal Details Modal */}
//       {selectedMeal && (
//         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-background-dark rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
//               <h2 className="text-lg font-bold">{selectedMeal}</h2>
//               <button
//                 onClick={handleCloseMealDetails}
//                 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div className="p-4">
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
//                   Meal Plan Details
//                 </h3>
//                 <p className="text-slate-800 dark:text-slate-200">
//                   {selectedMeal} includes a balanced combination of protein, carbohydrates, and vegetables.
//                 </p>
//               </div>
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
//                   Available Plans
//                 </h3>
//                 <div className="space-y-2">
//                   {plans?.results?.map((plan) => (
//                     <div key={plan.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm font-medium">{plan.plan_name}</span>
//                         <span className="text-sm font-bold">₦{Number(plan.price).toLocaleString()}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//                         {plan.description}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <button
//                 onClick={handleCloseMealDetails}
//                 className="w-full bg-[#13ec49] text-white py-3 rounded-xl font-bold hover:bg-[#10d440] transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />

//       <SubscriptionConfirmationModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmSubscription}
//         selectedPlan={selectedPlanData}
//         vendor={vendor}
//         isLoading={false}
//       />
//     </div>
//   );
// };

// export default VendorSubscriptionPage;



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
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Fetch vendor details (for hero section)
  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useQuery({
    queryKey: ["vendorDetails", vendorId],
    queryFn: () => fetchVendorDetails(vendorId),
    enabled: !!vendorId,
  });

  // Fetch subscription plans
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["mealPlans", vendorId],
    queryFn: () => fetchMealPlansByVendor(vendorId),
    enabled: !!vendorId,
  });

  // Fetch vendor profile (used for hero extras if needed)
  // NOTE: vendorWithMenu.menus is a URL string, NOT an array — do not pass to MenuPreview
  const {
    data: vendorWithMenu,
    isLoading: vendorWithMenuLoading,
    error: vendorWithMenuError,
  } = useQuery({
    queryKey: ["vendorWithMenu", vendorId],
    queryFn: () => fetchFoodVendor(vendorId),
    enabled: !!vendorId,
  });

  // ✅ FIX: Fetch actual meal items from the correct endpoint
  // GET /foods/meals/vendors/{vendor_id}/ → returns paginated meal items (real array)
  const { data: mealItemsData } = useQuery({
    queryKey: ["mealItems", vendorId],
    queryFn: () => fetchMealsByVendor(vendorId),
    enabled: !!vendorId,
  });

  // Fetch vendor reviews
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => fetchReviewsForVendor(vendorId),
    enabled: !!vendorId,
  });

  // --- Event Handlers ---

  const handleBack = () => navigate(-1);

  const handleMore = () => {
    console.log("More options");
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanId(null);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const handleViewAllMenu = () => {
    navigate(`/vendor/${vendorId}/menu`);
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
  };

  const handleCloseMealDetails = () => {
    setSelectedMeal(null);
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

  const handleConfirmSubscription = () => {
    if (!selectedPlanId) {
      alert("Please select a plan first");
      return;
    }

    setIsModalOpen(false);

    navigate(`/subscription/payment/${selectedPlanId}`, {
      state: {
        plan: plans?.results?.find((p) => p.id === selectedPlanId),
        vendor: vendor,
      },
    });
  };

  // Filter plans by selected frequency
  const filteredPlans =
    plans?.results?.filter((plan) => plan.frequency === selectedPlan) || [];

  // Selected plan data
  const selectedPlanData = plans?.results?.find(
    (plan) => plan.id === selectedPlanId,
  );
  const totalPrice = selectedPlanData ? selectedPlanData.price : 0;

  // ✅ FIX: Safely extract meal items array — handles paginated or plain array response
  const menuItems = Array.isArray(mealItemsData)
    ? mealItemsData
    : Array.isArray(mealItemsData?.results)
    ? mealItemsData.results
    : [];

  // Loading state
  if (vendorLoading || plansLoading || vendorWithMenuLoading || reviewsLoading) {
    return (
      <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-[#111813] dark:text-text-main-dark">Loading...</div>
      </div>
    );
  }

  // Error state
  if (vendorError || plansError || vendorWithMenuError || reviewsError) {
    console.error("Error details:", {
      vendorError: vendorError?.message,
      plansError: plansError?.message,
      vendorWithMenuError: vendorWithMenuError?.message,
      reviewsError: reviewsError?.message,
    });
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

      <VendorHero vendor={vendor} reviews={reviews?.results || []} />

      <PlanToggle selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 py-4">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
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

      {/* ✅ FIX: pass menuItems (real array) not vendorWithMenu.menus (URL string) */}
      <MenuPreview
        menuItems={menuItems}
        onViewAll={handleViewAllMenu}
        onMealClick={handleMealClick}
      />

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-background-dark rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">
                {typeof selectedMeal === "object"
                  ? selectedMeal.name
                  : selectedMeal}
              </h2>
              <button
                onClick={handleCloseMealDetails}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {typeof selectedMeal === "object" && selectedMeal.description && (
                <div className="mb-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {selectedMeal.description}
                  </p>
                </div>
              )}
              {typeof selectedMeal === "object" && selectedMeal.price && (
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Price</span>
                  <span className="font-bold text-[#111813]">
                    ₦{Number(selectedMeal.price).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Available Subscription Plans
                </h3>
                <div className="space-y-2">
                  {plans?.results?.map((plan) => (
                    <div key={plan.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{plan.plan_name}</span>
                        <span className="text-sm font-bold">
                          ₦{Number(plan.price).toLocaleString()}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCloseMealDetails}
                className="w-full bg-[#13ec49] text-white py-3 rounded-xl font-bold hover:bg-[#10d440] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <StickyCTA totalPrice={totalPrice} onSubscribe={handleSubscribe} />

      <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
        selectedPlan={selectedPlanData}
        vendor={vendor}
        isLoading={false}
      />
    </div>
  );
};

export default VendorSubscriptionPage;