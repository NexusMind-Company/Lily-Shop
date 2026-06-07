import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle,
  FileText,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { fetchShopDetails } from "../services/api";

const AdsOrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { state } = location;

  // Extract payment data from state (passed from verifyTransaction)
  const paymentData = state?.paymentData || {};
  const reference = state?.reference || "";
  const shopId = state?.shopId || "";

  // Ads data
  const [adDetails, setAdDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    // Fetch ad details for this shop to show what was purchased
    if (shopId) {
      const fetchAdDetails = async () => {
        try {
          // First get the shop profile to see if we can find associated ads
          const shopData = await fetchShopDetails(shopId);
          // For now, we'll show the shop info as context
          // In a real implementation, we might have a specific endpoint for user's ads
          setAdDetails({
            ...shopData,
            // Add payment info
            paymentReference: reference,
            paymentAmount: paymentData.amount,
            paymentDate: paymentData.date,
          });
        } catch (err) {
          setError("Could not load ad details");
          console.error("Error fetching ad details:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAdDetails();
    } else {
      setLoading(false);
    }
  }, [shopId, dispatch]);

  useEffect(() => {
    // Auto-redirect back to shop dashboard after viewing order slip for a while
    // This gives user time to see the order slip and leave a review
    const timer = setTimeout(() => {
      navigate("/myShop", { replace: true });
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      alert("Please select a rating");
      return;
    }

    setReviewSubmitting(true);
    try {
      // In a real app, this would call an API to submit the review
      // For now, we'll simulate success
      setReviewSuccess(true);

      // Show success message for 2 seconds then reset
      setTimeout(() => {
        setReviewSuccess(false);
      }, 2000);

      // Reset form after delay
      setTimeout(() => {
        setReviewComment("");
        setReviewRating(0);
      }, 3000);
    } catch (err) {
      alert("Failed to submit review. Please try again.");
      console.error("Review submission error:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-sm">Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl border border-lily-100 shadow-xl shadow-lily-900/5 p-8 relative z-10"
      >
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-lily-100 flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-14 h-14 text-lily-600" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-500 mb-6">
            Your ads payment has been processed successfully.
          </p>
        </div>

        {/* Order Slip / Receipt */}
        <div className="bg-lily-50 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Order Slip</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Order ID
              </span>
              <span className="text-xl font-bold text-lily-700">
                {reference.substring(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Amount Paid
              </span>
              <span className="text-xl font-bold text-lily-700">
                ₦{formatPrice(paymentData.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Payment Date
              </span>
              <span className="text-sm font-medium">
                {paymentData.date
                  ? new Date(paymentData.date).toLocaleString()
                  : "Just now"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Payment Method
              </span>
              <span className="text-sm font-medium">Paystack</span>
            </div>

            {adDetails && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    For Shop
                  </span>
                  <span className="text-sm font-medium">
                    {adDetails.business_name || adDetails.name || "Your Shop"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Ads Status
                  </span>
                  <span className="text-sm font-medium text-lily-600">
                    Active
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Review Your Ads Experience
          </h3>

          {reviewSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">
                  Thank you for your review!
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your ads experience?
              </label>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      reviewRating >= star
                        ? "bg-yellow-400 text-yellow-800"
                        : "bg-gray-200 text-gray-400 hover:bg-yellow-300 hover:text-yellow-800"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                {reviewRating > 0
                  ? `${reviewRating}/5 Stars`
                  : "Select a rating"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your feedback (optional)
              </label>
              <textarea
                rows={3}
                placeholder="What did you like about our ads service? How can we improve?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-lily bg-white dark:bg-slate-800 text-sm resize-none"
                disabled={reviewSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting || reviewRating === 0}
              className={`w-full bg-lily-500 hover:bg-lily-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                reviewSubmitting ? "bg-gray-400" : ""
              }`}
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/myShop")}
            className="w-full bg-lily-500 hover:bg-lily-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            Go to Shop Dashboard
            <ArrowRight className="ml-2" />
          </button>

          <button
            onClick={() => navigate("/feed")}
            className="w-full bg-white text-lily-600 hover:text-lily-700 font-bold py-3 rounded-xl border border-lily-200"
          >
            Return to Home
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>
            This order slip serves as your receipt for the ads payment.
            <br />
            Your ads campaign is now active and will run according to the
            selected plan.
          </p>
          <p className="mt-2">
            You'll be automatically redirected to your shop dashboard in a few
            moments.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdsOrderSuccessPage;
