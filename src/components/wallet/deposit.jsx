import { useState } from "react";
import { ChevronLeft, CreditCard, Banknote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { topUpWallet } from "../../redux/walletSlice";

export default function Deposit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [message, setMessage] = useState("");

  const { topup_loading, topup_error } = useSelector((state) => state.wallet);

  const handleDeposit = async () => {
    const amountValue = parseFloat(amount);

    if (!amountValue || amountValue <= 0) {
      setMessage("Please enter a valid deposit amount");
      return;
    }

    try {
      const result = await dispatch(topUpWallet(amountValue));

      if (result.meta.requestStatus === "fulfilled") {
        const { authorization_url } = result.payload;

        if (authorization_url) {
          // Redirect to Paystack — user can choose card or bank transfer
          window.location.href = authorization_url;
        } else {
          setMessage("No payment link received from Paystack.");
        }
      } else {
        setMessage("Failed to initiate deposit. Please try again.");
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="relative p-4">
        <Link onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Deposit</h1>
      </header>

      {message && (
        <p className="text-green-700 py-3 mx-4 border border-green-300 bg-green-100 text-center my-5 rounded-lg">
          {message}
        </p>
      )}

      {topup_error && (
        <p className="text-red-700 py-3 mx-4 border border-red-300 bg-red-100 text-center my-5 rounded-lg">
          {topup_error}
        </p>
      )}

      {/* Payment Options */}
      <div className="flex-1 p-4 space-y-4">
        {/* Card Payment Option */}
        <div
          onClick={() => setPaymentMethod("card")}
          className={`border rounded-xl p-4 space-y-2 cursor-pointer transition ${
            paymentMethod === "card"
              ? "border-lily bg-lily/10"
              : "border-gray-300 hover:border-lily/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-lily" />
              <span className="font-medium">Pay with Card (Paystack)</span>
            </div>
            {paymentMethod === "card" && (
              <span className="text-xs text-lily font-semibold">Selected</span>
            )}
          </div>
        </div>

        {/* Bank Transfer Option */}
        <div
          onClick={() => setPaymentMethod("transfer")}
          className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
            paymentMethod === "transfer"
              ? "border-lily bg-lily/10"
              : "border-gray-300 hover:border-lily/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-lily" />
            <span className="font-medium">Pay with Bank Transfer (via Paystack)</span>
          </div>
          {paymentMethod === "transfer" && (
            <span className="text-xs text-lily font-semibold">Selected</span>
          )}
        </div>

        {/* Amount Input */}
        <div className="mt-4">
          <label className="text-sm font-medium">Enter Amount (₦)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lily"
            placeholder="e.g. 2000"
          />
        </div>
      </div>

      {/* Proceed Button */}
      <div className="p-4">
        <button
          onClick={handleDeposit}
          disabled={topup_loading}
          className={`w-full py-3 rounded-full font-medium ${
            topup_loading ? "bg-gray-400" : "bg-lily text-white"
          }`}
        >
          {topup_loading
            ? "Processing..."
            : paymentMethod === "card"
            ? "Proceed (Card)"
            : "Proceed (Bank Transfer)"}
        </button>
      </div>
    </div>
  );
}
