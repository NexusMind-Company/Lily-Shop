/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import useAuth from "../hooks/useAuth";
import useFormValidation from "../../hooks/useFormValidation";

const apiUrl = import.meta.env.VITE_API_URL;

const formatPhone = (num) => {
  if (!num || typeof num !== 'string' || num.length < 10) return num;
  const cleaned = num.startsWith('+234') ? num.substring(4) : num.startsWith('0') ? num.substring(1) : num;
  if (/^\d{10}$/.test(cleaned)) {
      return "+234" + cleaned;
  }
  return num;
};

const INITIAL_STATE = {
  email: "",
  username: "",
  phone_number: "",
  password: "",
};

const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    patternMessage: "Invalid email address",
    requiredMessage: "Email is required"
  },
  username: {
     required: true,
     minLength: 3,
     minLengthMessage: "Username must be at least 3 characters",
     requiredMessage: "Username is required"
  },
  phone_number: {
    required: true,
    pattern: /^(0\d{10}|\+234\d{10})$/,
    patternMessage: "Invalid phone number format (e.g., 080xxxxxxxx or +23480xxxxxxxx)",
    requiredMessage: "Phone number is required"
  },
  password: {
    required: true,
    minLength: 6,
    minLengthMessage: "Password must be at least 6 characters",
    requiredMessage: "Password is required"
  },
};

const originalValidate = VALIDATION_RULES.validate;
VALIDATION_RULES.validate = (fieldValues) => {
  const tempErrors = {};
   for (const field in VALIDATION_RULES) {
     if (field === 'validate') continue;
     const rules = VALIDATION_RULES[field];
     const value = fieldValues[field];
     if (rules.required && !value) {
       tempErrors[field] = rules.requiredMessage || 'This field is required';
       continue;
     }
      if (rules.pattern && value && !rules.pattern.test(value)) {
        tempErrors[field] = rules.patternMessage || 'Invalid format';
        continue;
      }
      if (rules.minLength && value && value.length < rules.minLength) {
         tempErrors[field] = rules.minLengthMessage || `Minimum length is ${rules.minLength}`;
         continue;
       }
     if (rules.matches && value !== fieldValues[rules.matches]) {
       tempErrors[field] = rules.matchesMessage || 'Fields do not match';
     }
   }
   return tempErrors;
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleValidationSubmit,
    setErrors: setValidationErrors
  } = useFormValidation(INITIAL_STATE, VALIDATION_RULES);

  const { signup, loading: authLoading, error: authError, data: authData } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitCallback = async (validatedValues) => {
    const payload = {
      ...validatedValues,
      phone_number: formatPhone(validatedValues.phone_number)
    };
    await signup(apiUrl + "/auth/users", payload);
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
         backendErrors.form = (authError.detail ?? authError.non_field_errors?.join(', ')) || undefined;
         backendErrors.email = authError.email?.join(', ') || undefined;
         backendErrors.username = authError.username?.join(', ') || undefined;
         backendErrors.phone_number = authError.phone_number?.join(', ') || undefined;
         backendErrors.password = authError.password?.join(', ') || undefined;
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
        <span className="border-b-[2px] border-solid border-sun">Regis</span>ter
      </h2>

      <form className="flex flex-col gap-7" onSubmit={handleValidationSubmit(submitCallback)} noValidate>
        {errors.form && <p className="text-red-500 text-sm -mb-4">{errors.form}</p>}

        <div>
          <input
            className={`input rounded-[7px] pt-0 h-[46px] mt-3 w-full ${errors.email ? 'border-red-500' : ''}`}
            type="email"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <input
            className={`input rounded-[7px] pt-0 h-[46px] mt-3 w-full ${errors.username ? 'border-red-500' : ''}`}
            type="text"
            name="username"
            placeholder="Username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={errors.username ? "true" : "false"}
          />
           {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>

        <div>
          <input
            className={`input rounded-[7px] pt-0 h-[46px] mt-3 w-full ${errors.phone_number ? 'border-red-500' : ''}`}
            type="tel"
            name="phone_number"
            placeholder="Phone Number (e.g., 080...)"
            value={values.phone_number}
            onChange={handleChange}
            onBlur={handleBlur}
             aria-invalid={errors.phone_number ? "true" : "false"}
          />
           {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
        </div>

        <div className="relative">
           <div>
             <input
              className={`input rounded-[7px] pt-0 h-[46px] w-full pr-10 mt-3 ${errors.password ? 'border-red-500' : ''}`}
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
               aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
           {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer disabled:opacity-50"
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting || authLoading ? "Loading ..." : "Register"}
        </button>
      </form>

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
