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

  const HeroSection = ({ title, subtitle }) => (
    <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop"
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
          {title}
        </h2>
        <p className="text-xl text-green-50 max-w-md">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 text-sm opacity-70">
        © {new Date().getFullYear()} Lily Shops. All rights reserved.
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
      <Link to="/">
        <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
      </Link>
    </div>
  );

  // --- SUCCESS UI ---
  if (verified) {
    return (
      <div className="flex min-h-screen w-full bg-white">
        <HeroSection
          title={<>Welcome <br /> Aboard</>}
          subtitle="Your account has been successfully verified. You're now ready to explore."
        />

        {/* Right Side - Success */}
        <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
          <MobileHeader />

          <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
            <div className="max-w-md w-full mx-auto text-center lg:text-left">
              <div className="mb-10">
                <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                  Account Verified
                </h2>
                <p className="font-poppins text-ash text-sm">
                  Your account has been successfully verified
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <button
                  onClick={() =>
                    navigate(`/create-username?contact=${encodeURIComponent(contact)}`)
                  }
                  className="w-full py-4 bg-lily border-none rounded-full font-inter font-bold text-[15px] text-white cursor-pointer hover:bg-darklily transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  CONTINUE
                </button>

                <div className="flex justify-center lg:justify-start">
                  <Link to={"/login"} className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
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
      </div>
    );
  }

  // --- VERIFY CODE UI ---
  return (
    <div className="flex min-h-screen w-full bg-white">
      <HeroSection
        title={<>Verify <br /> Your Identity</>}
        subtitle="For your security, we verified your contact information."
      />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        <MobileHeader />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Title */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                Enter Verification Code
              </h2>
              <p className="font-poppins text-ash text-sm">
                We sent a verification code to{" "}
                <span className="text-black font-medium">{contact}</span>
              </p>
            </div>

            {/* Status */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg text-sm text-center ${message.includes("resent") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                {message}
              </div>
            )}

            {/* Inputs */}
            <div className="mb-8 flex justify-center lg:justify-start">
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
                    className={`h-16 w-full text-center rounded-xl border-2 focus:outline-none transition-all duration-200 text-2xl font-bold
                      ${digit
                        ? "border-lily text-lily bg-green-50"
                        : "border-gray-200 text-gray-800 focus:border-lily focus:ring-4 focus:ring-green-100"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Verify button */}
            <button
              type="submit"
              onClick={handleVerify}
              disabled={code.length < CODE_LENGTH || verifyMutation.isLoading}
              className={`w-full py-4 rounded-full font-bold text-white transition-all transform hover:-translate-y-0.5 shadow-lg ${code.length < CODE_LENGTH || verifyMutation.isLoading
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                }`}
            >
              {verifyMutation.isLoading ? "Verifying..." : "VERIFY NOW"}
            </button>

            {/* Resend */}
            <div className="mt-6 text-center lg:text-left">
              <p className="text-sm text-gray-500">
                Didn’t receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resendMutation.isLoading || resendCooldown > 0}
                  className={`font-semibold ml-1 hover:underline transition-colors ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-lily cursor-pointer"
                    }`}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Click to resend"}
                </button>
              </p>
            </div>

            {/* Back to login */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to={"/login"} className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="./arrowleft.png" alt="arrow" className="size-3 group-hover:-translate-x-1 transition-transform" />
                <p className="font-semibold text-black font-poppins text-xs group-hover:text-lily transition-colors">
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

export default VerifyCode;
