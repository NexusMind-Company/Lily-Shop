import { ArrowRight, Info, X } from "lucide-react";
import PropTypes from "prop-types";

/**
 * SubscriptionConfirmationModal component for confirming subscription
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onConfirm - Function to confirm subscription
 * @param {Object} props.selectedPlan - Selected plan data
 * @param {Object} props.vendor - Vendor data
 * @param {boolean} props.isLoading - Loading state for confirmation
 */
const SubscriptionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPlans,
  vendor,
  isLoading,
  selectedDays,
  quantity,
  addExtra,
  extraPrice,
  deliveryType,
  address,
  phone,
  collectionCode,
  dietaryPreferences,
  allergies,
  portionSize,
  specialInstructions,
}) => {
  if (!isOpen) return null;

  const hasPreferences =
    dietaryPreferences || allergies || portionSize || specialInstructions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#ffffff] dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-black">Confirm Subscription</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-darklily transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vendor Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0"
              style={{
                backgroundImage: `url("${(() => {
                  const media =
                    vendor?.logo ||
                    vendor?.image ||
                    vendor?.all_media_urls?.[0] ||
                    vendor?.profile_pic ||
                    vendor?.banner_image ||
                    "https://i.pinimg.com/736x/03/e9/84/03e984afeb479490cab605c39bfdac03.jpg";
                  const urlStr = Array.isArray(media) ? media[0] : media;
                  return typeof urlStr === "string"
                    ? urlStr.replace(/^http:\/\//i, "https://")
                    : urlStr ||
                        "https://i.pinimg.com/736x/03/e9/84/03e984afeb479490cab605c39bfdac03.jpg";
                })()}")`,
              }}
            />
            <div>
              <h3 className="font-bold text-black">{vendor?.name}</h3>
              <p className="text-sm text-slate-950">
                {vendor?.cuisine}
                {vendor?.address && vendor?.cuisine
                  ? ` • ${vendor.address}`
                  : ""}
                {!vendor?.cuisine && vendor?.address ? vendor.address : ""}
                {!vendor?.address && !vendor?.cuisine && vendor?.location
                  ? ` • ${vendor.location}`
                  : ""}
              </p>
            </div>
          </div>

          {selectedPlans?.length ? (
            <div className="bg-lily rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-white">Selected Plans</h4>

              {selectedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border-b border-slate-200 pb-3 last:border-none"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white dark:text-white">
                      {plan.plan_name || plan.name}
                    </span>

                    <span className="font-bold text-white">
                      ₦{Number(plan.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No subscription plans selected.
            </p>
          )}

          {/* Delivery Details */}
          <div className="bg-lily rounded-xl p-4 space-y-3 text-white">
            <h4 className="font-bold ">Delivery Details</h4>

            <div className="flex justify-between text-sm">
              <span className="">Type</span>
              <span className="font-semibold">
                {deliveryType === "delivery" ? "Deliver to me" : "Pickup"}
              </span>
            </div>

            {deliveryType === "delivery" && address && (
              <div className="flex justify-between text-sm text-white">
                <span className="">Address</span>
                <span className="font-semibold text-right max-w-[60%]">
                  {address}
                </span>
              </div>
            )}

            {deliveryType === "pickup" && collectionCode && (
              <div className="flex justify-between text-sm text-white">
                <span className="">Collection Code</span>
                <span className="font-semibold">{collectionCode}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-white">
              <span className="">Phone</span>
              <span className="font-semibold">{phone}</span>
            </div>

            <div className="flex justify-between text-sm text-white">
              <span className="">Delivery Days</span>
              <span className="font-semibold">{selectedDays?.join(", ")}</span>
            </div>

            <div className="flex justify-between text-sm text-white">
              <span className="">Plates per delivery</span>
              <span className="font-semibold">{quantity}</span>
            </div>

            {addExtra && (
              <div className="flex justify-between text-sm text-white">
                <span className="">Extra</span>
                <span className="font-semibold text-lily">+₦{extraPrice}</span>
              </div>
            )}
          </div>

          {/* Meal Preferences */}
          {hasPreferences && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Info
                  className="text-slate-600 dark:text-slate-400"
                  size={18}
                />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Your Meal Preferences
                </span>
              </div>

              <div className="space-y-2">
                {dietaryPreferences && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dietary</span>
                    <span className="font-semibold text-slate-800 dark:text-white text-right max-w-[60%] truncate">
                      {dietaryPreferences}
                    </span>
                  </div>
                )}
                {allergies && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Allergies</span>
                    <span className="font-semibold text-red-500 text-right max-w-[60%] truncate">
                      {allergies}
                    </span>
                  </div>
                )}
                {portionSize && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Portion</span>
                    <span className="font-semibold text-slate-800 dark:text-white capitalize">
                      {portionSize}
                    </span>
                  </div>
                )}
                {specialInstructions && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Instructions</span>
                    <span className="font-semibold text-slate-800 dark:text-white text-right max-w-[60%] line-clamp-2">
                      {specialInstructions}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="text-xs text-black space-y-1">
            <p>
              By subscribing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
            <p>
              You can cancel your subscription at any time from your account
              settings.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-400">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-500 text-slate-800 font-bold hover:bg-darklily transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !selectedPlans?.length}
            className="flex-1 py-3 px-4 rounded-xl bg-lily text-white font-bold hover:bg-darklily disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-darklily border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

SubscriptionConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  // selectedPlan: PropTypes.shape({
  //   id: PropTypes.string,
  //   name: PropTypes.string,
  //   price: PropTypes.number,
  //   period: PropTypes.string,
  //   features: PropTypes.arrayOf(PropTypes.string),
  // }),
  selectedPlans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      plan_name: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  vendor: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
    cuisine: PropTypes.string,
    location: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  selectedDays: PropTypes.arrayOf(PropTypes.string),
  quantity: PropTypes.number,
  addExtra: PropTypes.bool,
  extraPrice: PropTypes.number,
  deliveryType: PropTypes.string,
  address: PropTypes.string,
  phone: PropTypes.string,
  collectionCode: PropTypes.string,
};

export default SubscriptionConfirmationModal;
