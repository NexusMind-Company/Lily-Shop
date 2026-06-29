import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../services/api";

const VerificationSentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await api.post("/auth/resend-verification-email/", { email });
      toast.success("Verification email resent! Check your inbox.");
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.message ||
        (status === 500
          ? "The verification service is unavailable. Please try again later or contact support."
          : "Could not resend verification email.");
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <div className="max-w-3xl mx-auto w-full">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
        <div className="flex flex-col items-center text-center gap-4 mt-8">
          <div className="size-16 rounded-full bg-green-100 flex items-center justify-center">
            <FiCheckCircle className="text-green-600" size={32} />
          </div>

          <h2 className="font-poppins font-bold text-black text-xl/[30px]">
            <span className="border-b-2 border-solid pb-0.5 border-lily">
              Acco
            </span>
            unt Created
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-left w-full">
            <div className="flex items-start gap-3">
              <FiMail className="text-blue-600 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-blue-800 text-sm">
                  Verify your email address
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  We&apos;ve sent a verification link to{" "}
                  <span className="font-semibold break-all">{email || "your email"}</span>.
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Click the link in the email to activate your account, then log
                  in.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left w-full">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-yellow-600 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-yellow-700 text-xs">
                  Didn&apos;t get the email? Check your spam folder, or{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-lily font-semibold hover:underline disabled:text-gray-400"
                  >
                    {resending ? "Sending..." : "resend the verification email"}
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="h-11.5 w-full rounded-full font-bold text-white bg-lily hover:bg-darklily transition-all"
          >
            GO TO LOGIN
          </button>
        </div>

        <div className="self-start mt-2">
          <Link to="/login" className="flex items-center gap-2">
            <img src="/arrowleft.png" alt="arrow" className="size-4" />
            <p className="font-semibold text-black font-poppins text-sm">
              Back to Log in
            </p>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 w-full py-6 border-t border-gray-100 bg-white">
        <div className="flex justify-center gap-4 text-xs font-medium text-ash">
          <Link to="/about" className="hover:text-lily transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link to="/about" className="hover:text-lily transition-colors">
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </section>
  );
};

export default VerificationSentPage;
