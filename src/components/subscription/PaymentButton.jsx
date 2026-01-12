import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

/**
 * PaymentButton component for the payment action
 * @param {Object} props - Component props
 * @param {number} props.amount - Payment amount
 * @param {Function} props.onPayment - Function to handle payment
 * @param {boolean} props.disabled - Whether the button is disabled
 */
const PaymentButton = ({ amount, onPayment, disabled }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-[#ffffff] dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 pb-8 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
      <button
        onClick={onPayment}
        disabled={disabled}
        className="w-full bg-[#13ec49] hover:bg-[#0fdc40] text-text-main h-14 rounded-xl font-bold text-base flex items-center justify-between px-6 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Pay via Paystack</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold opacity-80">
            ₦{amount.toLocaleString()}
          </span>
          <ArrowRight />
        </div>
      </button>
    </div>
  );
};

PaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  onPayment: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PaymentButton;
