import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import useAuth from "../hooks/useAuth";
import useFormValidation from "../../hooks/useFormValidation";
const apiUrl = import.meta.env.VITE_API_URL;

const INITIAL_STATE = {
  username_or_email: "",
  password: "",
};

const VALIDATION_RULES = {
  username_or_email: {
    required: true,
    requiredMessage: "Username or email is required",
  },
  password: { required: true, requiredMessage: "Password is required" },
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleValidationSubmit,
    setErrors: setValidationErrors,
  } = useFormValidation(INITIAL_STATE, VALIDATION_RULES);

  const {
    login,
    loading: authLoading,
    error: authError,
    data: authData,
  } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitCallback = async (validatedValues) => {
    await login(apiUrl + "/auth/login/", validatedValues);
  };

  useEffect(() => {
    if (authData) {
      dispatch(loginSuccess({ user_data: authData }));
      navigate("/");
    }
  }, [authData, dispatch, navigate]);

  useEffect(() => {
    if (authError) {
      const backendErrors = {};
      if (authError._error) {
        backendErrors.form = authError._error;
      } else {
        backendErrors.form =
          (authError.detail ?? authError.non_field_errors?.join(", ")) ||
          undefined;
        backendErrors.username_or_email =
          authError.username_or_email?.join(", ") || undefined;
        backendErrors.password = authError.password?.join(", ") || undefined;
      }

      const filteredErrors = Object.entries(backendErrors)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredErrors).length > 0) {
        setValidationErrors(filteredErrors);
      }
    }
  }, [authError, setValidationErrors]);

  return (
    <section className="mt-28 mb-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid border-sun">Log</span> In
      </h2>

      <form
        className="flex flex-col gap-7"
        onSubmit={handleValidationSubmit(submitCallback)}
        noValidate
      >
        {errors.form && (
          <p className="text-red-500 text-sm -mb-4">{errors.form}</p>
        )}

        <div>
          <input
            className={`input rounded-[7px] pt-0 h-[46px] mt-3 w-full ${
              errors.username_or_email ? "border-red-500" : ""
            }`}
            type="text"
            name="username_or_email"
            placeholder="Username or Email"
            value={values.username_or_email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={errors.username_or_email ? "true" : "false"}
          />
          {errors.username_or_email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.username_or_email}
            </p>
          )}
        </div>

        <div className="relative">
          <div>
            <input
              className={`input rounded-[7px] pt-0 h-[46px] w-full pr-10 mt-3 ${
                errors.password ? "border-red-500" : ""
              }`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 text-gray-500 rounded-[7px]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="text-right font-inter text-xs underline font-semibold flex items-center justify-end">
          <Link to="/forgotPassword">Forgot Password?</Link>
        </div>

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer rounded-[7px] disabled:opacity-50"
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting || authLoading ? "Loading..." : "Log In"}
        </button>
      </form>

      <div className="font-inter text-sm font-medium">
        <Link to="/signup">
          Not a member yet?{" "}
          <span className="text-lily font-semibold">Create an Account</span>
        </Link>
      </div>
    </section>
  );
};

export default Login;
