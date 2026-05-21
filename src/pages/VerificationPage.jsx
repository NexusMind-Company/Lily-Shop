// src/pages/VerificationPage.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const verificationType = searchParams.get("type") || "email"; // 'email' or 'sms'
  const contact = searchParams.get("contact") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.lilyshops.com";

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (verificationType === "email") {
        // Email verification
        const response = await axios.post(
          `${API_BASE_URL}/auth/verify-email/`,
          {
            token: code,
          },
        );

        setSuccess(response.data.message || "Email verified successfully!");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // SMS/Phone verification
        const response = await axios.post(
          `${API_BASE_URL}/auth/phone/otp/verify/`,
          {
            phone_number: contact,
            otp: code,
          },
        );

        setSuccess(response.data.message || "Phone verified successfully!");

        // Store tokens and redirect
        if (response.data.token) {
          localStorage.setItem("access_token", response.data.token.access);
          localStorage.setItem("refresh_token", response.data.token.refresh);
          localStorage.setItem("user_id", response.data.user_id);
        }

        setTimeout(() => {
          navigate("/feed");
        }, 2000);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.otp?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Verification failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      if (verificationType === "email") {
        await axios.post(`${API_BASE_URL}/auth/resend-verification-email/`, {
          email: contact,
        });
        setSuccess("Verification email resent! Check your inbox.");
      } else {
        await axios.post(`${API_BASE_URL}/auth/phone/otp/request/`, {
          phone_number: contact,
        });
        setSuccess("New OTP sent to your phone!");
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Verify Your {verificationType === "email" ? "Email" : "Phone"}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {verificationType === "email"
            ? `We've sent a verification code to ${contact}`
            : `Enter the 6-digit code sent to ${contact}`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={
                verificationType === "email" ? "Enter code" : "000000"
              }
              maxLength={verificationType === "email" ? 64 : 6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:underline disabled:text-gray-400"
          >
            {resending ? "Sending..." : "Didn't receive the code? Resend"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
