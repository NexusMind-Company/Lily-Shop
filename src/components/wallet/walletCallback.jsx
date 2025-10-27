import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  verifyPaystackCallback,
  fetchWallet,
} from "../../redux/walletSlice";

export default function WalletCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract Paystack reference from the URL query
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");

    if (reference) {
      // Step 1: Verify the Paystack transaction
      dispatch(verifyPaystackCallback(reference))
        .unwrap()
        .then(() => {
          // Step 2: Refresh wallet data
          dispatch(fetchWallet());
          // Step 3: Redirect user to wallet page with success flag
          navigate("/wallet?status=success");
        })
        .catch(() => {
          // If verification fails
          navigate("/wallet?status=failed");
        });
    } else {
      navigate("/wallet?status=missing_reference");
    }
  }, [dispatch, navigate, location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-sm">Verifying your payment...</p>
    </div>
  );
}
