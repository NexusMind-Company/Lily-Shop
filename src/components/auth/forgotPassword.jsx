// src/pages/auth/ForgotPassword.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  requestPasswordReset,
  clearPasswordResetState,
} from "../../redux/passwordResetSlice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  // Get state from Redux slice
  const { status, error, successMessage, step } = useSelector(
    (state) => state.passwordReset
  );

  const loading = status === "loading";
  const emailSent = step === "verify";

  // Navigate on success
  useEffect(() => {
    if (emailSent) {
      navigate(`/reset-verify-code?email=${encodeURIComponent(email)}`);
      dispatch(clearPasswordResetState());
    }
  }, [emailSent, navigate, email, dispatch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    dispatch(requestPasswordReset(email));
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title + subtitle */}
      <div className="grid place-items-center gap-3 mt-20">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Forgot Password?
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs px-14">
          Enter your email to reset your password
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className={`input rounded-[7px] h-[46px] ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`h-[46px] rounded-full font-bold text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "Sending..." : "RESET PASSWORD"}
        </button>

        {/* Error from Redux slice */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Success message */}
        {successMessage && (
          <p className="text-green-600 text-sm text-center">
            {successMessage}
          </p>
        )}
      </form>

      {/* Back to login */}
      <div className="self-start">
        <Link to="/login" className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
