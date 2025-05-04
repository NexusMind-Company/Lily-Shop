import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
  requestPasswordReset,
  clearPasswordState,
} from "../../redux/passwordSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { status, error, successMessage } = useSelector(
    (state) => state.password
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(requestPasswordReset(email));
  };

  const handleClearState = () => {
    dispatch(clearPasswordState());
  };

  return (
    <section className="relative mt-28 flex flex-col gap-20 px-7 min-h-screen max-w-3xl mx-auto">
      <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Forgot <span className="text-lily">Password</span>
        </h1>
      </div>

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label
          className="text-center font-poppins text-[16px] pb-4 font-medium"
          htmlFor="email"
        >
          Enter Email Address
        </label>
        <input
          name="email"
          id="email"
          className="input pt-0"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Link
          className="text-center text-sm font-medium font-inter text-ash pt-2 pb-10"
          to="/login"
          onClick={handleClearState}
        >
          Back to Sign in
        </Link>
        <button
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
          type="submit"
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>
      </form>

      {status === "failed" && (
        <p className="fixed top-14 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </p>
      )}
      {status === "succeeded" && (
        <p className="fixed top-14 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </p>
      )}
    </section>
  );
};

export default ForgotPassword;
