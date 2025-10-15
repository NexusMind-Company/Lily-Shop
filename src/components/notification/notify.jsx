import { Bell, MessageCircle, Tag } from "lucide-react";
import { mockNotifications } from "./mockData";

const getIcon = (type) => {
  switch (type) {
    case "order":
      return <Tag className="text-blue-500" size={28} />;
    case "message":
      return <MessageCircle className="text-green-500" size={28} />;
    case "promo":
      return <Bell className="text-yellow-500" size={28} />;
    default:
      return <Bell className="text-gray-400" size={28} />;
  }
};

const Notify = () => {
  return (
    <section className="mt-14 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="w-full ">
        <div className="rounded-2xl border-[1px] border-solid border-black  h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Notifications</h1>
        </div>
      </div>

      {/* Notifications Content */}
      <div className="w-full flex flex-col gap-4 mt-6">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl  text-black shadow border`}
          >
            <div className="flex-shrink-0">{getIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="font-bold text-lg">{notif.title}</div>
              <div className="text-sm">{notif.message}</div>
              <div className="text-xs opacity-70 mt-1">{notif.time}</div>
            </div>
            {!notif.read && (
              <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 text-xs text-white rounded-full flex items-center justify-center font-bold">
                !
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Notify;
// filepath: c:\Users\HP\Desktop\Lily shops\Lily-Shop\src\components\notification\notify.jsx