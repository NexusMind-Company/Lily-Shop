import { useState } from "react";
import { Link } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-2 border-sun">Regis</span>ter
      </h2>

      <form className="flex flex-col gap-5">
        {/* Email Input */}
        <input
          className="input rounded-none pt-0 h-[46px]"
          type="text"
          name="email"
          placeholder="Phone or email"
        />

        {/* Password Input with Toggle Icon */}
        <div className="relative -z-10">
          <input
            className="input rounded-none pt-0 h-[46px] w-full pr-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
        >
          Register
        </button>
      </form>

      {/* Login Link */}
      <Link to="/login" className="font-inter text-xs font-medium">
        Already a member? <span className="text-lily font-semibold">Log In</span>
      </Link>
    </section>
  );
};

export default SignUp;
