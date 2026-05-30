import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  verifyEmail,
  resetVerifyEmailState,
} from "../../redux/verifyEmailSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Extract token from query or path
  const params = new URLSearchParams(location.search);
  let token = params.get("token");

  if (!token) {
    const parts = location.pathname.split("/");
    token = parts[parts.length - 1];
  }

  const { loading, success, error, message } = useSelector(
    (state) => state.verifyEmail,
  );

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token));
    }
    return () => dispatch(resetVerifyEmailState());
  }, [token, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message || "Email verified successfully!");
      const timer = setTimeout(() => navigate("/login"), 2500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <section className="mt-15 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px] mt-20">
        <span className="border-b-2 border-solid pb-0.5 border-lily">Veri</span>
        fying Email
      </h2>

      <div className="flex flex-col gap-6">
        <p className="text-sm font-medium text-ash">
          {loading
            ? "Please wait while we verify your email address..."
            : success
              ? "Your email has been successfully verified! You can now log in to your account."
              : error
                ? "There was an error verifying your email. The link might be expired or invalid."
                : "Initializing verification..."}
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate("/login")}
          disabled={loading}
          className={`h-11.5 rounded-full font-bold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "VERIFYING..." : "BACK TO LOGIN"}
        </button>
      </div>

      {/* Back to login */}
      <div className="self-start mt-4">
        <Link to="/login" className="flex items-center gap-2">
          <img src="/arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default VerifyEmail;
