import { ArrowRight, CheckCircle, Info, X } from "lucide-react";
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
}) => {
  if (!isOpen) return null;

  const totalPrice = (selectedPlans || []).reduce(
  (sum, plan) => sum + Number(plan.price || 0),
  0
);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#ffffff] dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Confirm Subscription
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
           <X/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vendor Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl bg-cover bg-center"
              style={{
                backgroundImage: `url("${
                  vendor?.image || "https://via.placeholder.com/48"
                }")`,
              }}
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {vendor?.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {vendor?.cuisine} • {vendor?.location}
              </p>
            </div>
          </div>

          {/* Plan Details */}
          {/* {selectedPlan && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {selectedPlan.name}
                </h4>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {selectedPlan.period}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${selectedPlan.price}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  /{selectedPlan.period}
                </span>
              </div>
              <div className="space-y-2">
                {selectedPlan.features?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                      <CheckCircle/>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )} */}
{selectedPlans?.length > 0 && (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
    <h4 className="font-bold text-slate-900 dark:text-white">
      Selected Plans
    </h4>

    {selectedPlans.map((plan) => (
      <div
        key={plan.id}
        className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-none"
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-900 dark:text-white">
            {plan.plan_name || plan.name}
          </span>

          <span className="font-bold">
            ₦{Number(plan.price).toLocaleString()}
          </span>
        </div>

        {plan.description && (
          <p className="text-sm text-slate-500">{plan.description}</p>
        )}
      </div>
    ))}
  </div>
)}
          {/* Billing Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info/>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Billing Information
              </span>
            </div>
            {/* <p className="text-sm text-blue-800 dark:text-blue-200">
              You will be charged ₦{Number(totalPrice).toLocaleString()} for the{" "}
              {selectedPlan?.period} plan. Subscription will auto-renew unless
              cancelled.
            </p> */}

            <p className="text-sm text-blue-800 dark:text-blue-200">
  You will be charged ₦{Number(totalPrice).toLocaleString()} for the
  selected subscription plans. Subscription will auto-renew unless
  cancelled.
</p>
          </div>

          {/* Terms */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
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
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
          disabled={isLoading || !selectedPlans?.length}
            className="flex-1 py-3 px-4 rounded-xl bg-[#13ec49] text-green-950 font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-green-950 border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Subscribe Now
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
  })
),
  vendor: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
    cuisine: PropTypes.string,
    location: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default SubscriptionConfirmationModal;
