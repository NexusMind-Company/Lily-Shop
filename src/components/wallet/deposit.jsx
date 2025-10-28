import { useState } from "react";
import { ChevronLeft, CreditCard, Banknote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {topUpWallet} from "../../redux/walletSlice"

export default function Deposit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const { loading, error } = useSelector((state) => state.wallet);

  const handleDeposit = async () => {
    const amountValue = parseFloat(amount);

    if (!amountValue || amountValue <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }

    const result = await dispatch(topUpWallet(amountValue));

    if (result.meta.requestStatus === "fulfilled") {
      const { authorization_url } = result.payload;
      if (authorization_url) {
        window.location.href = authorization_url; // Redirect to Paystack
      }
    } else {
      alert("Failed to initiate deposit. Please try again.");
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

      {/* Deposit Options */}
      <div className="flex-1 p-4 space-y-4">
        <div className="border border-gray-300 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-lily" />
              <span className="font-medium">Card Payment (Paystack)</span>
            </div>
            <span className="text-xs">Default</span>
          </div>

          {/* Amount Input */}
          <div className="mt-3">
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

        <div className="border rounded-xl p-4 flex items-center gap-2 border-gray-300">
          <Banknote className="w-5 h-5 text-lily" />
          <span className="font-medium">Bank Transfer</span>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="p-4">
        <button
          onClick={handleDeposit}
          disabled={loading}
          className={`w-full py-3 rounded-full font-medium ${
            loading ? "bg-gray-400" : "bg-lily text-white"
          }`}
        >
          {loading ? "Processing..." : "Proceed"}
        </button>
        {error && (
          <p className="text-center text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
