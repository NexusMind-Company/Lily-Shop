/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  confirmResetPassword,
  clearResetState,
} from "../../../redux/passwordResetSlice";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); 

  const [values, setValues] = useState({
    new_password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const { loading, error, success } = useSelector(
    (state) => state.passwordReset.confirm
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
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const { new_password, confirmPassword } = values;

    if (!new_password) return setErrors({ new_password: "New password is required" });
    if (new_password.length < 6)
      return setErrors({ new_password: "Password must be at least 6 characters" });
    if (!confirmPassword)
      return setErrors({ confirmPassword: "Please confirm your password" });
    if (new_password !== confirmPassword)
      return setErrors({ confirmPassword: "Passwords do not match" });
    if (!token)
      return setErrors({
        form: "Invalid or missing token. Please retry your reset link.",
      });

    dispatch(confirmResetPassword({ token, new_password }));
  };

  //  SUCCESS STATE
  if (success) {
    return (
      <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
        <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="grid place-items-center gap-3">
          <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
            Password Changed
          </h2>
          <p className="font-poppins font-bold text-center text-ash text-xs p-2">
            Your password has been successfully changed. Redirecting to login...
          </p>
        </div>
      </section>
    );
  }

  // RESET PASSWORD FORM
  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-[#FFFAE7] w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title + subtitle */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Reset Your Password
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs p-2">
          Your new password must be different from the previous one.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        {errors.form && <p className="text-red-500 text-sm -mb-4">{errors.form}</p>}
        {error && <p className="text-red-500 text-sm -mb-4">{error}</p>}

        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="new_password"
            value={values.new_password}
            onChange={handleChange}
            placeholder="New Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.new_password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.new_password && (
            <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="pt-0 h-[46px] bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
        >
          {loading ? "Resetting..." : "RESET PASSWORD"}
        </button>
      </form>

      {/* Back to login */}
      <button className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-3" />
          <p className="font-medium text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </button>
    </section>
  );
};

export default ResetPasswordPage;
