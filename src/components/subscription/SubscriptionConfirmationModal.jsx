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
  selectedPlan,
  vendor,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Confirm Subscription
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
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
          {selectedPlan && (
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
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      check_circle
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                info
              </span>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Billing Information
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You will be charged ${selectedPlan?.price} for the{" "}
              {selectedPlan?.period} plan. Subscription will auto-renew unless
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
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-green-950 font-bold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-green-950 border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Subscribe Now
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
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
  selectedPlan: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    period: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string),
  }),
  vendor: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
    cuisine: PropTypes.string,
    location: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default SubscriptionConfirmationModal;
