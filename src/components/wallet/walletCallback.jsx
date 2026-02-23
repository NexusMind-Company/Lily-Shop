import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  verifyPaystackCallback,
  fetchWallet,
} from "../../redux/walletSlice";

export default function WalletCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("Invalid payment reference");
      setTimeout(() => {
        navigate("/wallet?status=missing_reference");
      }, 2000);
      return;
    }

    // Verify the transaction
    dispatch(verifyPaystackCallback(reference))
      .unwrap()
      .then((response) => {
        setStatus("success");
        setMessage("Payment verified successfully!");

        // Refresh wallet data
        dispatch(fetchWallet());

        // Redirect to wallet after 2 seconds
        setTimeout(() => {
          navigate("/wallet?status=success");
        }, 2000);
      })
      .catch((error) => {
        console.error("Verification failed:", error);
        setStatus("failed");
        setMessage(error?.message || "Payment verification failed");

        // Redirect to wallet after 3 seconds
        setTimeout(() => {
          navigate("/wallet?status=failed");
        }, 3000);
      });
  }, [dispatch, navigate, location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Status Icon */}
        <div className="mb-6">
          {status === "verifying" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <div className="w-full h-full border-4 border-lily-200 border-t-lily-600 rounded-full" />
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-error" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className={`text-2xl font-bold mb-2 ${
              status === "success"
                ? "text-success"
                : status === "failed"
                ? "text-error"
                : "text-gray-800"
            }`}
          >
            {status === "verifying" && "Processing Payment"}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </h2>
          <p className="text-gray-600">{message}</p>
        </motion.div>

        {/* Loading Progress */}
        {status === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-lily-500 to-purple-600"
              />
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-sm text-gray-500"
        >
          {status === "verifying" && "Please wait, do not close this page..."}
          {status === "success" && "Redirecting to your wallet..."}
          {status === "failed" && "Redirecting back to wallet..."}
        </motion.div>

        {/* Manual Navigation (only if failed) */}
        {status === "failed" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => navigate("/wallet")}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-lily-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Go to Wallet
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
