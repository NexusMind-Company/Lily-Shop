import React from "react";
import { Link } from "react-router-dom";

const BottomNav = ({ activePage, setActivePage }) => {
  return (
    <div className="flex justify-around items-center bg-[#FFFAE7] h-12 shadow-inner fixed bottom-0 left-0 w-full z-50">
      {/* Home  */}
      <Link
        to="/feed"
        className={`flex flex-col items-center relative ${
          activePage === "home" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("home")}
          className={`${
            activePage === "home"
              ? "grid place-items-center bg-lily size-10 rounded-full absolute -top-7 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          <img
            src={
              activePage === "home"
                ? "./home-icon-active.svg"
                : "./home-icon.svg"
            }
            alt=""
            className="size-7"
          />
        </button>
        <span className="text-xs font-poppins mt-5">Home</span>
      </Link>
      {/* Shops */}
      <Link
        to="/shop"
        className={`flex flex-col items-center relative ${
          activePage === "shop" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("shop")}
          className={`${
            activePage === "shop"
              ? "grid place-items-center bg-lily size-10 rounded-full absolute -top-7 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          <img
            src={activePage === "shop" ? "./shop-active.svg" : "./shop.svg"}
            alt=""
            className="size-7"
          />
        </button>
        <span className="text-xs font-poppins mt-5">Shops</span>
      </Link>
      {/* Create */}
      <Link
        to="/create"
        className={`flex flex-col items-center relative ${
          activePage === "create" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("create")}
          className={`${
            activePage === "create"
              ? "grid place-items-center bg-lily size-10 rounded-full absolute -top-7 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          <img
            src={
              activePage === "create"
                ? "./create-icon-active.svg"
                : "./create-icon.svg"
            }
            alt=""
            className="size-7"
          />
        </button>
        <span className="text-xs font-poppins mt-5">Create</span>
      </Link>
      {/* Chatroom */}
      <Link
        to="/chat"
        className={`flex flex-col items-center relative ${
          activePage === "chat" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("chat")}
          className={`${
            activePage === "chat"
              ? "grid place-items-center bg-lily size-10 rounded-full absolute -top-7 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          <img
            src={
              activePage === "chat"
                ? "./chat-icon-active.svg"
                : "./chat-icon.svg"
            }
            alt=""
            className="size-7"
          />
        </button>
        <span className="text-xs font-poppins mt-5">Chatroom</span>
      </Link>
      {/* Profile */}
      <Link
        to="/profile"
        className={`flex flex-col items-center relative ${
          activePage === "profile" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("profile")}
          className={`${
            activePage === "profile"
              ? "grid place-items-center bg-lily size-10 rounded-full absolute -top-7 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          <img
            src={
              activePage === "profile"
                ? "./home-icon-active.svg"
                : "./nav-profile-icon.svg"
            }
            alt=""
            className="size-7"
          />
        </button>
        <span className="text-xs font-poppins mt-5">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;
