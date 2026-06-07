import { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  confirmResetPassword,
  verifyResetToken,
  clearResetState,
} from "../../../redux/passwordResetSlice";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const token = pathToken || searchParams.get("token");
  const initializedToken = useRef(null);

  const [values, setValues] = useState({
    new_password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { status, error, step } = useSelector((state) => state.passwordReset);

  const isVerifying = status === "loading" && step === "request";
  const isTokenValid = step === "confirm" || step === "completed";
  const isResetting = status === "loading" && step === "confirm";
  const isSuccess = step === "completed";

  // 1. Verify token on mount (Strict Mode safe)
  useEffect(() => {
    if (token && initializedToken.current !== token) {
      dispatch(clearResetState());
      dispatch(verifyResetToken(token));
      initializedToken.current = token;
    } else if (!token) {
      toast.error("No reset token found.");
    }
  }, [dispatch, token]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Password changed successfully!");
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isResetting) return;
    setValidationErrors({});

    const { new_password, confirmPassword } = values;

    if (!new_password)
      return setValidationErrors({ new_password: "New password is required" });
    if (new_password.length < 6)
      return setValidationErrors({
        new_password: "Password must be at least 6 characters",
      });
    if (!confirmPassword)
      return setValidationErrors({
        confirmPassword: "Please confirm your password",
      });
    if (new_password !== confirmPassword)
      return setValidationErrors({ confirmPassword: "Passwords do not match" });

    dispatch(confirmResetPassword({ token, new_password }));
  };

  // Header Component (shared across states)
  const Header = () => (
    <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
      <div className="max-w-3xl mx-auto w-full">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>
    </div>
  );

  const Footer = () => (
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
  );

  // 🔹 STATE 1: VERIFYING TOKEN
  if (isVerifying) {
    return (
      <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500 items-center justify-center text-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-7 max-w-3xl mx-auto w-full mt-24">
          <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
          <p className="text-ash font-medium">Verifying your reset link...</p>
        </div>
        <Footer />
      </section>
    );
  }

  // 🔹 STATE 2: INVALID TOKEN / ERROR
  if (status === "failed" && !isTokenValid) {
    return (
      <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
        <Header />
        <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
          <h2 className="font-poppins font-bold text-black text-xl/[30px]">
            <span className="border-b-2 border-solid pb-0.5 border-lily">
              Inva
            </span>
            lid Link
          </h2>
          <p className="text-sm font-medium text-ash -mt-4">
            {error || "This password reset link is invalid or has expired."}
          </p>
          <div className="self-start">
            <Link
              to="/forgot-password"
              title="Request new link"
              className="flex items-center gap-2"
            >
              <img src="/arrowleft.png" alt="arrow" className="size-4" />
              <p className="font-semibold text-black font-poppins text-sm">
                Back to Forgot Password
              </p>
            </Link>
          </div>
        </div>
        <Footer />
      </section>
    );
  }

  // 🔹 STATE 3: SUCCESS STATE
  if (isSuccess) {
    return (
      <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
        <Header />
        <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
          <h2 className="font-poppins font-bold text-black text-xl/[30px]">
            <span className="border-b-2 border-solid pb-0.5 border-lily">
              Pass
            </span>
            word Changed
          </h2>
          <p className="text-sm font-medium text-ash -mt-4">
            Your password has been successfully changed. Redirecting to login...
          </p>
        </div>
        <Footer />
      </section>
    );
  }

  // 🔹 STATE 4: RESET PASSWORD FORM (Default)
  return (
    <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
      <Header />

      <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
        <h2 className="font-poppins font-bold text-black text-xl/[30px]">
          <span className="border-b-2 border-solid pb-0.5 border-lily">
            Rese
          </span>
          t Your Password
        </h2>

        <p className="text-sm font-medium text-ash -mt-4">
          Your new password must be different from the previous one.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="new_password"
                value={values.new_password}
                onChange={handleChange}
                placeholder="New Password"
                disabled={isResetting}
                className={`input rounded-[7px] h-11.5 w-full pr-10 ${
                  validationErrors.new_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isResetting}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {validationErrors.new_password && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.new_password}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                disabled={isResetting}
                className={`input rounded-[7px] h-11.5 w-full pr-10 ${
                  validationErrors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isResetting}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
              >
                {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetting}
            className={`h-11.5 rounded-full font-bold text-white transition-all ${
              isResetting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-lily hover:bg-darklily"
            }`}
          >
            {isResetting ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className="self-start">
          <Link to="/login" className="flex items-center gap-2">
            <img src="/arrowleft.png" alt="arrow" className="size-4" />
            <p className="font-semibold text-black font-poppins text-sm">
              Back to Log in
            </p>
          </Link>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default ResetPasswordPage;
