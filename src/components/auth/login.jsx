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
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
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
            Manage Your <br /> Virtual Store
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Log in to manage your products, track orders, and reach customers worldwide with Lily Shop.
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

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Page Title */}
            <div className="mb-10">
              <h2 className="font-poppins font-bold text-black text-3xl mb-2">
                <span className="border-b-[4px] border-solid pb-1 border-lily">
                  Wel
                </span>
                come Back
              </h2>
              <p className="text-gray-500 mt-2">Login to continue to Lily Shops</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md">
                <p className="font-medium">✓ Login successful!</p>
                <p className="text-sm">Redirecting you to homepage...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md">
                <p className="font-medium">✗ Login Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email/Username/Phone Input */}
              <div className="space-y-2">
                <label
                  htmlFor="login"
                  className="block text-sm font-medium text-gray-700"
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
                  className={`input w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                    }`}
                  required
                  disabled={loading}
                />
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
                    placeholder="Enter your password"
                    className={`input w-full px-4 py-3 pr-12 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${error
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                      }`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgotPassword"
                  className="text-sm font-medium text-lily hover:text-darklily hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || showSuccess}
                className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 mt-2 ${loading || showSuccess
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
                    Logging in...
                  </span>
                ) : showSuccess ? (
                  "Success! Redirecting..."
                ) : (
                  "LOG IN"
                )}
              </button>

              {/* Sign Up Prompt */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-lily font-bold hover:text-darklily hover:underline transition-colors ml-1"
                  >
                    Sign Up
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

export default Login;