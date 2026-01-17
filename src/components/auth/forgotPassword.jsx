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
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop"
            alt="Fashion Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lily/30 to-lily/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <h1 className="font-bold text-4xl uppercase tracking-wider">Lily Shops</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins leading-tight">
            Account <br /> Recovery
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Don't worry, we'll help you get back to your account in no time.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Title + subtitle */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                Forgot Password?
              </h2>
              <p className="font-poppins text-ash text-sm">
                Enter your email to reset your password and recover your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`input w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                  }`}
              >
                {loading ? "Sending..." : "RESET PASSWORD"}
              </button>

              {/* Error from Redux slice */}
              {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}

              {/* Success message */}
              {successMessage && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                  {successMessage}
                </p>
              )}
            </form>

            {/* Back to login */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/login" className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="./arrowleft.png" alt="arrow" className="size-4 group-hover:-translate-x-1 transition-transform" />
                <p className="font-semibold text-black font-poppins text-sm group-hover:text-lily transition-colors">
                  Back to Log in
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
