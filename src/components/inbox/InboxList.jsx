import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import BottomNav from "./bottomNav";

const InboxList = () => {
  const [activePage, setActivePage] = useState("inbox");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const inboxItems = [
    {
      icon: "🟢",
      title: "Activity",
      message: "See Activity on your account",
      link: "/activity",
    },
    {
      icon: "💬",
      title: "Your Messages",
      message: "Check for new messages",
      link: "/messages",
    },
    {
      icon: "📦",
      title: "Your orders",
      message: "Check your orders",
      link: "/orders",
    },
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
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.message}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  <ChevronRight className="text-gray-500 h-8 w-8" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <BottomNav activePage={activePage} />
    </div>
  );
};

export default InboxList;
