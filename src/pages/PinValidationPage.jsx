import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { confirmOrderDelivery } from "../services/api";
import { toast } from "react-hot-toast";
import { ShieldCheck, Lock, CheckCircle2, Loader2, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import PageSEO from "../components/common/PageSEO";

/*
  TODO: Future Informal Market Integration (Per User Notes):
  - Make this PIN validation portal directly accessible during sign-up / onboarding or via an instant QR/SMS link.
  - When a rider or recipient enters the 4-digit PIN, it automatically validates against the backend without requiring manual submission.
  - Currently implemented with auto-submit upon entering the 4th digit for seamless verification.
*/

const PinValidationPage = () => {
  const [orderId, setOrderId] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mutation to confirm delivery via Chop-PIN and release escrow
  const { mutate: verifyPin, isPending } = useMutation({
    mutationFn: async ({ order, code }) => {
      let lat = 0;
      let lng = 0;
      try {
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                resolve();
              },
              () => resolve(),
              { timeout: 3000 }
            );
          });
        }
      } catch (e) {
        console.warn("Geolocation fallback used:", e);
      }
      return await confirmOrderDelivery(order.trim(), {
        pin: code,
        gps_lat: lat,
        gps_lng: lng,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Delivery confirmed! Escrow funds released to seller wallet 🎉");
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Invalid Security PIN or Order ID.";
      toast.error(msg);
      // Reset PIN on error to allow fast retry
      setPin(["", "", "", ""]);
      const firstInput = document.getElementById("pin-input-0");
      if (firstInput) firstInput.focus();
    },
  });

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return; // numbers only

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next field
    if (value !== "" && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto submit on 4th digit entered if Order ID is present (per user idea)
    const combined = newPin.join("");
    if (combined.length === 4 && orderId.trim() !== "") {
      verifyPin({ order: orderId, code: combined });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter an Order ID or Reference number.");
      return;
    }
    const combined = pin.join("");
    if (combined.length < 4) {
      toast.error("Please enter the complete 4-digit security PIN.");
      return;
    }
    verifyPin({ order: orderId, code: combined });
  };

  const handleReset = () => {
    setOrderId("");
    setPin(["", "", "", ""]);
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 font-poppins text-gray-900">
      <PageSEO />
      
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-lily/10 flex items-center justify-center mb-5 transform hover:rotate-6 transition-transform">
            <ShieldCheck className="w-9 h-9 text-lily" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
            Delivery Verification
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs font-medium">
            Enter the buyer's 4-digit Chop-PIN to authenticate dropoff and instantly release escrow funds.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Successful!</h2>
            <p className="text-sm text-emerald-700 mb-6 font-medium">
              Order has been confirmed as delivered. Escrow is safely credited to the vendor.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Verify Another Order</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Order ID / Reference
              </label>
              <input
                type="text"
                placeholder="e.g., ORD-98421 or UUID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 focus:border-lily rounded-xl text-black font-semibold placeholder-gray-400 outline-none transition-all duration-200 shadow-sm focus:shadow-md"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700">
                  4-Digit Security Chop-PIN
                </label>
                <span className="text-[10px] text-lily font-bold flex items-center gap-1 uppercase tracking-wider bg-lily/10 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Auto-validates
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={isPending}
                    className="w-full h-16 text-center font-black text-3xl bg-white border-2 border-gray-200 focus:border-lily rounded-xl text-black outline-none transition-all duration-150 shadow-sm focus:shadow-md"
                  />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-gray-600 font-medium">
              <AlertCircle className="w-5 h-5 text-gray-800 shrink-0 mt-0.5" />
              <span className="leading-relaxed">Ask the buyer for this code only upon presenting the items at delivery.</span>
            </div>

            <button
              type="submit"
              disabled={isPending || pin.join("").length < 4 || !orderId.trim()}
              className="w-full py-4 rounded-2xl bg-lily hover:bg-lily/90 text-white font-extrabold text-lg shadow-xl shadow-lily/20 transform active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Validating PIN...</span>
                </>
              ) : (
                <>
                  <span>Release Escrow</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          Powered by Lily Shop
        </div>
      </div>
    </div>
  );
};

export default PinValidationPage;
