import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

// API call to verify code
const verifyCodeApi = async ({ contact, code }) => {
  const res = await fetch("/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, code }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// API call to resend code
const resendCodeApi = async (contact) => {
  const res = await fetch("/api/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

const VerifyCode = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const contact = params.get("contact");

  const CODE_LENGTH = 4;
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef([]);
  const code = digits.join("");

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: verifyCodeApi,
    onSuccess: () => setVerified(true),
    onError: (err) => setMessage(err.detail || "Verification failed"),
  });

  // Resend mutation
  const resendMutation = useMutation({
    mutationFn: () => resendCodeApi(contact),
    onSuccess: (data) => setMessage(data.message || "Code resent!"),
    onError: (err) => setMessage(err.detail || "Failed to resend code"),
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
    setMessage("");
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
      <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
        <div className="flex items-center bg-[#FFFAE7] w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>

        <div className="grid place-items-center gap-3">
          <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
            Account Verified
          </h2>
          <p className="font-poppins font-bold text-center text-ash text-xs">
            Your account has been successfully verified
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/create-username?contact=${encodeURIComponent(contact)}`)
          }
          className="pt-0 h-[46px] bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
        >
          CONTINUE
        </button>

        <div className="self-start">
          <Link to={"/login"} className="flex items-center gap-2">
            <img src="./arrowleft.png" alt="arrow" className="size-4" />
            <p className="font-semibold text-black font-poppins text-sm">
              Back to Log in
            </p>
          </Link>
        </div>
      </section>
    );
  }

  // --- VERIFY CODE UI ---
  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-[#FFFAE7] w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Enter Verification Code
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs">
          We sent a verification code to{" "}
          <span className="text-black">{contact}</span>
        </p>
      </div>

      {/* Status */}
      {message && <p className="text-center text-sm text-red-500">{message}</p>}

      {/* Inputs */}
      <div className="mt-6 flex justify-center">
        <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
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
        className={`pt-0 h-[46px] border-none rounded-full font-inter font-bold text-[15px]/[18.51px] ${
          code.length < CODE_LENGTH || verifyMutation.isLoading
            ? "bg-disabled text-disabled__text cursor-not-allowed"
            : " bg-lily text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
        }`}
      >
        {verifyMutation.isLoading ? "Verifying..." : "VERIFY NOW"}
      </button>

      {/* Resend */}
      <p className="text-sm text-ash self-start text-center">
        Didn’t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={resendMutation.isLoading || resendCooldown > 0}
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
      <div className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-3" />
          <p className="font-semibold text-black font-poppins text-xs">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default VerifyCode;
