import { useState } from "react";
import BottomNav from "./bottomNav";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
const InboxList = () => {
  const [activePage, setActivePage] = useState("inbox");

  const inboxItems = [
    {
      icon: "🟢",
      title: "Activity",
      message: "Precious liked your post",
      link: "/activity",
      ChevronRight,
    },
    {
      icon: "💬",
      title: "Your Messages",
      message: "You recieved a new message",
      link: "/messages",
      ChevronRight,
    },
    {
      icon: "📦",
      title: "Your orders",
      message: "iPhone 17 #LS-YYYYMMDD-XXXXX",
      link: "/orders",
      ChevronRight,
    },
    {
      icon: "🌸",
      title: "Bloom Threads",
      message: "Order no: #LS-YYYYMMDD-XXXXX",
      time: "12:24PM",
    },
    {
      icon: "🌸",
      title: "Bloom Threads",
      message: "Order no: #LS-YYYYMMDD-XXXXX",
      time: "10:24PM",
    },
    {
      icon: "🛍️",
      title: "Jayo Accessories",
      message: "You can come for pickup between 8...",
      time: "09:36PM",
      unread: 2,
    },
    { icon: "🌸", title: "Bloom Threads", message: "Shared a post", time: "yesterday" },
  ];

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="relative p-4 ">
        <h1 className="text-[20px] font-semibold text-center">Inbox</h1>
      </header>

      <section className="p-4">
        <div>
          {inboxItems.map((item, index) => (
            <Link to={item.link} key={index}>
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.message}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  {item.time && <p>{item.time}</p>}
                  {item.unread && (
                    <span className="bg-lily text-white rounded-full px-2 py-0.5 text-[10px]">
                      {item.unread}
                    </span>
                  )}
                  {item.ChevronRight && <ChevronRight className="text-gray-500 h-8 w-8" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default InboxList;
