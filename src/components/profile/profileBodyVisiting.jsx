import { useState } from "react";
import ProfileShops from "./profileShops";
import ProfilePosts from "./profilePosts";

// Profile Body Component
const ProfileBodyVisiting = () => {
  const [activeIcon, setActiveIcon] = useState("mingcute");

  return (
    <div className="w-full h-[70%]">
      <div className="flex justify-between border-b-2 border-b-gray-400 px-3">
        <img
          src={activeIcon==="mingcute" ? "./mingcute black.svg" : "./mingcute.svg"}
          alt="mingcute icon"
          className={`w-8 h-8 cursor-pointer ${
            activeIcon === "mingcute" ? "border-b-2 border-b-black text-black" : "border-b-0"
          }`}
          onClick={() => setActiveIcon("mingcute")}
        />
        <img
          src={activeIcon === "shop" ? "./shop black.svg": "./shop.svg"}
          alt="shop icon"
          className={`w-8 h-8 cursor-pointer ${
            activeIcon === "shop" ? "border-b-2 border-b-black text-black" : "border-b-0"
          }`}
          onClick={() => setActiveIcon("shop")}
        />
      </div>
      <div>
        {activeIcon === "mingcute" ? <ProfilePosts /> : <ProfileShops />}
      </div>
    </div>
  );
};

export default ProfileBodyVisiting;
