import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../../redux/notificationSlice";
import { fetchConversations } from "../../redux/messageConversationSlice";
import toast from "react-hot-toast";
import { Bell, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationPoller() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_data } = useSelector((state) => state.auth);
  
  // Track seen IDs so we don't spam toasts for the same notifications
  const seenNotificationIds = useRef(new Set());
  const seenMessageIds = useRef(new Set());

  useEffect(() => {
    if (!user_data) return;

    const pollInterval = setInterval(async () => {
      try {
        // Poll Notifications
        const notifResult = await dispatch(fetchNotifications({ page: 1 })).unwrap();
        if (notifResult?.results) {
          notifResult.results.forEach((notif) => {
            if (!notif.read && !seenNotificationIds.current.has(notif.id)) {
              seenNotificationIds.current.add(notif.id);
              toast.custom((t) => (
                <div 
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate("/activity");
                  }}
                  className="bg-white border-l-4 border-lily rounded-xl shadow-xl p-4 flex items-start gap-3 cursor-pointer max-w-sm w-full animate-in slide-in-from-right"
                >
                  <div className="bg-lily/10 p-2 rounded-full">
                    <Bell className="w-5 h-5 text-lily" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">New Activity</p>
                    <p className="text-gray-600 text-sm mt-1">{notif.message || notif.title || "You have a new notification"}</p>
                  </div>
                </div>
              ), { duration: 5000, id: notif.id });
            }
          });
        }

        // Poll Messages (Conversations)
        const convResult = await dispatch(fetchConversations()).unwrap();
        if (convResult && Array.isArray(convResult)) {
          convResult.forEach((conv) => {
            const lastMsg = conv.last_message;
            if (lastMsg && !lastMsg.read && lastMsg.sender_id !== user_data?.id && lastMsg.sender_id !== user_data?.user?.id) {
              if (!seenMessageIds.current.has(lastMsg.id)) {
                seenMessageIds.current.add(lastMsg.id);
                toast.custom((t) => (
                  <div 
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(`/chat/${conv.id}`);
                    }}
                    className="bg-white border-l-4 border-green-500 rounded-xl shadow-xl p-4 flex items-start gap-3 cursor-pointer max-w-sm w-full animate-in slide-in-from-right"
                  >
                    <div className="bg-green-50 p-2 rounded-full">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">New Message</p>
                      <p className="text-gray-600 text-sm mt-1 truncate max-w-[200px]">
                        {lastMsg.content?.startsWith("[ORDER_PAYLOAD]") ? "Sent an order payload" : lastMsg.content}
                      </p>
                    </div>
                  </div>
                ), { duration: 5000, id: lastMsg.id });
              }
            }
          });
        }

      } catch (err) {
        // Silently handle polling errors
      }
    }, 30000); // 30 seconds instead of 30 minutes for responsiveness

    return () => clearInterval(pollInterval);
  }, [dispatch, user_data, navigate]);

  return null;
}
