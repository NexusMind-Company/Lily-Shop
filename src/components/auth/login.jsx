import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import Button from "../common/Button";
import Card from "../common/Card";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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

    if (error) {
      dispatch(clearError());
    }
  };

  // 7. Robust handleSubmit with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation to prevent empty space submission
    if (!formData.login.trim() || !formData.password.trim()) {
      return;
    }

    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500); // Faster redirect from snippet 1
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-lily-50 via-white to-purple-50 dark:from-background-dark dark:via-surface-dark dark:to-background-dark transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-center mb-8"
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-lily flex items-center justify-center shadow-lg shadow-lily/30 group-hover:shadow-lily/50 transition-shadow">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="font-bold text-3xl text-lily uppercase tracking-wide">Lily Shops</h1>
        </Link>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" padding="xl" radius="2xl" className="backdrop-blur-sm bg-white/80 dark:bg-surface-dark/80">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-text-main-dark mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 dark:text-text-secondary-dark">
              Sign in to continue shopping
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Login successful! Redirecting...</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-text-secondary-dark ml-1">
                Email or Username
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-text-main-dark placeholder:text-gray-400 focus:border-lily focus:ring-2 focus:ring-lily/20 outline-none transition-all"
                required
                disabled={loading || showSuccess}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-text-secondary-dark ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-text-main-dark placeholder:text-gray-400 focus:border-lily focus:ring-2 focus:ring-lily/20 outline-none transition-all pr-12"
                  required
                  disabled={loading || showSuccess}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || showSuccess}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgotPassword"
                className="text-sm font-medium text-lily hover:text-lily-dark transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              isDisabled={showSuccess}
              className="mt-2"
            >
              {showSuccess ? "Welcome!" : "Sign In"}
            </Button>

            {/* Sign Up Prompt */}
            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-text-secondary-dark">
                Not a member yet?{" "}
                <Link
                  to="/signUp"
                  className="font-semibold text-lily hover:text-lily-dark transition-colors"
                >
                  Create an Account
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-lily transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
      </motion.div>
    </section>
  );
};

export default Login;
