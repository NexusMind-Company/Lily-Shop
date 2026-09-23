import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Gift, Loader2, ShieldAlert, Ticket } from "lucide-react";
import { api } from "../services/api";
import SEO from "../components/common/SEO";

const CouponRewardsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(location.state?.couponCode || "");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [reward, setReward] = useState(null);

  const handleVerify = async (event) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setStatus("error");
      setMessage("Enter your coupon code to continue.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setReward(null);

    try {
      const response = await api.post("/coupons/verify/", { code: normalizedCode });
      const result = response.data || {};
      const winner = result.winner ?? result.is_winner ?? result.data?.winner ?? false;

      setStatus(winner ? "winner" : "non-winner");
      setReward(result.reward || result.data?.reward || null);
      setMessage(
        result.message ||
          (winner
            ? "Congratulations! You won a reward."
            : "Oops! Try again next time."),
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "We could not verify this coupon. Please try again.",
      );
    }
  };

  const isResult = status === "winner" || status === "non-winner";

  return (
    <>
      <SEO title="Coupon Rewards - Lily Shop" description="Verify your Lily Shop food order coupon." />
      <main className="min-h-screen bg-[#fffdf3] px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
            <div className="bg-green-600 px-6 py-8 text-white sm:px-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Gift size={30} />
              </div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-green-100">
                Food order reward
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">Coupon Rewards</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-green-50">
                Enter the unique coupon from your qualifying food order for a chance to win.
                Each coupon can only be verified once.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5 p-6 sm:p-8">
              <label htmlFor="coupon-code" className="block text-sm font-bold text-gray-900">
                Coupon code
                <span className="mt-2 block text-xs font-normal text-gray-500">
                  Codes are checked securely with Lily Shop.
                </span>
              </label>
              <div className="relative">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                <input
                  id="coupon-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  autoComplete="off"
                  className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-base font-bold tracking-[0.12em] text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {status === "loading" ? "Checking coupon..." : "Verify Coupon"}
              </button>

              {message && (
                <div
                  role="status"
                  className={`rounded-xl border p-4 text-sm font-semibold ${
                    status === "winner"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : status === "non-winner"
                        ? "border-orange-200 bg-orange-50 text-orange-800"
                        : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {status === "error" ? <ShieldAlert size={20} /> : <Gift size={20} />}
                    <div>
                      <p>{message}</p>
                      {reward && <p className="mt-2 font-normal">Reward: {reward.name || reward.title || reward}</p>}
                    </div>
                  </div>
                </div>
              )}

              {!isResult && !message && (
                <p className="text-center text-xs leading-5 text-gray-500">
                  Never share your account password or payment details to verify a coupon.
                </p>
              )}
            </form>
          </section>
        </div>
      </main>
    </>
  );
};

export default CouponRewardsPage;