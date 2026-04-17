import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Using authSlice state for consistency with Login
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email_or_phonenumber: "",
    password: "",
    confirmPassword: "", // Added from snippet 1
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect to login on successful registration
  useEffect(() => {
    if (registrationSuccess) {
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [registrationSuccess, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this specific field as user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors = {};

    // Strict Email or Phone validation
    if (!formData.email_or_phonenumber.trim()) {
      errors.email_or_phonenumber = "Phone number or email is required";
    } else {
      const isEmail = formData.email_or_phonenumber.includes("@");
      const isPhone = /^(\+234|0)[789]\d{9}$/.test(formData.email_or_phonenumber);

      if (!isEmail && !isPhone) {
        errors.email_or_phonenumber = "Please enter a valid email or Nigerian phone number";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    dispatch(
      registerUser({
        email_or_phonenumber: formData.email_or_phonenumber,
        password: formData.password,
      })
    );
  };

  // Password strength indicator logic
  const getPasswordStrength = (password) => {
    if (!password) return { text: "", color: "" };
    if (password.length < 6) return { text: "Weak", color: "text-red-500" };
    if (password.length < 10) return { text: "Medium", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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

      {/* Success/Error handled by Toasts */}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Phone or Email */}
        <div>
          <input
            type="text"
            name="email_or_phonenumber"
            value={formData.email_or_phonenumber}
            onChange={handleChange}
            placeholder="Enter email or phone number"
            disabled={loading || registrationSuccess}
            className={`input rounded-[7px] h-[46px] w-full px-4 ${
              validationErrors.email_or_phonenumber ? "border-red-500" : ""
            }`}
          />
          {validationErrors.email_or_phonenumber && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.email_or_phonenumber}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={loading || registrationSuccess}
              className={`input rounded-[7px] h-[46px] w-full px-4 pr-10 ${
                validationErrors.password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || registrationSuccess}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
          )}
          {formData.password && !validationErrors.password && (
            <p className={`text-xs mt-1 ${passwordStrength.color}`}>
              Password strength: {passwordStrength.text}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading || registrationSuccess}
              className={`input rounded-[7px] h-[46px] w-full px-4 pr-10 ${
                validationErrors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading || registrationSuccess}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.confirmPassword}
            </p>
          )}
          {formData.confirmPassword &&
            formData.password === formData.confirmPassword &&
            !validationErrors.confirmPassword && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FiCheck size={14} /> Passwords match
              </p>
            )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || registrationSuccess}
          className={`h-[46px] rounded-full font-bold text-white mt-2 ${
            loading || registrationSuccess
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "REGISTERING..." : registrationSuccess ? "SUCCESS!" : "REGISTER"}
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