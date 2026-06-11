import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  Crown,
  CheckCircle,
  Shield,
  MessageCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  initiateUserSubscriptionPayment,
  getUserSubscriptionStatus,
} from "../redux/userSubscriptionSlice";
import SEO from "../components/common/SEO";

const UserSubscriptionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("paystack");

  const { subscription, paymentInitiating, error } = useSelector(
    (state) => state.userSubscription,
  );

  useEffect(() => {
    // Fetch current subscription status on mount
    dispatch(getUserSubscriptionStatus());
  }, [dispatch]);

  // If user is already subscribed, redirect to success or dashboard
  useEffect(() => {
    if (subscription?.is_active) {
      navigate("/user-subscription/success");
    }
  }, [subscription, navigate]);

  const handleSubscribe = async () => {
    try {
      const paymentData = {
        payment_method: selectedPaymentMethod,
        amount: 500000, // ₦5,000 in kobo
      };

      const result = await dispatch(
        initiateUserSubscriptionPayment(paymentData),
      ).unwrap();

      if (result.authorization_url) {
        // Paystack redirect
        window.location.href = result.authorization_url;
      } else if (result.status === "success") {
        // Wallet payment successful
        navigate("/user-subscription/success");
      }
    } catch (err) {
      console.error("Subscription initiation failed:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <SEO
        title="Premium Subscription - Lily Shop"
        description="Subscribe to premium features and connect directly with vendors on Lily Shop."
        keywords="premium subscription, vendor contact, messaging, quotes, Lily Shop"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Premium Subscription
            </h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Hero Section */}
          <div className="bg-linear-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white text-center">
            <Crown className="mx-auto mb-4 text-yellow-300" size={48} />
            <h2 className="text-2xl font-bold mb-2">Unlock Premium Access</h2>
            <p className="text-pink-100">
              Connect directly with vendors and get personalized quotes
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What you get:
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle
                  className="text-green-500 mt-0.5 shrink-0"
                  size={20}
                />
                <div>
                  <p className="font-medium text-gray-800">Direct Messaging</p>
                  <p className="text-sm text-gray-600">
                    Send messages directly to vendors
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle
                  className="text-green-500 mt-0.5 shrink-0"
                  size={20}
                />
                <div>
                  <p className="font-medium text-gray-800">Quote Requests</p>
                  <p className="text-sm text-gray-600">
                    Request custom quotes for your needs
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle
                  className="text-green-500 mt-0.5 shrink-0"
                  size={20}
                />
                <div>
                  <p className="font-medium text-gray-800">
                    Priority Responses
                  </p>
                  <p className="text-sm text-gray-600">
                    Get faster responses from vendors
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Quality Assurance</p>
                  <p className="text-sm text-gray-600">
                    Only serious buyers can contact vendors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="mb-4">
              <div className="text-3xl font-bold text-pink-600">₦5,000</div>
              <div className="text-gray-600">per month</div>
            </div>
            <div className="text-sm text-gray-500">
              Cancel anytime • Auto-renews monthly
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Method
            </h3>

            <div className="space-y-3">
              {/* Paystack (Card/Bank Transfer) */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === "paystack"
                    ? "border-pink-600 bg-pink-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="paystack"
                  checked={selectedPaymentMethod === "paystack"}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCard className="text-gray-600 mr-3" size={20} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    Card / Bank Transfer
                  </div>
                  <div className="text-sm text-gray-600">
                    Paystack secure payment
                  </div>
                </div>
                {selectedPaymentMethod === "paystack" && (
                  <CheckCircle className="text-pink-600" size={20} />
                )}
              </label>

              {/* Wallet */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === "wallet"
                    ? "border-pink-600 bg-pink-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={selectedPaymentMethod === "wallet"}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <Wallet className="text-gray-600 mr-3" size={20} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    Wallet Balance
                  </div>
                  <div className="text-sm text-gray-600">Instant payment</div>
                </div>
                {selectedPaymentMethod === "wallet" && (
                  <CheckCircle className="text-pink-600" size={20} />
                )}
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={paymentInitiating}
            className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {paymentInitiating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Crown size={20} />
                <span>Subscribe Now - ₦5,000/month</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Secure payment powered by Paystack</p>
            <p className="mt-1">
              By subscribing, you agree to our terms of service
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSubscriptionPage;
