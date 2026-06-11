import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment } from "../../redux/adsSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const VerifyTransaction = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationStatus, verificationData, verificationError } =
    useSelector((state) => state.ads);

  const [reference, setReference] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);

  useEffect(() => {
    // Extract query params
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference"); // Get reference from URL

    if (ref) {
      setReference(ref);
      dispatch(verifyPayment({ reference: ref })); // Dispatch verifyPayment on mount
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    // Show success popup and start redirect timer when verification succeeds
    if (verificationStatus === "succeeded") {
      setShowSuccessPopup(true);

      // Clear any existing timer
      if (redirectTimer !== null) {
        clearTimeout(redirectTimer);
      }

      // Set timer to redirect after 3 seconds
      const timer = setTimeout(() => {
        // Pass payment data and reference to the success page
        navigate("/ads/order/success", {
          state: {
            paymentData: verificationData,
            reference: reference,
            shopId: verificationData?.shop || verificationData?.shop_id || "",
          },
        });
      }, 3000);

      setRedirectTimer(timer);
    }

    // Cleanup timer on unmount or if verification status changes
    return () => {
      if (redirectTimer !== null) {
        clearTimeout(redirectTimer);
      }
    };
  }, [
    verificationStatus,
    verificationData,
    reference,
    navigate,
    redirectTimer,
  ]);

  return (
    <div className="max-w-sm mx-auto mt-28 mb-10 p-10 py-10 border-black min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        {verificationStatus === "succeeded"
          ? "Payment Verified"
          : "Verify Your Payment"}
      </h2>

      {verificationStatus !== "succeeded" ? (
        <div className="space-y-7">
          <button
            disabled={verificationStatus === "loading"}
            className={`w-full mt-2 py-3 hover:text-white hover:bg-lily cursor-pointer rounded-md transition-colors ${
              verificationStatus === "loading"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sun text-black hover:bg-opacity-90"
            }`}
          >
            {verificationStatus === "loading"
              ? "Verifying..."
              : "Verifying Payment..."}
          </button>

          {verificationStatus === "failed" && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">❌ Verification Failed</p>
              <p>{verificationError}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <div className="w-24 h-24 rounded-full bg-lily-100 flex items-center justify-center mb-6">
                  <CheckCircle className="w-14 h-14 text-lily-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-500 mb-4">
                  Your ads payment has been processed successfully.
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      Amount Paid
                    </span>
                    <span className="text-xl font-bold text-lily-700">
                      ₦
                      {Number(verificationData?.amount || 0)
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      Reference ID
                    </span>
                    <span className="text-sm font-medium break-all">
                      {reference}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  You'll be redirected to view your order slip shortly...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyTransaction;
