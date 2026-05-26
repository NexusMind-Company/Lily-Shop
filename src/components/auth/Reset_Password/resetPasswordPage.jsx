import { useState, useEffect } from "react";
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
  clearResetState,
} from "../../../redux/passwordResetSlice";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const token = pathToken || searchParams.get("token");
  const [values, setValues] = useState({
    new_password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { loading, error, success } = useSelector(
    (state) => state.passwordReset.confirm,
  );

  // Handle cleanup when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearResetState());
    };
  }, [dispatch]);

  // Redirect on success
  useEffect(() => {
    if (success) {
      toast.success("Password changed successfully!");
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearResetState());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    if (!token) {
      toast.error("Invalid or missing token. Please retry your reset link.");
      return;
    }

    dispatch(confirmResetPassword({ token, new_password }));
  };

  //  SUCCESS STATE
  if (success) {
    return (
      <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
        <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>

        <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
          <span className="border-b-2 border-solid pb-0.5 border-lily">
            Pass
          </span>
          word Changed
        </h2>

        <p className="text-sm font-medium text-ash -mt-4">
          Your password has been successfully changed. Redirecting to login...
        </p>
      </section>
    );
  }

  // RESET PASSWORD FORM
  return (
    <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
        <span className="border-b-2 border-solid pb-0.5 border-lily">Rese</span>
        t Your Password
      </h2>

      <p className="text-sm font-medium text-ash -mt-4">
        Your new password must be different from the previous one.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* New Password */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="new_password"
              value={values.new_password}
              onChange={handleChange}
              placeholder="New Password"
              disabled={loading}
              className={`input rounded-[7px] h-11.5 w-full pr-10 ${
                validationErrors.new_password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
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

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              disabled={loading}
              className={`input rounded-[7px] h-11.5 w-full pr-10 ${
                validationErrors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`h-11.5 rounded-full font-bold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "RESETTING..." : "RESET PASSWORD"}
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

export default ResetPasswordPage;
