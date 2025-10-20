/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";

// API call
const signupApi = async ({ phone_or_email, password }) => {
  const res = await fetch("/auth/users/", {
    method: "POST",
    header: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_or_email, password }),
  });
  if (!res.ok) {
    throw await res.json();
  }
  return res.json();
};

// Helpers
const formatPhone = (num) => {
  if (!num || typeof num !== "string" || num.length < 10) return num;
  const cleaned = num.startsWith("+234")
    ? num.substring(4)
    : num.startsWith("0")
    ? num.substring(1)
    : num;
  if (/^\d{10}$/.test(cleaned)) return "+234" + cleaned;
  return num;
};

const detectInputType = (value) => {
  if (!value) return null;
  const emailPattern = /^\S+@\S+\.\S+$/;
  const phonePattern = /^(0[789][01]\d{8}|\+234[789][01]\d{8}|[789][01]\d{8})$/;
  if (emailPattern.test(value)) return "email";
  if (phonePattern.test(value)) return "phone";
  return "unknown";
};

const SignUp = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ phone_or_email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (_, vars) => {
      // Navigate to verification step with contact in URL
      const type = detectInputType(vars.phone_or_email);
      const contact =
        type === "phone"
          ? formatPhone(vars.phone_or_email)
          : vars.phone_or_email;
      navigate(`/verify-email?contact=${encodeURIComponent(contact)}`);
    },
    onError: (err) => {
      setErrors({
        phone_or_email: err.phone_or_email?.[0],
        password: err.password?.[0],
        form: err.detail || "Registration failed",
      });
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const { phone_or_email, password } = values;

    if (!phone_or_email) {
      setErrors({ phone_or_email: "Phone or email is required" });
      return;
    }
    if (detectInputType(phone_or_email) === "unknown") {
      setErrors({
        phone_or_email: "Enter a valid phone number or email",
      });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }
    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    mutation.mutate(value);
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid pb-[2px] border-lily">
          Regis
        </span>
        ter
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* General errors */}
        {errors.form && (
          <p className="text-red-500 text-sm -mb-4">{errors.form}</p>
        )}

        {/* Phone or Email */}
        <div>
          <input
            type="text"
            name="phone_or_email"
            value={values.phone_or_email}
            onChange={handleChange}
            placeholder="Phone or email"
            className={`input rounded-[7px] h-[46px] mt-3 w-full ${
              errors.phone_or_email ? "border-red-500" : ""
            }`}
          />
          {errors.phone_or_email && (
            <p className="text-red-500 text-xs mt-1">{errors.phone_or_email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 mt-3 ${
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

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isLoading}
          className={`h-[46px] rounded-full font-bold text-white ${
            mutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {mutation.isLoading ? "Registering..." : "REGISTER"}
        </button>
      </form>

      {/* Login link */}
      <div className="font-inter text-sm font-bold">
        <Link to="/login">
          Already a member?{" "}
          <span className="text-lily font-bold underline">Log In</span>
        </Link>
      </div>
    </section>
  );
};

export default SignUp;
