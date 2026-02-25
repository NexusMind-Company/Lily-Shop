import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  Shield,
  Calendar,
  ChefHat,
} from "lucide-react";

const formatPrice = (price) =>
  new Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();

  // Mock data - in real implementation, this would come from URL params or context
  const subscriptionData = {
    amountPaid: 15000, // in kobo
    vendorName: "Chef's Kitchen",
    planName: "Weekly Standard Plan",
    nextDelivery: "Monday, January 15th",
  };

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle size={64} className="text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mt-6">
            Subscription Activated!
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Welcome to {subscriptionData.vendorName}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mt-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">{subscriptionData.planName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">
                NGN {formatPrice(subscriptionData.amountPaid / 100)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Next Delivery:</span>
              <span className="font-semibold">
                {subscriptionData.nextDelivery}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>Weekly delivery</span>
            </div>
            <div className="flex items-center">
              <ChefHat size={16} className="mr-1" />
              <span>Fresh meals</span>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/my-subscriptions")}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
          >
            View My Subscriptions
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-lily py-3 rounded-lg text-lg font-semibold border border-lily hover:bg-lily/10 transition-colors"
          >
            Continue browsing
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8 flex items-center justify-center">
          <Shield size={14} className="mr-1" /> Secured by{" "}
          <span className="font-bold ml-1">paystack</span>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
