import { CheckCircle, ExternalLink } from "lucide-react";
import PropTypes from "prop-types";

/**
 * SuccessModal component for payment success confirmation
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onFinalizeDelivery - Function to handle delivery setup
 */
const SuccessModal = ({ isOpen, onClose, onFinalizeDelivery }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-[90%] bg-[#ffffff] dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl p-6 flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
           <CheckCircle/>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-text-main dark:text-white">
            Payment Successful!
          </h2>
          <p className="text-text-muted text-center max-w-[280px]">
            You&apos;re all set. One last step: tell us where to deliver your weekly
            meals.
          </p>
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onFinalizeDelivery();
          }}
          className="w-full bg-[#13ec49] text-text-main h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0fdc40] transition-colors"
        >
          <span>Finalize Delivery Details</span>
          <ExternalLink />
        </a>
        <button
          onClick={onClose}
          className="text-text-muted text-sm font-medium py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};

SuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFinalizeDelivery: PropTypes.func.isRequired,
};

export default SuccessModal;
