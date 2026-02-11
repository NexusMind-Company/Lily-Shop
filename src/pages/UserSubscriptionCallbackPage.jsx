import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyUserSubscriptionPayment } from "../redux/userSubscriptionSlice";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import SEO from "../components/common/SEO";

const UserSubscriptionCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const reference = searchParams.get("reference");
  const status = searchParams.get("status");

  useEffect(() => {
    if (reference) {
      // Verify the payment
      dispatch(verifyUserSubscriptionPayment(reference))
        .unwrap()
        .then(() => {
          // Success - redirect to success page
          navigate("/user-subscription/success");
        })
        .catch((error) => {
          console.error("Payment verification failed:", error);
          // Redirect to subscription page with error
          navigate("/user-subscription", {
            state: { error: "Payment verification failed. Please try again." }
          });
        });
    } else {
      // No reference - redirect back
      navigate("/user-subscription");
    }
  }, [reference, dispatch, navigate]);

  return (
    <>
      <SEO
        title="Verifying Payment - Lily Shop"
        description="Please wait while we verify your subscription payment."
      />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === "success" ? (
            <>
              <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Activating your premium subscription...
              </p>
            </>
          ) : status === "failed" ? (
            <>
              <XCircle className="mx-auto mb-4 text-red-500" size={64} />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">
                There was an issue with your payment. Redirecting...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto mb-4 text-pink-500 animate-spin" size={64} />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we confirm your subscription payment...
              </p>
            </>
          )}

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSubscriptionCallbackPage;