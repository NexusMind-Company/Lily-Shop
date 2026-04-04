import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Import from your api.js — adjust path if needed
import { createSubscription } from "../services/api";

const SubscriptionProcessingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const hasCalled = useRef(false);

  const planId = state?.planId;
  const plan = state?.plan;
  const vendor = state?.vendor;

  useEffect(() => {
    if (!planId || hasCalled.current) return;
    hasCalled.current = true;

    const subscribe = async () => {
      try {
        const result = await createSubscription(planId);

        // Short pause so animation doesn't flash
        await new Promise((res) => setTimeout(res, 1200));

        navigate("/subscription/success", {
          replace: true,
          state: {
            plan,
            vendor,
            subscription: result?.subscription || result,
          },
        });
      } catch (err) {
        await new Promise((res) => setTimeout(res, 800));

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Something went wrong. Please try again.";

        navigate("/subscription/payment/" + planId, {
          replace: true,
          state: {
            plan,
            vendor,
            error: message,
          },
        });
      }
    };

    subscribe();
  }, [planId, plan, vendor, navigate]);

  const dots = [0, 1, 2];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-[#f6f8f6] items-center justify-center p-6">
      {/* Animated circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8"
      >
        {/* Outer pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#13ec49]/30 -m-4"
        />
        {/* Inner circle */}
        <div className="w-24 h-24 rounded-full bg-[#13ec49]/10 flex items-center justify-center border-4 border-[#13ec49]">
          {/* Spinning arc */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-transparent border-t-[#13ec49]"
          />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-[#111813] mb-2">Processing Payment</h2>
        <p className="text-gray-500 text-sm">
          Subscribing to{" "}
          <span className="font-semibold text-[#111813]">{plan?.plan_name || "your plan"}</span>
        </p>
        {vendor?.name && (
          <p className="text-gray-400 text-sm mt-1">at {vendor.name}</p>
        )}
      </motion.div>

      {/* Animated dots */}
      <div className="flex items-center gap-2 mt-8">
        {dots.map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="w-2.5 h-2.5 rounded-full bg-[#13ec49]"
          />
        ))}
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-gray-400 mt-12 text-center px-8"
      >
        Please don't close this page. We're confirming your subscription securely.
      </motion.p>
    </div>
  );
};

export default SubscriptionProcessingPage;