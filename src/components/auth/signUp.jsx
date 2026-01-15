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
    <section className="flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-md z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Content */}
      <div className="mt-24">
        {/* Page Title */}
        <h2 className="font-poppins font-bold text-black text-2xl mb-2">
          <span className="border-b-[3px] border-solid pb-1 border-lily">
            Cre
          </span>
          ate Account
        </h2>
        <p className="text-gray-600 mb-6">
          Join Lily Shops and start selling today
        </p>

        {/* Success Message */}
        {registrationSuccess && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fade-in">
            <p className="font-medium flex items-center gap-2">
              <FiCheck className="text-green-600" /> Registration successful!
            </p>
            <p className="text-sm">Redirecting you to login page...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
            <p className="font-medium">✗ Registration Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email or Phone Input */}
          <div>
            <label
              htmlFor="email_or_phonenumber"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`input rounded-lg h-12 w-full px-4 border transition-colors ${
                validationErrors.email_or_phonenumber
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-lily"
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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`input rounded-lg h-12 w-full px-4 pr-12 border transition-colors ${
                  validationErrors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-lily"
                }`}
                disabled={loading || registrationSuccess}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`input rounded-lg h-12 w-full px-4 pr-12 border transition-colors ${
                  validationErrors.confirmPassword
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-lily"
                }`}
                disabled={loading || registrationSuccess}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
            className={`h-12 rounded-full font-bold text-white transition-all mt-2 ${
              loading || registrationSuccess
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-lily hover:bg-darklily hover:shadow-lg transform hover:scale-[1.02]"
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
          <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-lily hover:text-darklily font-bold underline transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;