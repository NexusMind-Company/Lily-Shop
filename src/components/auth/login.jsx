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
      toast.success("Login successful!");
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else if (loginUser.rejected.match(resultAction)) {
      toast.error(resultAction.payload || "Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
        <span className="border-b-2 border-solid pb-0.5 border-lily">Log</span>
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
          <Link to="/forgotPassword" className="underline">
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
    </section>
  );
};

export default Login;
