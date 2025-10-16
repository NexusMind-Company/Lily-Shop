import { Link } from "react-router-dom";
import { MessageSquareText, House, Store, CirclePlus, User } from "lucide-react";

const BottomNav = ({ activePage, setActivePage }) => {
  return (
    <div className="flex items-center fixed bottom-0 h-16 bg-main left-0 w-full z-50">
      <div className="flex items-center justify-around w-lg mx-auto sm:w-4xl">
        {/* Home  */}
        <Link
          to="/feed"
          className={`flex flex-col items-center relative ${
            activePage === "home" ? "text-lily" : "text-ash"
          }`}
        >
          <button
            onClick={() => setActivePage("home")}
            className="grid place-items-center size-7"
          >
            <img
              src={
                activePage === "home"
                  ? "./icons/home-active.svg"
                  : "./icons/home-4.svg"
              }
              alt=""
              className="size-7"
            />
          </button>
          <span className="text-xs font-poppins">Home</span>
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
            className="grid place-items-center size-7"
          >
            <img
              src={
                activePage === "shop"
                  ? "./icons/shop-active.svg"
                  : "./icons/shop.svg"
              }
              alt=""
              className="size-7"
            />
          </button>
          <span className="text-xs font-poppins">Shops</span>
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
            className="grid place-items-center size-7"
          >
            <img
              src={
                activePage === "create"
                  ? "./icons/create-circle-active.svg"
                  : "./icons/create-circle.svg"
              }
              alt=""
              className="size-7"
            />
          </button>
          <span className="text-xs font-poppins">Create</span>
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
            className="grid place-items-center size-7"
          >
            <img
              src={
                activePage === "chat"
                  ? "./chat-icon-active.svg"
                  : "./icons/message-3.svg"
              }
              alt=""
              className="size-7"
            />
          </button>
          <span className="text-xs font-poppins">Chatroom</span>
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
            className="grid place-items-center size-7"
          >
            <img
              src={
                activePage === "profile"
                  ? "./home-icon-active.svg"
                  : "./icons/user.svg"
              }
              alt=""
              className="size-7"
            />
          </button>
          <span className="text-xs font-poppins">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
