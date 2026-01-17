import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email_or_phonenumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect to login on successful registration
  useEffect(() => {
    if (registrationSuccess) {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [registrationSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email or Phone validation
    if (!formData.email_or_phonenumber.trim()) {
      errors.email_or_phonenumber = "Email or phone number is required";
    } else {
      const isEmail = formData.email_or_phonenumber.includes("@");
      const isPhone = /^(\+234|0)[789]\d{9}$/.test(
        formData.email_or_phonenumber
      );

      if (!isEmail && !isPhone) {
        errors.email_or_phonenumber =
          "Please enter a valid email or Nigerian phone number";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Dispatch registration
      await dispatch(
        registerUser({
          email_or_phonenumber: formData.email_or_phonenumber.trim(),
          password: formData.password,
        })
      );
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { text: "", color: "" };
    if (password.length < 6)
      return { text: "Weak", color: "text-red-500" };
    if (password.length < 10)
      return { text: "Medium", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
            alt="Virtual Store Background"
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
            Start Your <br /> Online Business
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Create an account to build your own virtual store and sell products, even without a physical shop.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0 py-10">
          <div className="max-w-md w-full mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="font-poppins font-bold text-black text-3xl mb-2">
                <span className="border-b-[4px] border-solid pb-1 border-lily">
                  Cre
                </span>
                ate Account
              </h2>
              <p className="text-gray-500 mt-2">
                Join Lily Shops and start selling today
              </p>
            </div>

            {/* Success Message */}
            {registrationSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md">
                <p className="font-medium flex items-center gap-2">
                  <FiCheck className="text-green-600" /> Registration successful!
                </p>
                <p className="text-sm">Redirecting you to login page...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md">
                <p className="font-medium">✗ Registration Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email or Phone Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email_or_phonenumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  id="email_or_phonenumber"
                  name="email_or_phonenumber"
                  value={formData.email_or_phonenumber}
                  onChange={handleChange}
                  placeholder="Enter email or phone number"
                  className={`input w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${validationErrors.email_or_phonenumber
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                    }`}
                  disabled={loading || registrationSuccess}
                />
                {validationErrors.email_or_phonenumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.email_or_phonenumber}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use format: email@example.com or +234XXXXXXXXXX
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`input w-full px-4 py-3 pr-12 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${validationErrors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                      }`}
                    disabled={loading || registrationSuccess}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || registrationSuccess}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.password}
                  </p>
                )}
                {formData.password && !validationErrors.password && (
                  <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.text}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`input w-full px-4 py-3 pr-12 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${validationErrors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                      }`}
                    disabled={loading || registrationSuccess}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading || registrationSuccess}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword &&
                  !validationErrors.confirmPassword && (
                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                      <FiCheck size={14} /> Passwords match
                    </p>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || registrationSuccess}
                className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 mt-2 ${loading || registrationSuccess
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : registrationSuccess ? (
                  "Success! Redirecting..."
                ) : (
                  "CREATE ACCOUNT"
                )}
              </button>

              {/* Login Prompt */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-lily hover:text-darklily font-bold underline transition-colors ml-1"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;