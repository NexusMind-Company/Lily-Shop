import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Wallet,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { verifyPaystackCallback, fetchWallet } from "../../redux/walletSlice";
import { toast } from "react-hot-toast";

const formatPrice = (val) =>
  Number(val)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function WalletCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");
  const [transactionData, setTransactionData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setStatus("failed");
      setMessage(
        "No payment reference found. Please contact support if you were debited.",
      );
      return;
    }

    // Verify the transaction
    const verify = async () => {
      try {
        const resultAction = await dispatch(verifyPaystackCallback(reference));
        if (verifyPaystackCallback.fulfilled.match(resultAction)) {
          const payload = resultAction.payload;
          setTransactionData(payload);
          setStatus("success");
          setMessage("Payment verified successfully!");

          // Refresh wallet data
          dispatch(fetchWallet());

          // Check if we should redirect back to subscription
          const shouldRedirect =
            localStorage.getItem("lily_subscription_redirect") === "true";
          const pendingDataStr = localStorage.getItem(
            "lily_pending_subscription_data",
          );

          if (shouldRedirect && pendingDataStr) {
            setTimeout(() => {
              const pendingData = JSON.parse(pendingDataStr);
              localStorage.removeItem("lily_subscription_redirect");
              navigate("/subscription/processing", { state: pendingData });
            }, 3000);
          }
        } else {
          const error = resultAction.payload;
          console.error("Verification failed:", error);
          setStatus("failed");
          setMessage(
            error?.detail ||
              error?.message ||
              "Payment verification failed. It might still be processing.",
          );
        }
      } catch (err) {
        console.error("Unexpected error during verification:", err);
        setStatus("failed");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    verify();
  }, [dispatch, navigate, location.search]);

  const handleCopyReference = () => {
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      toast.success("Reference copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const amountNaira =
    transactionData?.amount_naira ||
    (transactionData?.amount ? transactionData.amount / 100 : 0);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 font-display">
      {/* Background Decorative Elements - Subtle Green Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl border border-lily-100 shadow-xl shadow-lily-900/5 p-8 relative z-10"
      >
        <AnimatePresence mode="wait">
          {status === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-10"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-lily-50 border-t-lily-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-lily-200" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Confirming Payment
              </h2>
              <p className="text-gray-500 max-w-[250px] leading-relaxed">
                We're double checking your transaction with Paystack.
              </p>

              <div className="mt-10 w-full bg-lily-50/50 rounded-2xl p-4 border border-lily-100/50">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-lily-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">
                      Secure Payment
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Processing via encrypted channel
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
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
                Success!
              </h2>
              <p className="text-gray-500 mb-8 font-medium">
                Your wallet has been credited.
              </p>

              <div className="w-full bg-lily-50/30 border border-lily-100 rounded-2xl p-6 mb-8 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-lily-100/50">
                  <span className="text-sm text-gray-500 font-medium">
                    Amount Credited
                  </span>
                  <span className="text-xl font-bold text-lily-700">
                    ₦{formatPrice(amountNaira || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Reference
                  </span>
                  <button
                    onClick={handleCopyReference}
                    className="flex items-center gap-1.5 text-xs font-bold text-lily-700 bg-white px-3 py-1.5 rounded-full border border-lily-100 hover:bg-lily-50 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span className="truncate max-w-[100px]">
                      {(
                        location.search.match(/reference=([^&]+)/)?.[1] || "Ref"
                      ).slice(0, 12)}
                      ...
                    </span>
                  </button>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full bg-lily-500 hover:bg-lily-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-lily-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Go to Wallet
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/feed")}
                  className="w-full bg-white text-lily-600 hover:text-lily-700 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <XCircle className="w-14 h-14 text-red-500" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Unable to Verify
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                {message}
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate("/deposit")}
                  className="w-full bg-lily-500 hover:bg-lily-600 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-lily-500/10"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full bg-white text-gray-500 font-bold py-4 rounded-2xl text-sm border border-gray-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Wallet
                </button>
              </div>

              <p className="mt-8 text-[11px] text-gray-400 max-w-[220px]">
                If your account was debited, please don't worry. It can take a
                few minutes for the status to update.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Support */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2 text-sm text-gray-400"
      >
        <span>Having issues?</span>
        <button className="text-lily-600 font-bold hover:underline">
          Contact Support
        </button>
      </motion.div>
    </div>
  );
}
