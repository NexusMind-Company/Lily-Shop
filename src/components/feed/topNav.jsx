import React from "react";
import { BsBroadcast, BsSearch } from "react-icons/bs";

const TopNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center justify-between w-full h-16 px-4 bg-transparent fixed top-0 left-0 z-50">
      <div className="pl-2">
        <BsBroadcast className="size-7" />
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => setActiveTab("nearMe")}
          className={`font-normal font-poppins ${
            activeTab === "nearMe" ? "text-green-600" : "text-ash"
          }`}
        >
          <span
            className={`${activeTab === "nearMe" ? "pb-1 border-b-2 " : ""}`}
          >
            Near
          </span>{" "}
          Me
        </button>
        <button
          onClick={() => setActiveTab("forYou")}
          className={`font-semibold font-poppins ${
            activeTab === "forYou" ? "text-green-600" : "text-ash"
          }`}
        >
          <span
            className={`${activeTab === "forYou" ? "pb-1 border-b-2 " : ""}`}
          >
            For Y
          </span>
          ou
        </button>
      </div>
      <div className="pr-2">
        <BsSearch className="size-7" />
      </div>
    </div>
  );
};

export default TopNav;
