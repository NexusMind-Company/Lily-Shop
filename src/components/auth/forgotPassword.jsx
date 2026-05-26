import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  requestPasswordReset,
  clearPasswordResetState,
} from "../../redux/passwordResetSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get state from Redux slice
  const { status, error, step } = useSelector((state) => state.passwordReset);

  const loading = status === "loading";
  const emailSent = step === "verify";

  // Handle success state
  useEffect(() => {
    if (emailSent) {
      setIsSubmitted(true);
    }
  }, [emailSent]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPasswordResetState());
    }
  }, [error, dispatch]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationErrors({});

    if (!email.trim()) {
      setValidationErrors({ email: "Email is required" });
      return;
    }

    dispatch(requestPasswordReset(email));
  };

  if (isSubmitted) {
    return (
      <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
        <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>

        <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
          <span className="border-b-2 border-solid pb-0.5 border-lily">
            Chec
          </span>
          k Your Email
        </h2>

        <p className="text-sm font-medium text-ash -mt-4">
          We've sent a password reset link to{" "}
          <span className="text-black font-semibold">{email}</span>. Please
          check your inbox and follow the instructions.
        </p>

        <div className="self-start mt-4">
          <Link to="/login" className="flex items-center gap-2">
            <img src="/arrowleft.png" alt="arrow" className="size-4" />
            <p className="font-semibold text-black font-poppins text-sm">
              Back to Log in
            </p>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
        <span className="border-b-2 border-solid pb-0.5 border-lily">Forg</span>
        ot Password?
      </h2>

      <p className="text-sm font-medium text-ash -mt-4">
        Enter your email address and we'll send you a code to reset your
        password.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) setValidationErrors({});
            }}
            placeholder="Email Address"
            disabled={loading}
            className={`input rounded-[7px] h-11.5 w-full ${
              validationErrors.email ? "border-red-500" : ""
            }`}
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`h-11.5 rounded-full font-bold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "SENDING..." : "RESET PASSWORD"}
        </button>
      </form>

      {/* Back to login */}
      <div className="self-start">
        <Link to="/login" className="flex items-center gap-2">
          <img src="/arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
