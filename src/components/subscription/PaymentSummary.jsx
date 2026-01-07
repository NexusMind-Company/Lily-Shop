import PropTypes from 'prop-types';

/**
 * PaymentSummary component showing payment breakdown
 * @param {Object} props - Component props
 * @param {number} props.subtotal - Subtotal amount
 * @param {number} props.deliveryFee - Delivery fee
 * @param {number} props.total - Total amount
 */
const PaymentSummary = ({ subtotal, deliveryFee, total }) => {
  return (
    <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-text-main dark:text-white font-bold text-lg mb-4">Payment Summary</h3>
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-muted">Subtotal ({subtotal / 2700} meals)</span>
          <span className="text-text-main dark:text-white font-medium">₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-muted">Delivery Fee</span>
          <span className="text-text-main dark:text-white font-medium">₦{deliveryFee.toLocaleString()}</span>
        </div>
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        <div className="flex justify-between items-center text-base">
          <span className="text-text-main dark:text-white font-bold">Total</span>
          <span className="text-text-main dark:text-white font-bold text-lg">₦{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 justify-center opacity-60">
        <span className="material-symbols-outlined text-[16px] text-text-muted">lock</span>
        <p className="text-xs text-text-muted">Secured by Paystack</p>
      </div>
    </div>
  );
};

PaymentSummary.propTypes = {
  subtotal: PropTypes.number.isRequired,
  deliveryFee: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default PaymentSummary;