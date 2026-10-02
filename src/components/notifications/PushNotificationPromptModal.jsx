import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { BellRing, X, Check, Loader2, Volume2, ShieldCheck } from "lucide-react";
import { usePushNotifications } from "../../hooks/usePushNotifications";

const PROMPT_DISMISS_KEY = "lily_notification_prompt_dismissed_at";
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const PushNotificationPromptModal = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notificationPermission, requestPushPermission, isRegistering } =
    usePushNotifications(isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      return;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Only prompt if browser permission is 'default' (not yet granted or denied)
    if (Notification.permission !== "default") {
      setIsOpen(false);
      return;
    }

    const lastDismissedAt = localStorage.getItem(PROMPT_DISMISS_KEY);
    if (lastDismissedAt) {
      const timeSinceDismiss = Date.now() - parseInt(lastDismissedAt, 10);
      if (timeSinceDismiss < DISMISS_COOLDOWN_MS) {
        return;
      }
    }

    // Delay slightly after mount/login for a smoother UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, notificationPermission]);

  const handleEnable = useCallback(async () => {
    const isGranted = await requestPushPermission();
    if (isGranted) {
      setIsOpen(false);
    }
  }, [requestPushPermission]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(PROMPT_DISMISS_KEY, Date.now().toString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  const isVendor = Boolean(user?.is_vendor);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header & Icon */}
        <div className="pt-7 px-6 pb-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <BellRing size={32} className="animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            {isVendor ? "Never Miss a New Order" : "Enable Instant Alerts"}
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {isVendor
              ? "Get loud instant audio notifications and live updates whenever a customer places an order or sends a message."
              : "Stay up-to-date with real-time order tracking, chat messages, and wallet activity even when LilyShop is closed."}
          </p>
        </div>

        {/* Value Points */}
        <div className="px-6 py-3 bg-gray-50/70 border-y border-gray-100 space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Volume2 size={13} />
            </div>
            <span>
              {isVendor
                ? "Loud kitchen ringtone for incoming instant orders"
                : "Real-time order delivery updates and tracking"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Check size={13} />
            </div>
            <span>Instant chat and direct buyer-seller messages</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={13} />
            </div>
            <span>Secure payments, wallet top-ups & payout alerts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col gap-2.5">
          <button
            onClick={handleEnable}
            disabled={isRegistering}
            className="w-full py-3 px-4 bg-lily hover:bg-lily/90 text-white font-semibold text-sm rounded-xl shadow-md shadow-lily/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isRegistering ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enabling Notifications...
              </>
            ) : (
              <>
                <BellRing size={16} />
                Enable Push Notifications
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            disabled={isRegistering}
            className="w-full py-2.5 px-4 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPromptModal;
