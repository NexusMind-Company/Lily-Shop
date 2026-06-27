import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    login: localStorage.getItem("remember_login") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("remember_me") === "true",
  );

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.login.trim() || !formData.password.trim()) {
      return;
    }

    const resultAction = await dispatch(
      loginUser({ ...formData, remember_me: rememberMe }),
    );

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Login successful!");

      if (rememberMe) {
        localStorage.setItem("remember_login", formData.login);
        localStorage.setItem("remember_me", "true");
      } else {
        localStorage.removeItem("remember_login");
        localStorage.removeItem("remember_me");
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else if (loginUser.rejected.match(resultAction)) {
      const errMsg =
        resultAction.payload || "Login failed. Please check your credentials.";
      toast.error(errMsg);
    }
  };

  return (
    <section className="min-h-screen mx-auto relative pb-20 flex flex-col max-w-500">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <div className="max-w-3xl mx-auto w-full">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-7 px-7 max-w-3xl mx-auto w-full mt-24">
        {/* Page Title */}
        <h2 className="font-poppins font-bold text-black text-xl/[30px]">
          <span className="border-b-2 border-solid pb-0.5 border-lily">
            Log
          </span>
          in
        </h2>

        {/* Success/Error messages handled by Toasts */}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Email"
            className="input rounded-[7px] h-11.5"
            required
            disabled={loading} // Added disabled state for robustness
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input rounded-[7px] h-11.5 w-full pr-10"
              required
              disabled={loading} // Added disabled state for robustness
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 accent-lily cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium cursor-pointer"
            >
              Remember Me
            </label>
          </div>

          {/* Login Button UI from snippet 2, logic from snippet 1 */}
          <button
            type="submit"
            disabled={loading || showSuccess}
            className={`h-11.5 rounded-full font-bold text-white transition-all ${
              loading || showSuccess
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-lily hover:bg-darklily"
            }`}
          >
            {loading ? "LOGGING IN..." : showSuccess ? "SUCCESS!" : "LOG IN"}
          </button>

          {/* Forgot Password */}
          <div className="text-sm font-medium self-end">
            <Link
              to="/forgot-password"
              title="Forgot Password?"
              className="underline"
            >
              Forgot Password?
            </Link>
          </div>

        {/* Sign Up Prompt */}
        <div className="self-start">
          <Link to="/signUp">
            <p className="text-sm font-semibold">
              Not a member yet?{" "}
              <span className="text-lily underline">Create an Account</span>
            </p>
          </Link>
        </div>
      </form>
    </div>

    {/* Localized Footer */}
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
    </section>
  );
};

export default Login;
