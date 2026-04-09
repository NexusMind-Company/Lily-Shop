import { ChevronLeft, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../redux/notificationSlice";

const getNotificationIcon = (type) => {
  if (type === "ORDER") return "📦";
  if (type === "MESSAGE") return "💬";
  if (type === "FOLLOW") return "👤";
  if (type === "SYSTEM") return "📢";
  if (type === "PRODUCT") return "🛍️";
  return "🔔";
};

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));

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

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-800">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <ChevronLeft
            size={22}
            onClick={() => navigate(-1)}
            className="mr-3 cursor-pointer"
          />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <button
          onClick={() => dispatch(markAllNotificationsRead())}
          className="flex items-center gap-1 text-xs font-semibold text-lily transition-opacity hover:opacity-80"
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      <div className="flex gap-2 border-t border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-lily text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            filter === "unread"
              ? "bg-lily text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Unread
        </button>
      </div>

      <div className="space-y-2 px-2 py-2">
        {loading && notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <span className="text-2xl">🔔</span>
            </div>
            <p>No notifications yet</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex cursor-pointer items-start rounded-xl border p-3 transition-colors ${
                notification.read
                  ? "border-gray-100 bg-white"
                  : "border-lily/20 bg-purple-50"
              }`}
            >
              {notification.sender_profile_pic ? (
                <img
                  src={notification.sender_profile_pic}
                  alt={notification.sender_name || "Sender"}
                  className="mr-3 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${
                    notification.type === "ORDER"
                      ? "bg-orange-100 text-orange-600"
                      : notification.type === "MESSAGE"
                        ? "bg-blue-100 text-blue-600"
                        : notification.type === "FOLLOW"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
              )}

              <div className="flex-1">
                {notification.sender_name && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {notification.sender_name}
                  </p>
                )}
                <p
                  className={`mb-1 text-sm leading-snug ${
                    !notification.read
                      ? "font-semibold text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {notification.message}
                </p>
                <p className="text-[10px] text-gray-500">
                  {getTimeAgo(notification.created_at)}
                </p>
              </div>

              {!notification.read && (
                <div className="ml-2 mt-2 h-2 w-2 rounded-full bg-lily"></div>
              )}
            </div>
          ))
        )}
      </div>

      {loading && notifications.length > 0 && (
        <div className="py-4 text-center text-xs text-gray-400">Updating...</div>
      )}
    </div>
  );
};

export default Notifications;
