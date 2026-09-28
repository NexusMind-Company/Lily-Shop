import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Mail,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  RotateCcw,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../services/api";

const COOLDOWN_SECONDS = 60;

const PREVIEW_FEATURES = [
  {
    icon: ShoppingBag,
    title: "Authentic Nigerian Creators",
    description: "Discover fashion, handcrafted goods, and lifestyle essentials from local brands.",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  {
    icon: UtensilsCrossed,
    title: "Fresh Kitchens & Meal Plans",
    description: "Subscribe to weekly or monthly chef-cooked meal deliveries from top vendors.",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  {
    icon: Sparkles,
    title: "Social Shopping & Feed",
    description: "Turn every scroll into a purchase with seamless checkout and verified tracking.",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
];

const VerificationSentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const emailProvider = useMemo(() => {
    if (!email) return null;
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (domain === "gmail.com" || domain === "googlemail.com") {
      return {
        name: "Gmail",
        url: "https://mail.google.com",
      };
    }
    if (domain === "yahoo.com" || domain === "ymail.com" || domain === "myyahoo.com") {
      return {
        name: "Yahoo Mail",
        url: "https://mail.yahoo.com",
      };
    }
    if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com") {
      return {
        name: "Outlook",
        url: "https://outlook.live.com",
      };
    }
    return {
      name: "Email App",
      url: "mailto:",
    };
  }, [email]);

  const handleOpenEmailApp = () => {
    if (emailProvider?.url) {
      if (emailProvider.url.startsWith("http")) {
        window.open(emailProvider.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = emailProvider.url;
      }
    }
  };

  const handleResend = async () => {
    if (!email || isResending || cooldownSeconds > 0) return;
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification-email/", { email });
      toast.success("Verification email resent! Please check your inbox or spam folder.");
      setCooldownSeconds(COOLDOWN_SECONDS);
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.message ||
        (status === 500
          ? "The verification service is temporarily unavailable. Please try again shortly."
          : "Could not resend verification email. Please check the address or try again.");
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const isResendDisabled = isResending || cooldownSeconds > 0;

  return (
    <section className="min-h-screen flex flex-col bg-slate-50/70 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-xs">
        <div className="max-w-md md:max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-block">
            <h1 className="font-poppins font-black text-2xl text-lily uppercase tracking-tight">
              Lily Shops
            </h1>
          </Link>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Step 1 of 2
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="size-20 rounded-full bg-lily/10 border-2 border-lily/20 flex items-center justify-center shadow-xs">
                <Mail className="size-9 text-lily" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-500" />
              </div>
            </div>

            <div>
              <h2 className="font-poppins font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Check Your Inbox 🎉
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                We sent a verification link to activate your LilyShop account.
              </p>
            </div>
          </div>

          {/* Unified Lily Email Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-5">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sent to
              </span>
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold max-w-full">
                  <Mail size={14} className="text-lily shrink-0" />
                  <span className="truncate">{email || "your registered email"}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-slate-600 leading-relaxed">
              Click the link inside the email to confirm your account and begin exploring creators and meal plans.
            </p>

            {/* Spam helper notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                Can&apos;t find the email? Please check your <strong className="text-slate-800">Spam</strong> or{" "}
                <strong className="text-slate-800">Promotions</strong> folder.
              </span>
            </div>

            {/* Resend Action */}
            <div className="text-center pt-1 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className="inline-flex items-center gap-1 text-lily hover:text-darklily font-bold underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {isResending && <RotateCcw size={12} className="animate-spin" />}
                  <span>
                    {isResending
                      ? "Sending email..."
                      : cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : "Resend verification email"}
                  </span>
                </button>
              </p>
            </div>
          </div>

          {/* Interactive Preview Card: What's Waiting For You */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-sm text-slate-900">
                  What&apos;s waiting for you
                </h3>
                <p className="text-[11px] text-slate-400">
                  Up next once your email is confirmed
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                Preview
              </span>
            </div>

            <div className="space-y-3">
              {PREVIEW_FEATURES.map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center shrink-0 border ${feature.badgeBg}`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        {feature.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleOpenEmailApp}
              className="w-full h-12 rounded-full font-bold text-white bg-lily hover:bg-darklily transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
            >
              <Mail size={17} />
              <span>{emailProvider ? `Open ${emailProvider.name}` : "Open Email App"}</span>
              <ExternalLink size={14} className="opacity-80" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full h-12 rounded-full font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Proceed to Log In</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100 bg-white text-center">
        <div className="flex justify-center gap-4 text-xs font-medium text-ash">
          <Link to="/about" className="hover:text-lily transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link to="/about" className="hover:text-lily transition-colors">
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </section>
  );
};

export default VerificationSentPage;
