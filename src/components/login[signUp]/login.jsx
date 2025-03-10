import { useState } from "react";
import { Link } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const Login = () => {
  const URL = 'https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/swagger/'

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();

    handleSubmitAsync(username, password)

  }

  const handleSubmitAsync = async (user, pass) => {

    if (!user || !pass) {
      console.log('all input must be filled')
      return
    }

    try {
      const request = await axios.post(URL + 'token', { user, password })
      const response = request.data
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <section className="mt-10 flex flex-col gap-7 px-7">
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
        <Link
          to="/forgot-password"
          className="text-right font-inter text-xs underline font-semibold"
        >
          Forgot Password?
        </Link>

        {/* Login Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
        >
          Log In
        </button>
      </form>

      {/* Sign Up Link */}
      <Link to="/signup" className="font-inter text-xs font-medium">
        Not a member yet? Create an Account
      </Link>
    </section>
  );
};

export default Login;
