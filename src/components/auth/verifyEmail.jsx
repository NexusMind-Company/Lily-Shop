import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail, resetVerifyEmailState } from "../../redux/verifyEmailSlice";

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
    (state) => state.verifyEmail
  );

  useEffect(() => {
    if (token) {
      console.log("🔍 Verifying token:", token);
      dispatch(verifyEmail(token))
        .unwrap()
        .then((res) => console.log("✅ Verification success:", res))
        .catch((err) => console.error("❌ Verification error:", err));
    } else {
      console.error("⚠️ No verification token found in URL");
    }

    return () => dispatch(resetVerifyEmailState());
  }, [token, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2070&auto=format&fit=crop"
            alt="Fashion Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lily/30 to-lily/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <h1 className="font-bold text-4xl uppercase tracking-wider">Lily Shops</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins leading-tight">
            Email <br /> Verification
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Just a moment while we verify your email address to secure your account.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Status */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto text-center lg:text-left">
            <div className="mb-10">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                {loading
                  ? "Verifying Email..."
                  : success
                    ? "Email Verified!"
                    : error
                      ? "Verification Failed"
                      : "Verifying Email..."}
              </h2>

              <div className={`text-sm py-2 ${success ? "text-green-600" : error ? "text-red-500" : "text-gray-500"
                }`}>
                {loading && "Please wait while we confirm your details..."}
                {error && error}
                {success && (message || "Email verified successfully!")}
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              disabled={loading}
              className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                }`}
            >
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
