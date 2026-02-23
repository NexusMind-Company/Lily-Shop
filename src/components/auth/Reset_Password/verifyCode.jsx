// src/pages/auth/ResetVerifyCode.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef([]);
  const token = digits.join("");

  // Read from Redux
  const { status, error, successMessage, step } = useSelector(
    (state) => state.passwordReset
  );

  const loading = status === "loading";
  const verified = step === "confirm";

  // Navigate when token is verified
  useEffect(() => {
    if (verified) {
      navigate(`/reset-password?token=${token}`);
      dispatch(clearPasswordResetState());
    }
  }, [verified, navigate, token, dispatch]);

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
    setMessage("");
    if (token.length < CODE_LENGTH) {
      setMessage("Please enter the complete verification code.");
      return;
    }
    dispatch(verifyResetToken(token));
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    dispatch(requestPasswordReset(email));
    setResendCooldown(30);
    setMessage("A new verification code has been sent to your email.");
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-[#FFFAE7] w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title */}
      <div className="grid place-items-center gap-3 mt-20">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Enter Verification Code
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs">
          We sent a reset verification code to{" "}
          <span className="text-black">{email}</span>
        </p>
      </div>

      {/* Status messages */}
      {(message || error || successMessage) && (
        <p
          className={`text-center text-sm ${
            error ? "text-red-500" : "text-green-600"
          }`}
        >
          {message || error || successMessage}
        </p>
      )}

      {/* Inputs */}
      <div className="mt-6 flex justify-center">
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
        className={`pt-0 h-[46px] border-none rounded-full font-inter font-bold text-[15px]/[18.51px] ${
          token.length < CODE_LENGTH || loading
            ? "bg-disabled text-disabled__text cursor-not-allowed"
            : "bg-lily text-white cursor-pointer hover:bg-darklily"
        }`}
      >
        {loading ? "Verifying..." : "VERIFY NOW"}
      </button>

      {/* Resend */}
      <p className="text-sm text-ash self-start text-center">
        Didn’t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
          className={`ml-1 ${
            resendCooldown > 0 ? "text-slate-400" : "text-lily"
          }`}
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Click to resend"}
        </button>
      </p>

      {/* Back to login */}
      <button className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-3" />
          <p className="font-semibold text-black font-poppins text-xs">
            Back to Log in
          </p>
        </Link>
      </button>
    </section>
  );
};

export default ResetVerifyCode;
