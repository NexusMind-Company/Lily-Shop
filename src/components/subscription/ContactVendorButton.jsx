import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageCircle, Crown } from "lucide-react";
import SubscriptionPromptModal from "./SubscriptionPromptModal";

const ContactVendorButton = ({
  vendorId,
  vendorName = "this vendor",
  className = "",
  size = "default",
}) => {
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { subscription } = useSelector((state) => state.userSubscription);

  // Check if user is subscribed
  const isSubscribed = subscription?.is_active === true;

  const handleContactClick = () => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate("/login", {
        state: {
          redirectTo: `/chat/${vendorId}`,
          message: "Please log in to contact vendors",
        },
      });
      return;
    }

    if (!isSubscribed) {
      // Show subscription prompt
      setShowSubscriptionModal(true);
      return;
    }

    // User is subscribed, navigate to chat
    navigate(`/chat/${vendorId}`);
  };

  const buttonSizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-3",
    large: "px-6 py-4 text-lg",
  };

  return (
    <>
      <button
        onClick={handleContactClick}
        className={`
          bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg
          transition-colors duration-200 flex items-center space-x-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonSizeClasses[size]}
          ${className}
        `}
      >
        {isSubscribed ? (
          <>
            <MessageCircle
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
            />
            <span>Contact Vendor</span>
          </>
        ) : (
          <>
            <Crown size={size === "small" ? 16 : size === "large" ? 24 : 20} />
            <span>Subscribe to Contact</span>
          </>
        )}
      </button>

      <SubscriptionPromptModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        vendorName={vendorName}
      />
    </>
  );
};

export default ContactVendorButton;
