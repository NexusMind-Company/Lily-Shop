import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

// API call
const sendVerificationApi = async (contact) => {
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/auth/verify-email/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    }
  );
  if (!res.ok) throw await res.json();
  return res.json();
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const contact = params.get("contact") || "example@email.com";

  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => sendVerificationApi(contact),
    onSuccess: (data) => {
      setMessage(data.message || "Code sent successfully!");
    },
    onError: (err) => {
      setMessage(err.detail || "Failed to send code");
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, [contact]);

  const handleContinue = () => {
    navigate(`/verify-code?contact=${encodeURIComponent(contact)}`);
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title + subtitle */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Verification
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs">
          We sent a verification code to{" "}
          <span className="text-black">{contact}</span>
        </p>
      </div>

      {/* Status */}
      {message && (
        <p className="text-center text-sm text-gray-600">{message}</p>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        className="pt-0 h-[46px] bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
      >
        ENTER CODE
      </button>

      {/* Back to login */}
      <button className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </button>
    </section>
  );
};

export default VerifyEmail;
