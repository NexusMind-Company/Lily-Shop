import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear error when component unmounts or user starts typing
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.login.trim()) {
      return;
    }
    if (!formData.password.trim()) {
      return;
    }

    // Dispatch login
    const resultAction = await dispatch(loginUser(formData));

    // Check if login was successful
    if (loginUser.fulfilled.match(resultAction)) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  return (
    <section className="flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-md z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Content */}
      <div className="mt-24">
        {/* Page Title */}
        <h2 className="font-poppins font-bold text-black text-2xl mb-2">
          <span className="border-b-[3px] border-solid pb-1 border-lily">
            Wel
          </span>
          come Back
        </h2>
        <p className="text-gray-600 mb-6">Login to continue to Lily Shops</p>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fade-in">
            <p className="font-medium">✓ Login successful!</p>
            <p className="text-sm">Redirecting you to homepage...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
            <p className="font-medium">✗ Login Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email/Username/Phone Input */}
          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email, Username or Phone Number
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Enter your email, username or phone"
              className={`input rounded-lg h-12 w-full px-4 border transition-colors ${
                error
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-lily"
              }`}
              required
              disabled={loading}
            />
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
                placeholder="Enter your password"
                className={`input rounded-lg h-12 w-full px-4 pr-12 border transition-colors ${
                  error
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-lily"
                }`}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || showSuccess}
            className={`h-12 rounded-full font-bold text-white transition-all mt-2 ${
              loading || showSuccess
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
                Logging in...
              </span>
            ) : showSuccess ? (
              "Success! Redirecting..."
            ) : (
              "LOG IN"
            )}
          </button>

          {/* Forgot Password */}
          <div className="text-sm font-medium self-end">
            <Link
              to="/forgotPassword"
              className="text-lily hover:text-darklily underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign Up Prompt */}
          <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-lily hover:text-darklily font-bold underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;