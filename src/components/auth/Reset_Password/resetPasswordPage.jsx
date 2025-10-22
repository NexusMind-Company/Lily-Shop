/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";

// API call
const resetPasswordApi = async ({ password }) => {
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/api/reset-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }
  );
  if (!res.ok) throw await res.json();
  return res.json();
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verified, setVerified] = useState(true);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => setVerified(true),
    onError: (err) => {
      setErrors({
        form: err.detail || "Password reset failed",
        password: err.password?.[0],
      });
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const { password, confirmPassword } = values;

    if (!password) {
      setErrors({ password: "New password is required" });
      return;
    }
    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (!confirmPassword) {
      setErrors({ confirmPassword: "Please confirm your password" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    mutation.mutate({ password });
  };

  // --- SUCCESS UI ---
  if (verified) {
    return (
      <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>

        {/* Title + subtitle */}
        <div className="grid place-items-center gap-3">
          <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
            Password Changed
          </h2>
          <p className="font-poppins font-bold text-center text-ash text-xs p-2">
            Your password has been changed successfully please login with your
            new password
          </p>
        </div>

        {/* Back to log in btn */}
        <button className="self-start">
          <Link to={"/login"} className="flex items-center gap-2">
            <img src="./arrowleft.png" alt="arrow" className="size-3" />
            <p className="font-medium text-black font-poppins text-sm">
              Back to Log in
            </p>
          </Link>
        </button>
      </section>
    );
  }

  // --- RESET PASSWORD UI ---
  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-[#FFFAE7] w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title + subtitle */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Reset Your Password
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs p-">
          The password must be different from the previouse one
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        {/* General errors */}
        {errors.form && (
          <p className="text-red-500 text-sm -mb-4">{errors.form}</p>
        )}

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="New Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="pt-0 h-[46px] bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
        >
          {mutation.isLoading ? "Resetting..." : "RESET PASSWORD"}
        </button>
      </form>

      {/* Back to log in btn */}
      <button className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-3" />
          <p className="font-medium text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </button>
    </section>
  );
};

export default ResetPasswordPage;
