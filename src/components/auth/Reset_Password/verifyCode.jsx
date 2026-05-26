// src/pages/auth/ResetVerifyCode.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  verifyResetToken,
  requestPasswordReset,
  clearPasswordResetState,
} from "../../../redux/passwordResetSlice";

const ResetVerifyCode = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const email = params.get("email");

  const dispatch = useDispatch();

  const CODE_LENGTH = 6;
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef([]);
  const token = digits.join("");

  // Read from Redux
  const { status, error, successMessage, step } = useSelector(
    (state) => state.passwordReset,
  );

  const loading = status === "loading";
  const verified = step === "confirm";

  // Navigate when token is verified
  useEffect(() => {
    if (verified) {
      toast.success("Code verified successfully!");
      setTimeout(() => {
        navigate(`/reset-password?token=${token}`);
        dispatch(clearPasswordResetState());
      }, 1500);
    }
  }, [verified, navigate, token, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPasswordResetState());
    }
    if (successMessage && !verified) {
      toast.success(successMessage);
    }
  }, [error, successMessage, verified, dispatch]);

  //  Handle cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Cleanup Redux state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  const onDigitChange = (index, value) => {
    if (/^[A-Za-z0-9]?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value.toUpperCase();
      setDigits(newDigits);

      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const onKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    if (token.length < CODE_LENGTH) {
      toast.error("Please enter the complete verification code.");
      return;
    }
    dispatch(verifyResetToken(token));
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    dispatch(requestPasswordReset(email));
    setResendCooldown(30);
  };

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
        <span className="border-b-2 border-solid pb-0.5 border-lily">Veri</span>
        fication Code
      </h2>

      <p className="text-sm font-medium text-ash -mt-4">
        We sent a reset verification code to{" "}
        <span className="text-black">{email}</span>. Please enter it below.
      </p>

      {/* Inputs */}
      <div className="flex justify-center">
        <div className="grid grid-cols-6 gap-3 w-full max-w-xs">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              onChange={(e) => onDigitChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              maxLength={1}
              inputMode="text"
              className={`h-14 w-12 text-center rounded-lg border-2 focus:outline-none ${
                digit
                  ? "border-lily text-lily font-bold text-2xl"
                  : "border-disabled text-gray-400"
              } focus:border-lily`}
            />
          ))}
        </div>
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={token.length < CODE_LENGTH || loading}
        className={`h-11.5 rounded-full font-bold text-white transition-all ${
          token.length < CODE_LENGTH || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-lily hover:bg-darklily"
        }`}
      >
        {loading ? "VERIFYING..." : "VERIFY NOW"}
      </button>

      {/* Resend */}
      <p className="text-sm text-ash self-start text-center">
        Didn’t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
          className={`ml-1 font-bold ${
            resendCooldown > 0 ? "text-slate-400" : "text-lily underline"
          }`}
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Click to resend"}
        </button>
      </p>

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

export default ResetVerifyCode;
