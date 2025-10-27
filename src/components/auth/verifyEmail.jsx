import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail, resetVerifyEmailState } from "../../redux/verifyEmailSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const dispatch = useDispatch();
  const { loading, success, error, message } = useSelector(
    (state) => state.verifyEmail
  );

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token));
    }

    return () => dispatch(resetVerifyEmailState());
  }, [token, dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [success, navigate]);

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Verifying Email...
        </h2>
        {loading && <p className="text-gray-600 text-sm">Please wait...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm">{message || "Email verified!"}</p>
        )}
      </div>

      <button
        onClick={() => navigate("/login")}
        className="h-[46px] bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
      >
        BACK TO LOGIN
      </button>
    </section>
  );
};

export default VerifyEmail;
