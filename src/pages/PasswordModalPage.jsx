import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyPaymentPassword } from "../api/checkoutApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const PasswordModalPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: verifyPaymentPassword,
    onSuccess: () => {
      // Password is correct, proceed to payment
      navigate("/payment-loading"); // Or /payment-success if card is instant
    },
    onError: (error) => {
      // Handle wrong password
      alert(error.message || "Invalid password");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      alert("Please enter your password.");
      return;
    }
    mutation.mutate(password);
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center p-6 bg-white max-w-xl mx-auto">
      {/* This is a modal in Figma, but we'll make it a page */}
      <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-center text-lg font-semibold mb-4">
          Enter password to complete process
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 size={24} className="animate-spin mx-auto" />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModalPage;

