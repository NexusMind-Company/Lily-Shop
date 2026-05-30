import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Hash,
  Truck,
  ShoppingBag,
} from "lucide-react";
import SubscriptionConfirmationModal from "../components/subscription/SubscriptionConfirmationModal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  resolveSubscriptionFlowState,
  saveSubscriptionFlowState,
} from "../utils/subscriptionFlow";

const SubscriptionDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = resolveSubscriptionFlowState(location.state);

  // This receives everything passed from VendorSubscriptionPage
  const {
    plan,
    vendor,
    totalPrice,
    selectedDays,
    quantity,
    addExtra,
    extraPrice,
    preferredTime,
    vendorId,
  } = flowState || {};

  const [deliveryType, setDeliveryType] = useState(
    flowState?.deliveryType || "",
  ); // "delivery" or "pickup"
  const [address, setAddress] = useState(flowState?.address || "");
  const [phone, setPhone] = useState(flowState?.phone || "");
  const [collectionCode, setCollectionCode] = useState(
    flowState?.collectionCode || "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState(
    flowState?.dietaryPreferences || "",
  );
  const [allergies, setAllergies] = useState(flowState?.allergies || "");
  const [portionSize, setPortionSize] = useState(
    flowState?.portionSize || "regular",
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    flowState?.specialInstructions || "",
  );
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    if (!plan) {
      navigate("/subscriptions", { replace: true });
    }
  }, [plan, navigate]);

  useEffect(() => {
    if (!plan) return;

    saveSubscriptionFlowState({
      ...flowState,
      plan,
      vendor,
      vendorId,
      totalPrice,
      selectedDays,
      quantity,
      addExtra,
      extraPrice,
      preferredTime,
      deliveryType,
      address,
      phone,
      collectionCode,
      dietaryPreferences,
      allergies,
      portionSize,
      specialInstructions,
    });
  }, [
    flowState,
    plan,
    vendor,
    vendorId,
    totalPrice,
    selectedDays,
    quantity,
    addExtra,
    extraPrice,
    preferredTime,
    deliveryType,
    address,
    phone,
    collectionCode,
    dietaryPreferences,
    allergies,
    portionSize,
    specialInstructions,
  ]);

  const isValid = () => {
    if (!deliveryType) return false;
    if (!phone.trim()) return false;
    if (deliveryType === "delivery" && !address.trim()) return false;
    return true;
  };

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    if (!isValid()) {
      alert("Please fill in all required fields");
      return;
    }
    setIsModalOpen(true); // open modal instead
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    const paymentState = {
      ...flowState,
      plan,
      vendor,
      vendorId,
      totalPrice,
      selectedDays,
      quantity,
      addExtra,
      extraPrice,
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
    saveSubscriptionFlowState(paymentState);
    navigate("/subscription/payment", {
      state: paymentState,
    });
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="bg-[#f6f8f6] dark:bg-background-dark min-h-screen pb-32">
      {/* App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 gap-3">
          <button
            onClick={handleBack}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-bold">Subscription Details</h2>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Delivery Type */}
        <div>
          <h3 className="text-base font-bold mb-3">
            How do you want to receive your meals?{" "}
            <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Delivery Option */}
            <button
              onClick={() => setDeliveryType("delivery")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                deliveryType === "delivery"
                  ? "border-lily bg-lily/50 dark:bg-darklily/20"
                  : "border-gray-200 bg-white dark:bg-slate-800"
              }`}
            >
              <Truck
                className={
                  deliveryType === "delivery" ? "text-lily" : "text-gray-400"
                }
              />
              <span className="text-sm font-semibold">Deliver to me</span>
            </button>

            {/* Pickup Option */}
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                deliveryType === "pickup"
                  ? "border-lily bg-lily/50 dark:bg-lily/50"
                  : "border-gray-200 bg-white dark:bg-slate-800"
              }`}
            >
              <ShoppingBag
                className={
                  deliveryType === "pickup" ? "text-lily" : "text-gray-400"
                }
              />
              <span className="text-sm font-semibold">I'll pick up</span>
            </button>
          </div>
        </div>

        {/* Fields only show after delivery type is chosen */}
        {deliveryType && (
          <div className="space-y-4">
            {/* Address — only for delivery */}
            {deliveryType === "delivery" && (
              <div>
                <label className="text-sm font-bold mb-2 block">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Collection code — only for pickup, optional */}
            {deliveryType === "pickup" && (
              <div>
                <label className="text-sm font-bold mb-2 block">
                  Collection Code{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter collection code if you have one"
                    value={collectionCode}
                    onChange={(e) => setCollectionCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Phone — always required regardless of delivery type */}
            <div>
              <label className="text-sm font-bold mb-2 block">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 px-3 py-3">
                <Phone className="text-gray-400 w-4 h-4 shrink-0" />
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  className="w-full bg-transparent outline-none text-sm"
                  style={{
                    "--PhoneInput-color--focus": "transparent",
                  }}
                />
              </div>
            </div>

            {/* Meal Customization Section */}
            <div>
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-lily transition-colors bg-gray-50 dark:bg-slate-800"
              >
                <span className="text-sm font-semibold text-[#111813] dark:text-white">
                  Customize Your Meal Plan
                </span>
                <ShoppingBag
                  className={
                    showCustomization ? "text-lily rotate-180" : "text-gray-400"
                  }
                />
              </button>
            </div>

            {showCustomization && (
              <div className="space-y-4 pt-2">
                {/* Dietary Preferences */}
                <div>
                  <label className="text-sm font-bold mb-2 block">
                    Dietary Preferences{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Vegetarian, Keto, Low-sodium"
                    value={dietaryPreferences}
                    onChange={(e) => setDietaryPreferences(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm resize-none"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="text-sm font-bold mb-2 block">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                {/* Portion Size */}
                <div>
                  <label className="text-sm font-bold mb-2 block">
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
                        className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                          portionSize === size
                            ? "bg-lily text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-sm font-bold mb-2 block">
                    Special Instructions{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any special requests for your meals..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-gray-100">
        <button
          onClick={handleContinue}
          disabled={!isValid()}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            isValid()
              ? "bg-lily text-[#111813]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue to Payment
        </button>
      </div>

      <SubscriptionConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        selectedPlans={plan ? [plan] : []}
        vendor={vendor}
        totalPrice={totalPrice}
        selectedDays={selectedDays}
        quantity={quantity}
        addExtra={addExtra}
        extraPrice={extraPrice}
        deliveryType={deliveryType}
        address={address}
        phone={phone}
        collectionCode={collectionCode}
        isLoading={false}
      />
    </div>
  );
};

export default SubscriptionDetailsPage;
