import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment } from "../../redux/adsSlice";
import { useNavigate } from "react-router-dom"; // Assuming you're using React Router

const VerifyTransaction = () => {
  const [reference, setReference] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { verificationStatus, verificationData, verificationError } = useSelector(
    (state) => state.ads
  );

  const handleVerify = () => {
    if (!reference.trim()) {
      alert("Please enter a valid transaction reference.");
      return;
    }
    dispatch(verifyPayment({ reference }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-sm mx-auto my-10 p-10 py-10 border-black  rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        {verificationStatus === "succeeded" ? "Payment Verified" : "Verify Your Payment"}
      </h2>

      {verificationStatus !== "succeeded" ? (
        <div className="space-y-7">
          <div>
            <label htmlFor="reference" className="block text-md font-medium text-black mb-1 py-2">
              Transaction Reference
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter your transaction reference ID"
              className="w-full p-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 py-4"
            />
            <p className="text-mb text-black mt-1 py-5">
              You can find this in your payment confirmation email or bank statement
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={verificationStatus === "loading"}
            className={`w-full mt-2 py-3 hover:text-white hover:bg-lily cursor-pointer rounded-md transition-colors ${
              verificationStatus === "loading"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sun text-black hover:bg-opacity-90"
            }`}
          >

            {verificationStatus === "loading" ? "Verifying..." : "Verify Payment"}
          </button>

          {verificationStatus === "failed" && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">❌ Verification Failed</p>
              <p>{verificationError}</p>
              <button 
                onClick={() => setReference("")}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try different reference
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Card */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="text-4xl text-green-500 mb-2">✓</div>
            <h3 className="text-xl font-semibold text-green-800">Payment Verified</h3>
            <p className="text-green-600 mt-1">Your transaction was successful</p>
          </div>

          {/* Transaction Details */}
          <div className="border rounded-lg divide-y">
            <div className="p-3 flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{verificationData?.amount || "N/A"}</span>
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
            <p className="text-sm text-blue-600 font-medium mb-2">Your Reference ID</p>
            <div className="flex justify-between items-center">
              <p className="font-mono text-blue-800 break-all">
                {verificationData?.reference || reference}
              </p>
              <button
                onClick={() => copyToClipboard(verificationData?.reference || reference)}
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
            onClick={() => navigate("/myShop")} // Or your desired destination
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyTransaction;