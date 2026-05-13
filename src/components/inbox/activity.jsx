import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  UserPlus,
  MessageCircle,
  ShoppingBag,
  Megaphone,
  Bell,
  Package,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../redux/notificationSlice";
import BottomNav from "./bottomNav";

// Map notification types to icons
const iconMap = {
  FOLLOW: <UserPlus className="text-blue-500 w-5 h-5" />,
  PRODUCT: <ShoppingBag className="text-lily w-5 h-5" />,
  CONTENT: <Heart className="text-red-500 w-5 h-5" />,
  SYSTEM: <Bell className="text-gray-500 w-5 h-5" />,
  ORDER: <Package className="text-orange-500 w-5 h-5" />,
  MESSAGE: <MessageCircle className="text-green-500 w-5 h-5" />,
  VERIFICATION: <CheckCircle className="text-blue-500 w-5 h-5" />,
  // Lowercase fallbacks
  like: <Heart className="text-red-500 w-5 h-5" />,
  follow: <UserPlus className="text-blue-500 w-5 h-5" />,
  comment: <MessageCircle className="text-green-500 w-5 h-5" />,
  order: <ShoppingBag className="text-gray-500 w-5 h-5" />,
  promotion: <Megaphone className="text-yellow-500 w-5 h-5" />,
};

// Format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const Activity = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error, next, unreadCount } = useSelector(
    (state) => state.notifications,
  );
  const [activePage, setActivePage] = useState("inbox");
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (next && !loadingMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      dispatch(fetchNotifications({ page: nextPage })).finally(() => {
        setCurrentPage(nextPage);
        setLoadingMore(false);
      });
    }
  }, [next, loadingMore, currentPage, dispatch]);

  // Mark all as read
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  // Navigate to notification link and mark as read
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Link to="/inbox" className="mr-3">
            <ChevronLeft className="w-7 h-7 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Activity</h1>
          {unreadCount > 0 && (
            <span className="ml-2 bg-lily text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-lily font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
      </header>

      {/* Loading State */}
      <section className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-8 h-8 border-2 border-lily border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500">Loading activity...</p>
          </div>
        )}

        {/* Error State */}
        {error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-600">
              No notifications yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              When you get notifications, they'll show up here.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-600">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">
              No new activity to show.
            </p>
          </div>
        )}

        {/* Notifications List */}
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNotificationClick(item)}
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              item.read
                ? "bg-white hover:bg-gray-50"
                : "bg-lily/5 hover:bg-lily/10 border-l-4 border-lily"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                item.read ? "bg-gray-100" : "bg-lily/20"
              }`}
            >
              {iconMap[item.type] || <Bell className="text-gray-400 w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-snug ${
                  item.read ? "text-gray-600" : "text-gray-800 font-medium"
                }`}
              >
                {item.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimeAgo(item.created_at)}
              </p>
            </div>

            {/* Unread indicator */}
            {!item.read && (
              <div className="w-2 h-2 bg-lily rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>
        ))}

        {/* Load More Button */}
        {next && !loading && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-3 text-center text-lily font-medium hover:bg-lily/5 rounded-lg transition-colors"
          >
            {loadingMore ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-lily border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Activity;
