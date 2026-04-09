import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Crown, MessageCircle, Shield, CheckCircle } from "lucide-react";

const SubscriptionPromptModal = ({ isOpen, onClose, vendorName = "this vendor" }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsLoading(true);
    // Navigate to subscription page
    navigate("/user-subscription");
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Crown className="text-yellow-300" size={32} />
            <div>
              <h2 className="text-xl font-bold">Premium Access Required</h2>
              <p className="text-pink-100 text-sm">Unlock vendor communication</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <MessageCircle className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Connect with {vendorName}
            </h3>
            <p className="text-gray-600 text-sm">
              To send messages and request quotes from vendors, you need a premium subscription.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-700">Direct messaging with vendors</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-700">Request custom quotes</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-700">Priority vendor responses</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-700">Reduced spam for vendors</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">₦5,000</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Crown size={18} />
                  <span>Subscribe Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Cancel anytime. Secure payment powered by Paystack.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPromptModal;