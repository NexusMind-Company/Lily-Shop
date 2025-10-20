import { Link } from "react-router";
import { ChevronLeft, Heart, UserPlus, MessageCircle, ShoppingBag, Megaphone } from "lucide-react";
import { useState } from "react";
import BottomNav from "./bottomNav";

const Activity = () => {
  const activities = [
    {
      icon: <Heart className="text-red-500 w-5 h-5" />,
      text: "Dayo Adeyemo and 3 others liked your post",
      time: "5m",
    },
    {
      icon: <UserPlus className="text-blue-500 w-5 h-5" />,
      text: "Chioma Uguchukwu and 4 others followed you",
      time: "20m",
    },
    {
      icon: <MessageCircle className="text-lily w-5 h-5" />,
      text: "Dayo Adeyemo mentioned you in a post",
      time: "20h",
    },
    {
      icon: <ShoppingBag className="text-gray-500 w-5 h-5" />,
      text: "Aisha Badiru ordered your product 'Black Abaya'",
      time: "3d",
    },
    {
      icon: <ShoppingBag className="text-gray-500 w-5 h-5" />,
      text: "Seun Badejo ordered your promoted product '6inches strawberry cake'",
      time: "3d",
    },
    {
      icon: <Megaphone className="text-yellow-500 w-5 h-5" />,
      text: "Dayo Adeyemo and 3 others promoted your post",
      time: "6d",
    },
    {
      icon: <MessageCircle className="text-lily w-5 h-5" />,
      text: "Nate Emerson and 2 others commented on your post",
      time: "4/10/25",
    },
  ];

  const [activePage, setActivePage] = useState("inbox");

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="flex items-center justify-center p-4  relative">
        <Link to="/inbox" className="absolute left-4 top-4">
          <ChevronLeft className="w-8 h-8 text-gray-700" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Activity</h1>
      </header>

      {/* Activity List */}
      <section className="flex-1 overflow-y-auto p-4 space-y-4">
        {activities.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            {/* Avatar / Icon */}
            <div className="w-10 h-10 bg-opacity-10 rounded-full flex items-center justify-center">
              {item.icon}
            </div>

            {/* Text */}
            <div className="flex items-center">
              <div>
                <div className="flex gap-2">
                  <div className="bg-gray-500 h-10 w-10 rounded-full "></div>
                  <div className="bg-gray-500 h-10 w-10 rounded-full "></div>
                </div>
                <p className="text-black text-sm leading-snug">
                  {item.text} <span className="text-xs text-gray-700 mt-1">- {item.time}</span>
                </p>
              </div>
              <div className="bg-gray-500 h-20 w-20 rounded-lg"></div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Navigation */}
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Activity;
