import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
  requestPasswordReset,
  clearPasswordState,
} from "../../redux/passwordSlice";
import useFormValidation from "../../hooks/useFormValidation";
import ErrorDisplay from "../common/ErrorDisplay";

// Initial State and Rules
const INITIAL_STATE = { email: "" };
const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    patternMessage: "Invalid email address",
    requiredMessage: "Email is required"
  }
};

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { status, error: reduxError, successMessage } = useSelector((state) => state.password);

  // Use the validation hook
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleValidationSubmit,
    setErrors: setValidationErrors
  } = useFormValidation(INITIAL_STATE, VALIDATION_RULES);

  // Submission callback for the hook
  const submitCallback = (validatedValues) => {
    dispatch(requestPasswordReset(validatedValues.email));
  };

  // Effect to clear Redux state on component unmount or before navigating away
  useEffect(() => {
    // Clear state when component mounts (optional, if you want it fresh)
    // dispatch(clearPasswordState());
    return () => {
      // Clear state when component unmounts
      dispatch(clearPasswordState());
    };
  }, [dispatch]);

  // Optional: Map backend error to inline display if desired
  // useEffect(() => {
  //   if (status === 'failed' && reduxError) {
  //      // Assuming reduxError might contain specific field errors someday
  //     const backendErrors = {};
  //     if (typeof reduxError === 'string') {
  //        // If it's just a string, maybe show it as a form error or email error
  //        backendErrors.email = reduxError; // Or backendErrors.form = reduxError
  //     } else if (reduxError.email) {
  //        backendErrors.email = Array.isArray(reduxError.email) ? reduxError.email.join(', ') : reduxError.email;
  //     }
  //     setValidationErrors(backendErrors);
  //   }
  // }, [status, reduxError, setValidationErrors]);

  return (
    <section className="relative mt-28 flex flex-col gap-10 px-7 min-h-screen max-w-3xl mx-auto">
      <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Forgot <span className="text-lily">Password</span>
        </h1>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleValidationSubmit(submitCallback)} noValidate>
        <label
          className="text-center font-poppins text-[16px] pb-2 font-medium"
          htmlFor="email"
        >
          Enter Email Address
        </label>
        <div>
          <input
            name="email"
            id="email"
            className={`input pt-0 h-[46px] w-full ${errors.email ? 'border-red-500' : ''}`}
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={errors.email ? "true" : "false"}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 text-center">{errors.email}</p>}
        </div>

        <Link
          className="text-center text-sm font-medium font-inter text-ash pt-2 pb-6"
          to="/login"
        >
          Back to Sign in
        </Link>
        <button
          className="input pt-0 h-[46px] bg-sun border-none rounded-[7px] font-inter font-bold text-[15px]/[18.51px] disabled:opacity-50"
          type="submit"
          disabled={isSubmitting || status === 'loading'}
        >
          {isSubmitting || status === 'loading' ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {status === "failed" && reduxError && (
         <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-auto max-w-md">
             <ErrorDisplay message={typeof reduxError === 'string' ? reduxError : 'Failed to send reset link.'} />
         </div>
      )}
      {status === "succeeded" && successMessage && (
        <p className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg w-auto max-w-md text-center">
          {successMessage}
        </p>
      )}
    </section>
  );
};

export default ForgotPassword;
