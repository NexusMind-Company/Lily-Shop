import PropTypes from "prop-types";

/**
 * SubscriberDetailModal component for detailed subscriber information
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.subscriber - Subscriber data
 * @param {Function} props.onCall - Function to handle call action
 * @param {Function} props.onMessage - Function to handle message action
 */
const SubscriberDetailModal = ({
  isOpen,
  onClose,
  subscriber,
  onCall,
  onMessage,
}) => {
  if (!isOpen || !subscriber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="w-full max-w-md bg-surface-light dark:bg-[#1a2c1e] rounded-t-2xl p-6 pointer-events-auto shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
        {/* Header Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div
              className="h-16 w-16 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
              style={{
                backgroundImage: `url("${
                  subscriber.avatar || "https://via.placeholder.com/64"
                }")`,
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {subscriber.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {subscriber.memberSince}
              </p>
              <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                {subscriber.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Plan Details Grid */}
        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Plan
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {subscriber.planName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Next Payment
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {subscriber.nextPayment}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Amount
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ${subscriber.amount}
            </p>
          </div>
        </div>
        {/* Dietary Notes */}
        {subscriber.dietaryNotes && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-gray-400 text-sm">
                restaurant
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Dietary Notes
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-3 rounded-lg">
              ⚠️ {subscriber.dietaryNotes}
            </p>
          </div>
        )}
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onCall(subscriber)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-[#0fd640] text-black font-semibold py-3.5 px-4 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">call</span>
            Call
          </button>
          <button
            onClick={() => onMessage(subscriber)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3.5 px-4 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            Message
          </button>
        </div>
        {/* Safe Area Spacer */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};

SubscriberDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subscriber: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    memberSince: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    nextPayment: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    dietaryNotes: PropTypes.string,
  }),
  onCall: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
};

export default SubscriberDetailModal;
