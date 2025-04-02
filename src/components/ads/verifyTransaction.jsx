import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment } from "../../redux/adsSlice";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyTransaction = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationStatus, verificationData, verificationError } =
    useSelector((state) => state.ads);

  const [reference, setReference] = useState("");

  useEffect(() => {
    // Extract query params
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference"); // Get reference from URL

    if (ref) {
      setReference(ref);
      dispatch(verifyPayment({ reference: ref })); // Dispatch verifyPayment on mount
    }
  }, [location.search, dispatch]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-sm mx-auto my-10 p-10 py-10 border-black min-h-screen rounded-lg shadow-md">
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
          {/* Success Card */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="text-4xl text-green-500 mb-2">✓</div>
            <h3 className="text-xl font-semibold text-green-800">
              Payment Verified
            </h3>
            <p className="text-green-600 mt-1">
              Your transaction was successful
            </p>
          </div>

          {/* Transaction Details */}
          <div className="border rounded-lg divide-y">
            <div className="p-3 flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {verificationData?.amount || "N/A"}
              </span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(verificationData?.date).toLocaleString() || "N/A"}
              </span>
            </div>
          </div>

          {/* Reference ID Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-2">
              Your Reference ID
            </p>
            <div className="flex justify-between items-center">
              <p className="font-mono text-blue-800 break-all">{reference}</p>
              <button
                onClick={() => copyToClipboard(reference)}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Save this ID for your records
            </p>
          </div>

          {/* Primary Action */}
          <button
            onClick={() => navigate("/myShop")}
            className="w-full py-3 bg-sun text-white rounded-md hover:bg-lily"
          >
            Return to your Shop
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyTransaction;
