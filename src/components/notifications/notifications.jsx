import { ChevronLeft, CheckCheck, BellRing, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../redux/notificationSlice";
import usePushNotifications from "../../hooks/usePushNotifications";

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(
    (state) => state.notifications,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { notificationPermission, requestPushPermission, isRegistering } =
    usePushNotifications(isAuthenticated);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));

    // Polling every 30 seconds for new notifications
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ page: 1 }));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleEnablePush = async () => {
    await requestPushPermission();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <ChevronLeft
            size={22}
            onClick={() => navigate(-1)}
            className="mr-3 cursor-pointer"
          />
          <h2 className="font-semibold text-lg">Notifications</h2>
        </div>
        <button
          onClick={() => dispatch(markAllNotificationsRead())}
          className="text-xs font-semibold text-lily flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {/* Push Notification Permission Banner */}
      {notificationPermission !== "granted" && (
        <div className="mx-3 mt-3 p-3.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-lily/10 text-lily flex items-center justify-center shrink-0 mt-0.5">
              {notificationPermission === "denied" ? (
                <AlertCircle size={20} className="text-amber-500" />
              ) : (
                <BellRing size={20} className="text-lily" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {notificationPermission === "denied"
                  ? "Push Notifications Blocked"
                  : "Enable Push Notifications"}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {notificationPermission === "denied"
                  ? "Notifications are blocked in your browser settings. Enable them in site settings to receive instant order and message alerts."
                  : "Get real-time alerts for instant orders, messages, and wallet updates even when the app is closed."}
              </p>
              {notificationPermission !== "denied" && (
                <button
                  onClick={handleEnablePush}
                  disabled={isRegistering}
                  className="mt-2.5 px-3.5 py-1.5 bg-lily text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-lily/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Enabling...
                    </>
                  ) : (
                    <>
                      <BellRing size={14} /> Enable Notifications
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex px-4 py-3 gap-2 bg-white border-t border-gray-100 mt-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-lily text-white" : "bg-gray-100 text-gray-600"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "unread" ? "bg-lily text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Unread
        </button>
      </div>

      {/* List */}
      <div className="px-2 py-2 space-y-2">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🔔</span>
            </div>
            <p>No notifications yet</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-3 rounded-xl border flex items-start cursor-pointer transition-colors ${
                notification.read
                  ? "bg-white border-gray-100"
                  : "bg-purple-50 border-lily/20"
              }`}
            >
              {/* Icon based on type */}
              <div
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center mr-3 text-lg
                    ${
                      notification.type === "ORDER"
                        ? "bg-orange-100 text-orange-600"
                        : notification.type === "MESSAGE"
                          ? "bg-blue-100 text-blue-600"
                          : notification.type === "FOLLOW"
                            ? "bg-pink-100 text-pink-600"
                            : "bg-gray-100 text-gray-600"
                    }
                `}
              >
                {notification.type === "ORDER" && "📦"}
                {notification.type === "MESSAGE" && "💬"}
                {notification.type === "FOLLOW" && "👤"}
                {notification.type === "SYSTEM" && "📢"}
                {notification.type === "PRODUCT" && "🛍️"}
                {!["ORDER", "MESSAGE", "FOLLOW", "SYSTEM", "PRODUCT"].includes(
                  notification.type,
                ) && "🔔"}
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm leading-snug mb-1 ${!notification.read ? "font-semibold text-gray-900" : "text-gray-700"}`}
                >
                  {notification.message}
                </p>
                <p className="text-[10px] text-gray-500">
                  {getTimeAgo(notification.created_at)}
                </p>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-lily rounded-full mt-2 ml-2"></div>
              )}
            </div>
          ))
        )}
      </div>

      {loading && notifications.length > 0 && (
        <div className="text-center py-4 text-xs text-gray-400">
          Updating...
        </div>
      )}
    </div>
  );
};

export default Notifications;
