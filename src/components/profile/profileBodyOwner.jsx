import { useState } from "react";
import ProfileShops from "./profileShops";
import ProfilePosts from "./profilePosts";
import ProfileFavorite from "./profileFavorite";
// Profile Body Component
const ProfileBodyOwner = () => {
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
        <img
          src={activeIcon === "eyeHeart" ? "./black-eye-heart.svg": "./eye-heart.svg"}
          alt="eye heart icon"
          className={`w-8 h-8 cursor-pointer ${
            activeIcon === "eyeHeart" ? "border-b-2 border-b-black text-black" : "border-b-0"
          }`}
          onClick={() => setActiveIcon("eyeHeart")}
        />
      </div>
      <div>
        {activeIcon === "mingcute" && <ProfilePosts />}
        {activeIcon === "shop" && <ProfileShops />}
        {activeIcon === "eyeHeart" && <ProfileFavorite />}
      </div>
    </div>
  );
};

export default ProfileBodyOwner;
