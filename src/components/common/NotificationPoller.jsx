import { useEffect, useRef, useState } from "react";
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
  
  const [instantOrders, setInstantOrders] = useState([]);
  const alarmAudio = useRef(null);

  useEffect(() => {
    if (!alarmAudio.current) {
      alarmAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      alarmAudio.current.loop = true;
    }
  }, []);

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
              
              if (notif.type === 'INSTANT_ORDER') {
                setInstantOrders((prev) => [...prev, notif]);
                // Try to play alarm
                if (alarmAudio.current) {
                  alarmAudio.current.play().catch(e => console.log("Audio autoplay blocked", e));
                }
              } else {
                toast.custom((t) => (
                  <div 
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(notif.url || "/activity");
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
    }, 15000); // 15 seconds for faster responsiveness

    return () => clearInterval(pollInterval);
  }, [dispatch, user_data, navigate]);

  if (instantOrders.length > 0) {
    const currentOrder = instantOrders[0];
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md animate-pulse shadow-[0_0_50px_rgba(34,197,94,0.5)]">
          <div className="flex flex-col items-center text-center">
             <div className="bg-red-100 text-red-600 p-6 rounded-full mb-6">
                <Bell size={64} className="animate-bounce" />
             </div>
             <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Incoming Order!</h2>
             <p className="text-gray-600 text-lg mb-8 font-medium">{currentOrder.message}</p>
             <button
               onClick={() => {
                  if (alarmAudio.current) alarmAudio.current.pause();
                  const remaining = [...instantOrders];
                  remaining.shift();
                  setInstantOrders(remaining);
                  if (remaining.length === 0 && alarmAudio.current) {
                     alarmAudio.current.currentTime = 0;
                  }
                  navigate(currentOrder.url || "/vendor/dashboard/orders");
               }}
               className="w-full bg-lily text-white font-bold py-5 rounded-2xl text-xl hover:bg-lily-dark transition-colors shadow-lg active:scale-95"
             >
               Acknowledge & View Order
             </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
