import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, resetCreateUserState } from "../../redux/createUserSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
<<<<<<< HEAD
=======
import { useMutation } from "@tanstack/react-query";

// API call
const signupApi = async ({ phone_or_email, password }) => {
  const body = {
    email_or_phonenumber: phone_or_email, // <-- Renamed this key
    password: password,
  };
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/auth/users/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    throw await res.json();
  }
  return res.json();
};

// Helpers

const detectInputType = (value) => {
  if (!value) return null;
  const emailPattern = /^\S+@\S+\.\S+$/;
  const phonePattern = /^\+?\d{9,15}$/;
  if (emailPattern.test(value)) return "email";
  if (phonePattern.test(value)) return "phone";
  return "unknown";
};
>>>>>>> 8081735a6a2c0c8527a81519a350339394bce904

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.createUser);

  const [values, setValues] = useState({
    email_or_phonenumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

<<<<<<< HEAD
=======
  const mutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (_, vars) => {
      navigate(
        `/verify-email?contact=${encodeURIComponent(vars.phone_or_email)}`
      );
    },
    onError: (err) => {
      console.error("Signup Error:", err);
      setErrors({
        phone_or_email: err.email_or_phonenumber?.[0],
        password: err.password?.[0],
        form: err.detail || "Registration failed",
      });
    },
  });

>>>>>>> 8081735a6a2c0c8527a81519a350339394bce904
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { email_or_phonenumber, password } = values;
    const newErrors = {};

    if (!email_or_phonenumber)
      newErrors.email_or_phonenumber = "Phone number or email is required";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      dispatch(createUser(values));
    }
<<<<<<< HEAD
=======
    if (detectInputType(phone_or_email) === "unknown") {
      setErrors({
        phone_or_email: "Enter a valid phone number or email",
      });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }
    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    mutation.mutate(values);
>>>>>>> 8081735a6a2c0c8527a81519a350339394bce904
  };

  useEffect(() => {
    if (success) {
      dispatch(resetCreateUserState());
      navigate("/verify-email?contact=" + encodeURIComponent(values.email_or_phonenumber));
    }
  }, [success, navigate, values.email_or_phonenumber, dispatch]);

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid pb-[2px] border-lily">
          Regis
        </span>
        ter
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Phone or Email */}
        <div>
          <input
            type="text"
            name="email_or_phonenumber"
            value={values.email_or_phonenumber}
            onChange={handleChange}
            placeholder="Phone number or email"
            className={`input rounded-[7px] h-[46px] w-full ${
              errors.email_or_phonenumber ? "border-red-500" : ""
            }`}
          />
          {errors.email_or_phonenumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email_or_phonenumber}
            </p>
          )}
        </div>

        {/* Password */}
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
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`h-[46px] rounded-full font-bold text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "Registering..." : "REGISTER"}
        </button>
      </form>

      {/* Login link */}
      <div className="font-inter text-sm font-bold">
        <Link to="/login">
          Already a member?{" "}
          <span className="text-lily font-bold underline">Log In</span>
        </Link>
      </div>
    </section>
  );
};

export default SignUp;

