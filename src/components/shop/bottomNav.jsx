import { Link } from "react-router-dom";
import {
  MessageSquareText,
  House,
  Store,
  CirclePlus,
  User,
} from "lucide-react";

const BottomNav = ({ activePage, setActivePage }) => {
  return (
    <div className="flex justify-around items-center bg-white h-15 pt-2 shadow-inner fixed bottom-0 left-0 w-full z-50">
      {/* Home  */}
      <Link
        to="/"
        className={`flex flex-col items-center relative ${
          activePage === "home" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("home")}
          className={`${
            activePage === "home"
              ? "grid place-items-center size-10 rounded-full absolute -top-2.5 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          {activePage === "home" ? (
            <img src="/icons/home-active.svg" className="h-7 w-7" />
          ) : (
            <img src="/icons/home-4.svg" className="h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Home</span>
      </Link>
      {/* Shops */}
      <Link
        to="/shops"
        className={`flex flex-col items-center relative ${
          activePage === "shops" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("shops")}
          className={`${
            activePage === "shops"
              ? "grid place-items-center size-10 rounded-full absolute -top-2.5 transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          {activePage === "shops" ? (
            <img src="/icons/shop-active.svg" className="h-7 w-7" />
          ) : (
            <img src="/icons/shop.svg" className="h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Shops</span>
      </Link>
      {/* Create */}
      <Link
        to="/createContent"
        className={`flex flex-col items-center relative ${
          activePage === "create" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("create")}
          className={`${
            activePage === "create"
              ? "grid place-items-center size-10 rounded-full absolute transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          {activePage === "create" ? (
            <CirclePlus className=" text-lily h-7 w-7" />
          ) : (
            <CirclePlus className=" h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Create</span>
      </Link>
      {/* Chatroom */}
      <Link
        to="/inbox"
        className={`flex flex-col items-center relative ${
          activePage === "" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("inbox")}
          className={`${
            activePage === "inbox"
              ? "grid place-items-cente size-10 rounded-full absolute transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          {activePage === "inbox" ? (
            <div className="relative">
              <MessageSquareText className=" text-lily h-7 w-7" />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          ) : (
            <div className="relative">
              <MessageSquareText className=" h-7 w-7" />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          )}
        </button>
        <span className="text-xs font-poppins mt-6">inbox</span>
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
              ? "grid place-items-center size-10 rounded-full absolute transform -translate-x-1/2 left-1/2"
              : "grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2"
          }`}
        >
          {activePage === "profile" ? (
            <User className="text-lily h-7 w-7" />
          ) : (
            <User className="h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;
