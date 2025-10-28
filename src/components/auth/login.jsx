import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [values, setValues] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch login thunk
    const resultAction = await dispatch(loginUser(values));

    // If login successful
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/home");
    }
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
        <span className="border-b-[2px] border-solid pb-[2px] border-lily">
          Log
        </span>{" "}
        in
      </h2>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          name="login"
          value={values.login}
          onChange={handleChange}
          placeholder="Email, phone, or username"
          className="input rounded-[7px] h-[46px]"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="Password"
            className="input rounded-[7px] h-[46px] w-full pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs text-center mt-[-10px]">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className={`h-[46px] rounded-full font-bold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>

        {/* Forgot Password */}
        <div className="text-xs font-medium self-end">
          <Link to="/forgotPassword" className="underline">
            Forgot Password?
          </Link>
        </div>

        {/* Sign Up Prompt */}
        <div className="self-start">
          <Link to={"/signUp"}>
            <p className="text-xs font-semibold">
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
