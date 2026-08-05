import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import VendorHero from "../components/subscription/VendorHero";
import PlanToggle from "../components/subscription/PlanToggle";
import PricingCard from "../components/subscription/PricingCard";
import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
import ReviewModal from "../components/common/ReviewModal";
import { ReviewCard } from "../components/common/ReviewList";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
  Phone,
  Hash,
  Truck,
  ShoppingBag,
  Star,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { fetchMealPlansByVendor, fetchMealsByVendor } from "../services/api";
import {
  fetchVendorDetails,
  fetchReviewsForVendor,
} from "../services/subscriptionApi";
import { saveSubscriptionFlowState } from "../utils/subscriptionFlow";
import { toast } from "react-hot-toast";

const VendorSubscriptionPage = ({ vendorId: propVendorId }) => {
  const navigate = useNavigate();
  const { vendorId: paramVendorId } = useParams();
  const vendorId = propVendorId || paramVendorId;

  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("food");
  const [orderingProductId, setOrderingProductId] = useState(null);
  const [currentOrderQuantity, setCurrentOrderQuantity] = useState(1);

  const [quantity, setQuantity] = useState(1);
  const [preferredTime, setPreferredTime] = useState("12:00");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [collectionCode, setCollectionCode] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [allergies, setAllergies] = useState("");
  const [portionSize, setPortionSize] = useState("regular");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showCustomization, setShowCustomization] = useState(false);

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
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => fetchReviewsForVendor(vendorId),
    enabled: !!vendorId,
    retry: false,
  });

  const {
    data: mealsData,
    isLoading: mealsLoading,
  } = useQuery({
    queryKey: ["vendorMeals", vendorId],
    queryFn: () => fetchMealsByVendor(vendorId),
    enabled: !!vendorId,
  });

  const meals = Array.isArray(mealsData) ? mealsData : mealsData?.results || [];

  const filteredPlans =
    plans?.results?.filter((plan) => plan.frequency === selectedPlan) || [];

  const selectedPlans =
    plans?.results?.filter((plan) => selectedPlanIds.includes(plan.id)) || [];

  const totalPrice =
    selectedPlans.reduce((sum, plan) => sum + Number(plan.price || 0), 0) *
    quantity;

  //  Handlers
  const handleBack = () => navigate(-1);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanIds([]);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [planId],
    );
  };

  const handleQuantityChange = (delta) => {
    setCurrentOrderQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleStartOrder = (productId) => {
    setOrderingProductId(productId);
    setCurrentOrderQuantity(1);
  };

  const handleConfirmOrder = (meal) => {
    setOrderingProductId(null);
    navigate("/checkout", {
      state: {
        directBuy: true,
        product: { ...meal, is_food: true },
        quantity: currentOrderQuantity,
        selectedItemIds: [meal.id],
      },
    });
  };

  const isValid = () => {
    if (selectedPlanIds.length === 0) return false;
    if (!deliveryType) return false;
    if (!phone.trim()) return false;
    if (deliveryType === "delivery" && !address.trim()) return false;
    return true;
  };

  const handleSubscribe = () => {
    if (!isValid()) {
      if (selectedPlanIds.length === 0) {
        toast.error("Please select a plan to continue");
      } else {
        toast.error(
          "Please fill in all required fields (Phone and Address if delivery)",
        );
      }
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    const plan = selectedPlans[0];
    const subscriptionFlowState = {
      plan,
      vendor,
      vendorId,
      totalPrice,
      quantity,
      preferredTime,
      deliveryType,
      address,
      phone,
      collectionCode,
      dietaryPreferences,
      allergies,
      portionSize,
      specialInstructions,
    };

    saveSubscriptionFlowState(subscriptionFlowState);
    navigate("/subscription/payment", {
      state: subscriptionFlowState,
    });
  };

  const handleCloseModal = () => setIsModalOpen(false);

  //  Loading
  if (plansLoading || vendorLoading || reviewsLoading) {
    return (
      <div className="bg-[#f6f8f6] min-h-screen flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  if (plansError) {
    console.error(
      "Fatal: could not load subscription plans:",
      plansError?.message,
    );
    return (
      <div className="bg-[#f6f8f6] min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-red-500 font-semibold mb-2">
            Could not load subscription plans.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-lily text-slate-900 font-bold px-6 py-3 rounded-xl"
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
    <div className="bg-[#f6f8f6] min-h-screen pb-32">
      {/* App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Vendor Info and Plans */}
          <div className="flex-1 lg:max-w-[65%] px-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black mb-6 text-black">
              <VendorHero
                vendor={vendor || null}
                reviews={reviews?.results || []}
                hasSubscriptionPlans={filteredPlans.length > 0}
              />
            </div>

            <div className="mb-6">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("food")}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "food"
                      ? "border-lily text-lily"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Instant Food
                </button>
                <button
                  onClick={() => setActiveTab("subscriptions")}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "subscriptions"
                      ? "border-lily text-lily"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Subscriptions
                </button>
              </div>

              {activeTab === "food" && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4 px-2">Live Kitchen</h3>
                  {mealsLoading ? (
                    <div className="text-gray-500 p-4">Loading meals...</div>
                  ) : meals.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition relative"
                        >
                          {!meal.is_available && (
                            <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                              <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-md text-xs">
                                Sold Out
                              </span>
                            </div>
                          )}
                          <div className="relative aspect-square">
                            <img
                              src={meal.image_url || "/placeholder.png"}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {meal.name}
                            </h4>
                            <p className="text-lily font-bold mb-3">
                              ₦{meal.price?.toLocaleString()}
                            </p>
                            
                            {orderingProductId === meal.id ? (
                              <div className="space-y-2 relative z-30">
                                <div className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-2">
                                  <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="font-semibold min-w-7.5 text-center">
                                    {currentOrderQuantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleConfirmOrder(meal)}
                                    className="flex-1 bg-lily text-white py-2 rounded-lg text-sm font-semibold hover:bg-darklily transition"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setOrderingProductId(null)}
                                    className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartOrder(meal.id)}
                                disabled={!meal.is_available}
                                className={`w-full py-2 rounded-lg relative z-30 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                                  meal.is_available 
                                    ? "bg-lily text-white hover:bg-darklily" 
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <ShoppingCart size={16} />
                                Order
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
                      No instant food available
                    </div>
                  )}
                </div>
              )}

              {activeTab === "subscriptions" && (
                <>
                  {/* Reviews Section */}
                  <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star
                          className="w-5 h-5 text-amber-400"
                          fill="currentColor"
                        />
                        <span className="font-black text-gray-900 text-lg">
                          {Number(vendor?.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-sm font-medium">
                          ({vendor?.review_count || 0} reviews)
                        </span>
                      </div>
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-4 py-2 bg-lily text-white rounded-full text-sm font-semibold hover:bg-lily/90 transition-colors shadow-sm shadow-lily/25"
                      >
                        Write Review
                      </button>
                    </div>
                    {(reviews?.results || []).length > 0 ? (
                      <div className="space-y-3">
                        {reviews.results.slice(0, 3).map((review, idx) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            isLast={idx === Math.min(2, reviews.results.length - 1)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <Star size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-semibold text-gray-500 mb-1">
                          No reviews yet
                        </p>
                        <p className="text-sm text-gray-400">
                          Be the first to share your experience!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Choose a Plan Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4 px-2">Choose a Plan</h3>
                  <PlanToggle
                    selectedPlan={selectedPlan}
                    onPlanChange={handlePlanChange}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {selectedPlan === "monthly" ? (
                      <div className="col-span-full py-16 w-full bg-white text-gray-700 px-6 rounded-2xl shadow-sm border border-gray-200 text-center">
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
                      <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
                        No {selectedPlan} plans available
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Customization (Sticky on Desktop) - Only show if subscriptions tab is active */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-24 lg:h-fit px-4">
            {activeTab === "subscriptions" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold border-b border-gray-50 pb-4">
                Customize Subscription
              </h3>

              {selectedPlanIds.length > 0 ? (
                <div className="space-y-6">
                  {/* Address Display for Selection Transparency */}
                  {selectedPlans[0]?.address && (
                    <div className="p-3 bg-lily/50 rounded-xl border border-lily/20 flex items-start gap-3">
                      <div className="mt-1 shrink-0 text-lily">
                        <BadgeCheck size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Pickup/Restaurant Address
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
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
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((prev) => Math.min(10, prev + 1))
                        }
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
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
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <Clock className="text-gray-400" size={18} />
                      <input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Method Selector */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      How do you want it?{" "}
                      <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("delivery")}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          deliveryType === "delivery"
                            ? "border-lily bg-lily/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Truck
                          size={20}
                          className={
                            deliveryType === "delivery"
                              ? "text-lily"
                              : "text-gray-400"
                          }
                        />
                        <span className="text-xs font-bold">Deliver to me</span>
                      </button>
                      <button
                        onClick={() => setDeliveryType("pickup")}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          deliveryType === "pickup"
                            ? "border-lily bg-lily/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <ShoppingBag
                          size={20}
                          className={
                            deliveryType === "pickup"
                              ? "text-lily"
                              : "text-gray-400"
                          }
                        />
                        <span className="text-xs font-bold">Pickup myself</span>
                      </button>
                    </div>
                  </div>

                  {/* Address — only for delivery */}
                  {deliveryType === "delivery" && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Delivery Address <span className="text-red-500">*</span>
                      </h3>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <MapPin className="text-gray-400" size={18} />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter delivery address"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone — always required */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Phone Number <span className="text-red-500">*</span>
                    </h3>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <Phone className="text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>

                  {/* Collection Code */}
                  {deliveryType === "pickup" && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Collection Code (Optional)
                      </h3>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <Hash className="text-gray-400" size={18} />
                        <input
                          type="text"
                          value={collectionCode}
                          onChange={(e) => setCollectionCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Meal Customization Section */}
                  <div>
                    <button
                      onClick={() => setShowCustomization(!showCustomization)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-lily transition-colors bg-gray-50"
                    >
                      <span className="text-sm font-bold text-[#111813] uppercase tracking-wider">
                        Customize Your Meal Plan
                      </span>
                      <ShoppingBag
                        className={
                          showCustomization
                            ? "text-lily rotate-180"
                            : "text-gray-400"
                        }
                        size={18}
                      />
                    </button>
                  </div>

                  {showCustomization && (
                    <div className="space-y-4 pt-2">
                      {/* Dietary Preferences */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Dietary Preferences{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Vegetarian, Keto, Low-sodium"
                          value={dietaryPreferences}
                          onChange={(e) =>
                            setDietaryPreferences(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white text-sm resize-none"
                        />
                      </div>

                      {/* Allergies */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Allergies{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Peanuts, Dairy, Gluten"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white text-sm"
                        />
                      </div>

                      {/* Portion Size */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Portion Size{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["small", "regular", "large"].map((size) => (
                            <button
                              key={size}
                              onClick={() => setPortionSize(size)}
                              className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                                portionSize === size
                                  ? "bg-lily text-white shadow-sm"
                                  : "bg-white text-gray-500 border border-gray-200"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Special Instructions{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Any special requests for your meals..."
                          value={specialInstructions}
                          onChange={(e) =>
                            setSpecialInstructions(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-3xl font-black text-lily leading-none">
                        ₦{Number(totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={!totalPrice}
                      className="w-full bg-lily text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-lily/20 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Subscribe Now
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <BadgeCheck className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-400 text-sm max-w-50">
                    Select a meal plan to start customizing your subscription
                  </p>
                </div>
              )}
            </div>
            )}
            <div className="h-[200px] hidden lg:block"></div>
          </div>
        </div>
      </div>

      <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        selectedPlans={selectedPlans}
        vendor={vendor}
        totalPrice={totalPrice}
        quantity={quantity}
        deliveryType={deliveryType}
        address={address}
        phone={phone}
        collectionCode={collectionCode}
        dietaryPreferences={dietaryPreferences}
        allergies={allergies}
        portionSize={portionSize}
        specialInstructions={specialInstructions}
        isLoading={false}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        vendorId={vendorId}
        vendorName={vendor?.name}
      />
    </div>
  );
};

export default VendorSubscriptionPage;
