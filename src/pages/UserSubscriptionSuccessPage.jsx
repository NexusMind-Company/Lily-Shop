import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, MessageCircle, Crown, ArrowRight } from "lucide-react";
import { getUserSubscriptionStatus } from "../redux/userSubscriptionSlice";
import SEO from "../components/common/SEO";

const UserSubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { subscription } = useSelector((state) => state.userSubscription);

  useEffect(() => {
    // Refresh subscription status
    dispatch(getUserSubscriptionStatus());
  }, [dispatch]);

  const handleContinue = () => {
    navigate("/vendors"); // Navigate to vendors list to start contacting
  };

  const handleGoToInbox = () => {
    navigate("/inbox");
  };

  return (
    <>
      <SEO
        title="Subscription Successful - Lily Shop"
        description="Your premium subscription is now active. Start connecting with vendors today!"
        keywords="subscription success, premium access, vendor contact, Lily Shop"
      />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <CheckCircle className="mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Subscription Activated!</h1>
            <p className="text-green-100">Welcome to premium access</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Subscription Details */}
            {subscription && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="text-green-600" size={20} />
                  <span className="font-semibold text-green-800">
                    Premium Plan Active
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <p>
                    Valid until:{" "}
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </p>
                  <p>Plan: {subscription.plan_type}</p>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-800">
                What you can do now:
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MessageCircle
                    className="text-pink-500 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">
                    Send direct messages to vendors
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle
                    className="text-pink-500 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">Request custom quotes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">Get priority responses</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Find Vendors to Contact</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={handleGoToInbox}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Messages
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Questions? Contact our support team
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You can manage your subscription in your account settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSubscriptionSuccessPage;
