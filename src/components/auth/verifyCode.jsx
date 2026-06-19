import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { requestPhoneOTP, verifyPhoneOTP } from "../../services/api";

// API call to verify code
const verifyCodeApi = async ({ contact, code }) => {
  const data = await verifyPhoneOTP(contact, code);
  return data;
};

// API call to resend code
const resendCodeApi = async (contact) => {
  const data = await requestPhoneOTP(contact);
  return data;
};

const VerifyCode = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const contact = params.get("contact");

  const CODE_LENGTH = 6;
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef([]);
  const code = digits.join("");

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: verifyCodeApi,
    onSuccess: () => {
      toast.success("Account verified successfully!");
      setVerified(true);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.status === 500
          ? "SMS verification service is temporarily unavailable on the server. If you are in a testing environment, please use default bypass OTP '123456'."
          : err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Verification failed";
      toast.error(errorMsg);
    },
  });

  // Resend mutation
  const resendMutation = useMutation({
    mutationFn: () => resendCodeApi(contact),
    onSuccess: (data) => toast.success(data.message || "Code resent!"),
    onError: (err) => {
      const errorMsg =
        err.response?.status === 500
          ? "SMS verification service is temporarily unavailable on the server. If you are in a testing environment, please use default bypass OTP '123456'."
          : err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Failed to resend code";
      toast.error(errorMsg);
    },
  });

  // countdown for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle input typing
  const onDigitChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);

      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  // Handle backspace
  const onKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Verify
  const handleVerify = () => {
    verifyMutation.mutate({ contact, code });
  };

  // Resend
  const handleResend = () => {
    if (resendCooldown > 0) return;
    resendMutation.mutate();
    setResendCooldown(30);
  };

  // --- SUCCESS UI ---
  if (verified) {
    return (
      <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
        {/* Header */}
        <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
          <div className="max-w-3xl mx-auto w-full">
            <Link to="/">
              <h1 className="font-bold text-2xl text-lily uppercase">
                Lily Shops
              </h1>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
          {/* Page Title */}
          <h2 className="font-poppins font-bold text-black text-xl/[30px]">
            <span className="border-b-2 border-solid pb-0.5 border-lily">
              Acco
            </span>
            unt Verified
          </h2>

          <p className="text-sm font-medium text-ash -mt-4">
            Your account has been successfully verified. Click continue to
            proceed.
          </p>

          <button
            onClick={() =>
              navigate(
                `/create-username?contact=${encodeURIComponent(contact)}`,
              )
            }
            className="h-11.5 rounded-full font-bold text-white bg-lily hover:bg-darklily transition-all"
          >
            CONTINUE
          </button>

          <div className="self-start">
            <Link to="/login" className="flex items-center gap-2">
              <img src="/arrowleft.png" alt="arrow" className="size-4" />
              <p className="font-semibold text-black font-poppins text-sm">
                Back to Log in
              </p>
            </Link>
          </div>
        </div>

        {/* Localized Footer */}
        <footer className="absolute bottom-0 left-0 w-full py-6 border-t border-gray-100 bg-white">
          <div className="flex justify-center gap-4 text-xs font-medium text-ash">
            <Link to="/about" className="hover:text-lily transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-lily transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </section>
    );
  }

  // --- VERIFY CODE UI ---
  return (
    <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <div className="max-w-3xl mx-auto w-full">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
        {/* Page Title */}
        <h2 className="font-poppins font-bold text-black text-xl/[30px]">
          <span className="border-b-2 border-solid pb-0.5 border-lily">
            Veri
          </span>
          fication Code
        </h2>

        <p className="text-sm font-medium text-ash -mt-4">
          We sent a verification code to{" "}
          <span className="text-black">{contact}</span>. Please enter it below.
        </p>

        {/* Inputs */}
        <div className="flex justify-center">
          <div className="grid grid-cols-6 gap-3 w-full max-w-sm">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => onDigitChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
                maxLength={1}
                inputMode="numeric"
                className={`h-16 w-14 text-center rounded-lg border-2 focus:outline-none
                ${
                  digit
                    ? "border-lily text-lily font-bold text-3xl"
                    : "border-disabled text-gray-400"
                } focus:border-lily`}
              />
            ))}
          </div>
        </div>

        {/* Verify button */}
        <button
          type="submit"
          onClick={handleVerify}
          disabled={code.length < CODE_LENGTH || verifyMutation.isLoading}
          className={`h-11.5 rounded-full font-bold text-white transition-all ${
            code.length < CODE_LENGTH || verifyMutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {verifyMutation.isLoading ? "VERIFYING..." : "VERIFY NOW"}
        </button>

        {/* Resend */}
        <p className="text-sm text-ash self-start text-center">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resendMutation.isLoading || resendCooldown > 0}
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
      </div>

      {/* Localized Footer */}
      <footer className="absolute bottom-0 left-0 w-full py-6 border-t border-gray-100 bg-white">
        <div className="flex justify-center gap-4 text-xs font-medium text-ash">
          <Link to="/about" className="hover:text-lily transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/about" className="hover:text-lily transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </footer>
    </section>
  );
};

export default VerifyCode;
