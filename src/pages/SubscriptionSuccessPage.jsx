
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  ChefHat,
  ArrowRight,
  Home,
  Shield,
  Repeat,
} from "lucide-react";
import {
  resolveSubscriptionSuccessState,
  saveSubscriptionSuccessState,
} from "../utils/subscriptionFlow";

const formatPrice = (price) =>
  Number(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Simple confetti using canvas
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#13ec49", "#111813", "#ffd700", "#ff6b6b", "#4ecdc4", "#a8edea"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.speed;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const stop = setTimeout(() => cancelAnimationFrame(animId), 4000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(stop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.7 }}
    />
  );
};

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const successState = resolveSubscriptionSuccessState(state);

  const plan = successState?.plan;
  const vendor = successState?.vendor;
  const subscription = successState?.subscription;

  useEffect(() => {
    if (successState) {
      saveSubscriptionSuccessState(successState);
    }
  }, [successState]);

  // Fallbacks if navigated directly (no state)
  const planName = plan?.plan_name || subscription?.plan?.plan_name || "Your Plan";
  const vendorName = vendor?.name || subscription?.vendor?.name || "the vendor";
  const amountPaid = plan?.price || subscription?.plan?.price || 0;
  const frequency = plan?.frequency || subscription?.plan?.frequency || "weekly";
  const nextPayment =
    subscription?.next_payment_date
      ? new Date(subscription.next_payment_date).toLocaleDateString("en-NG", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "Based on your billing cycle";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-[#f6f8f6]">
      <Confetti />

      <div className="flex-1 flex flex-col items-center p-6 pt-16 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center"
        >
          {/* Success Icon */}
          <motion.div
            variants={itemVariants}
            className="relative mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-[#13ec49]/10 flex items-center justify-center border-4 border-[#13ec49]"
            >
              <CheckCircle size={48} className="text-[#13ec49]" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#111813] mb-2">
              You're Subscribed! 🎉
            </h1>
            <p className="text-gray-500 text-base">
              Welcome to <span className="font-semibold text-[#111813]">{vendorName}</span>
            </p>
          </motion.div>

          {/* Details Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 w-full shadow-sm mb-4"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#13ec49]/10 flex items-center justify-center">
                <ChefHat size={20} className="text-[#13ec49]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active plan</p>
                <p className="font-bold text-[#111813]">{planName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Amount paid</span>
                <span className="font-bold text-[#111813]">₦{formatPrice(amountPaid)}</span>
              </div>
              
              {successState?.deliveryType === "pickup" && successState?.pickupCode && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 text-center space-y-2 my-2">
                  <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">Your Pickup Code</p>
                  <p className="text-3xl font-black text-[#111813] dark:text-white tracking-[0.2em]">{successState.pickupCode}</p>
                  <p className="text-[10px] text-orange-500 font-medium italic">Show this at the restaurant to collect your food</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Repeat size={14} /> Billing
                </span>
                <span className="font-semibold text-[#111813] capitalize">{frequency}</span>
              </div>
              {successState?.preferredTime && (
                <div className="flex items-center justify-between">
                   <span className="text-gray-500 text-sm">Preferred Time</span>
                   <span className="font-semibold text-[#111813] text-sm">{successState.preferredTime} daily</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar size={14} /> Next renewal
                </span>
                <span className="font-semibold text-[#111813] text-sm text-right max-w-[55%]">
                  {nextPayment}
                </span>
              </div>
            </div>
          </motion.div>

          {/* What happens next */}
          <motion.div
            variants={itemVariants}
            className="bg-[#13ec49]/5 border border-[#13ec49]/20 rounded-2xl p-4 w-full mb-6"
          >
            <p className="text-sm font-semibold text-[#111813] mb-2">What happens next?</p>
            <ul className="space-y-1.5">
              {[
                "Your subscription is now active",
                "The vendor will prepare your meals",
                "You'll receive deliveries based on your plan",
                "Manage or cancel anytime in My Subscriptions",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-[#13ec49] mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTAs */}
      <div className="bg-white border-t border-gray-100 p-4 space-y-3 relative z-20">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/subscriptions")}
          className="w-full bg-[#13ec49] text-[#111813] font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2"
        >
          View My Subscriptions
          <ArrowRight size={18} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full bg-white text-gray-600 font-semibold py-3 rounded-2xl text-sm border border-gray-200 flex items-center justify-center gap-2"
        >
          <Home size={16} />
          Back to Home
        </motion.button>

        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
          <Shield size={12} /> Secured by Lily Payments
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
