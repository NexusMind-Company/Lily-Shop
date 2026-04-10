import { ArrowRight, Info, X } from "lucide-react";
import PropTypes from "prop-types";

const SubscriptionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPlans,
  vendor,
  isLoading,
}) => {
  if (!isOpen) return null;

  const totalPrice =
    selectedPlans?.reduce((sum, plan) => sum + Number(plan?.price || 0), 0) ??
    0;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#ffffff] shadow-xl dark:bg-surface-dark">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Confirm Subscription
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl bg-cover bg-center"
              style={{
                backgroundImage: `url("${
                  vendor?.image ||
                  vendor?.image_url ||
                  "https://via.placeholder.com/48"
                }")`,
              }}
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {vendor?.name || "Vendor"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {[vendor?.cuisine, vendor?.location].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>

          {selectedPlans?.length ? (
            <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Selected Plan
              </h4>

              {selectedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border-b border-slate-200 pb-3 last:border-none dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {plan.plan_name || plan.name}
                    </span>
                    <span className="font-bold">
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

          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="mb-2 flex items-center gap-2">
              <Info />
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Billing Information
              </span>
            </div>

            <p className="text-sm text-blue-800 dark:text-blue-200">
              You will be charged ₦{Number(totalPrice).toLocaleString()} for the
              selected subscription plan. Subscription will auto-renew unless
              cancelled.
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
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

        <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !selectedPlans?.length}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#13ec49] px-4 py-3 font-bold text-green-950 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-950 border-t-transparent" />
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
    image_url: PropTypes.string,
    cuisine: PropTypes.string,
    location: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default SubscriptionConfirmationModal;
