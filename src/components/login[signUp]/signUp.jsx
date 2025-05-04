/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import useAuth from "../hooks/useAuth";
import displayError from "../utils/displayError";

const apiUrl = import.meta.env.VITE_API_URL;

const formatPhone = (num) => {
  const split = num.toString().split("");
  split.shift();
  split.unshift("+234");
  return split.join("");
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const isAuth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { signup, loading, error, data } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    signup(apiUrl + "/auth/users", {
      username,
      phone_number: formatPhone(phoneNumber),
      password,
      email,
    });
  };

  useEffect(() => {
    if (data !== null) {
      dispatch(loginSuccess({ user_data: data }));
      navigate("/");
    }
  }, [data]);

  return (
    <section className="mt-28 mb-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid border-sun">Regis</span>ter
      </h2>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="flex flex-col">
          <input
            className="input rounded-[7px] pt-0 h-[46px] mt-3"
            type="text"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-[#ff2b2b] font-bold">
            {displayError(error, "email")}
          </p>
        </div>

        {/* Username Input */}
        <div className="flex flex-col">
          <input
            className="input rounded-[7px] pt-0 h-[46px] mt-3"
            type="text"
            name="username"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-[#ff2b2b] font-bold">
            {displayError(error, "username")}
          </p>
        </div>

        {/* Phone Number Input */}
        <div className="flex flex-col">
          <input
            className="input rounded-[7px] pt-0 h-[46px] mt-3"
            type="number"
            name="number"
            placeholder="Phone Number"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-[#ff2b2b] font-bold">
            {displayError(error, "phone_number")}
          </p>
        </div>

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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* General Error Message */}
        <p className="text-[#ff2b2b] font-bold">
          {displayError(error, "others")}
        </p>

        {/* Register Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer"
        >
          {loading ? "Loading ..." : "Register"}
        </button>
      </form>

      {/* Login Link */}
      <div className="font-inter text-sm font-medium">
        <Link to="/login">
          Already a member?{" "}
          <span className="text-lily font-semibold">Log In</span>
        </Link>
      </div>
    </section>
  );
};

export default SignUp;
