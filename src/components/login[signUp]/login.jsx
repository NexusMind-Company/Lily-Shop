import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import useAuth from "../hooks/useAuth";
import displayError from "../utils/displayError";
const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error, data } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { username_or_email: username, password };

    login(apiUrl + "/auth/login/", payload);
  };

  useEffect(() => {
    if (data !== null) {
      dispatch(loginSuccess({ user_data: data }));
      navigate("/");
    }
  }, [data]);

  return (
    <section className="my-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid border-sun">Log</span> In
      </h2>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
        {/* Username or Email Input */}
        <input
          className="input rounded-[7px] pt-0 h-[46px] mt-3"
          type="text"
          name="username"
          placeholder="Username or Email"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password Input with Toggle Icon */}
        <div className="relative">
          <input
            className="input rounded-[7px] pt-0 h-[46px] w-full pr-10 mt-3"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 text-gray-500 rounded-[7px]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right font-inter text-xs underline font-semibold flex items-center justify-end">
          <Link to="/forgotPassword">Forgot Password?</Link>
        </div>
        <p className="text-[#ff2b2b] font-bold lg:-mt-7">
          {displayError(error, "detail") ||
            displayError(error, "non_field_errors")}
        </p>

        {/* Login Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer rounded-[7px]"
        >
          {loading ? "Loading..." : "Log In"}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="font-inter text-sm font-medium">
        <Link to="/signup">
          Not a member yet?{" "}
          <span className="text-lily font-semibold">Create an Account</span>
        </Link>
      </div>

      <p className="text-[#ff2b2b] font-bold lg:-mt-7">
        {displayError(error, "username_or_email") ||
          displayError(error, "password") ||
          displayError(error, "detail") ||
          displayError(error, "non_field_errors")}
      </p>
    </section>
  );
};

export default Login;
