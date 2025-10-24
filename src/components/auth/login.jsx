import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";

// API call
const loginApi = async ({ phone_or_email, password }) => {
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/auth/login/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_or_email, password }),
    }
  );
  if (!res.ok) throw await res.json();
  return res.json();
};

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ phone_or_email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: () => navigate("/dashboard"),
    onError: (err) => {
      setErrors({
        phone_or_email: err.phone_or_email?.[0],
        password: err.password?.[0],
        form: err.detail || "Login failed",
      });
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!values.phone_or_email) {
      setErrors({ phone_or_email: "Phone or email is required" });
      return;
    }
    if (!values.password) {
      setErrors({ password: "Password is required" });
      return;
    }
    mutation.mutate(values);
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid pb-[2px] border-lily">
          Log
        </span>{" "}
        in
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          name="phone_or_email"
          value={values.phone_or_email}
          onChange={handleChange}
          placeholder="Phone or email"
          className={`input rounded-[7px] h-[46px] ${
            errors.phone_or_email ? "border-red-500" : ""
          }`}
        />
        {errors.phone_or_email && (
          <p className="text-red-500 text-xs">{errors.phone_or_email}</p>
        )}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password}</p>
        )}

        <div className="text-xs font-medium self-end">
          <Link to="/forgotPassword" className="underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className={`h-[46px] rounded-full font-bold text-white ${
            mutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {mutation.isLoading ? "LOGGING IN..." : "LOG IN"}
        </button>
        {errors.form && (
          <p className="text-red-500 text-sm text-center">{errors.form}</p>
        )}
      </form>

      <div className="self-start">
        <Link to={"/signUp"}>
          <p className="text-xs font-semibold">
            Not a member yet?{" "}
            <span className="text-lily underline">Create an Account</span>
          </p>
        </Link>
      </div>
    </section>
  );
};

export default Login;
