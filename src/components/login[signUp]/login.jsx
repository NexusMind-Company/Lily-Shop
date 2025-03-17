import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import useAuth from "../hooks/useAuth";
import displayError from "../utils/displayError";
const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  //handle Error
  // const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error, data } = useAuth();

  const dispatch = useDispatch();
  const state = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // handleSubmitAsync()
    login(apiUrl + "/auth/token/", { username, password });
  };

  useEffect(() => {
    if (data !== null) {
      dispatch(loginSuccess({ user_data: data }));
      navigate("/");
    }
  }, [data]);

  // //handling the api for login auth
  // const handleSubmitAsync = async () => {
  //   setError(null);

  //   console.log(username, password)
  //   if (!username || !password) {
  //     console.log('all input must be filled')
  //     return
  //   }

  //   try {
  //     const request = await axios.post(apiUrl + 'auth/token/', { username, password })
  //     const response = request.data
  //     dispatch(loginSuccess({ token: response.access, username }))

  //     //after login been successful then user get redirects to the homepage
  //     navigate('/')
  //   } catch (err) {
  //     if (err.status == 401) {
  //       setError(err.response.data)
  //     } else {
  //       console.log(err)
  //     }
  //   }
  // }

  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-2 border-sun">Log</span> In
      </h2>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Username Input */}
        <input
          className="input rounded-none pt-0 h-[46px]"
          type="text"
          name="username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password Input with Toggle Icon */}
        <div className="relative">
          <input
            className="input rounded-none pt-0 h-[46px] w-full pr-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
          {displayError(error, "detail")}
        </p>
        {/* display login error */}

        {/* Login Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer"
        >
          {loading ? "Loading..." : "Log In"}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="font-inter text-xs font-medium">
        <Link to="/signup">
          Not a member yet?{" "}
          <span className="text-lily font-semibold">Create an Account</span>
        </Link>
      </div>
    </section>
  );
};

export default Login;
