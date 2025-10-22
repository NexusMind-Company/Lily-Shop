import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import BottomNav from "./bottomNav";
import { useNavigate } from "react-router";

/* eslint-disable react/prop-types */
const messages = [
  {
    id: 1,
    name: "JACOB’S FROSTY",
    lastMessage: "You should see the bike man soon",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 2,
    name: "Customer 1",
    lastMessage: "Hello, I'm still waiting on my order",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 3,
    name: "ELITE CLIPPER’S",
    lastMessage: "An appointment will be made for 7pm",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 4,
    name: "JACOB’S FROSTY",
    lastMessage: "Okay",
    time: "7:00 pm",
    unread: false,
  },
];

export default function MessagesList({ openChat }) {
    const [activePage, setActivePage] = useState("inbox");
const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="relative p-4 ">
        <Link onClick={() => {navigate(-1)}}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-[20px] font-semibold text-center">Messages</h1>
      </header>

      {/* Search bar */}
      <section className="p-4">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 pl-5  border-2 rounded-full hover:border-lily outline-none"
      />
      </section>

      <section className="p-4" >
        <div className="space-y-6">
          {messages.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between cursor-pointer w-full"
              onClick={() => openChat(chat)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-400"></div>
                <div>
                  <h3 className="font-semibold">{chat.name}</h3>
                  <p className="text-ash text-sm">{chat.lastMessage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-ash text-sm">{chat.time}</p>
                {chat.unread && <span className="text-red-500 text-xs">🔴</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}
