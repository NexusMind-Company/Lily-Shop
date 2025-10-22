import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

// API call
const forgotPasswordApi = async ({ phone_or_email }) => {
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/auth/password-change/request/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_or_email }),
    }
  );
  if (!res.ok) throw await res.json();
  return res.json();
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [phone_or_email, setContact] = useState("");
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      navigate(
        `/reset-verify-code?contact=${encodeURIComponent(phone_or_email)}`
      );
    },
    onError: (err) => {
      setErrors({
        phone_or_email: err.phone_or_email?.[0],
        form: err.detail || "Something went wrong",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!phone_or_email) {
      setErrors({ phone_or_email: "Phone or email is required" });
      return;
    }
    mutation.mutate({ phone_or_email });
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title + subtitle */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Forgot Password?
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs px-14">
          Enter your email or phone number to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          value={phone_or_email}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
          className={`input rounded-[7px] h-[46px] ${
            errors.phone_or_email ? "border-red-500" : ""
          }`}
        />
        {errors.phone_or_email && (
          <p className="text-red-500 text-xs">{errors.phone_or_email}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isLoading}
          className={`h-[46px] rounded-full font-bold text-white ${
            mutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {mutation.isLoading ? "Sending..." : "RESET PASSWORD"}
        </button>
        {errors.form && (
          <p className="text-red-500 text-sm text-center">{errors.form}</p>
        )}
      </form>

      {/* Back to login */}
      <div className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
