import { UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const BottomNav = ({ activePage, setActivePage }) => {
  return (
    <div className="flex justify-around items-center bg-white h-15 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] shadow-inner fixed bottom-0 left-0 w-full z-50 md:flex-col md:w-24 md:h-screen md:top-0 md:pt-0 md:pb-0 md:justify-center md:gap-10 md:border-r">
      {/* Home  */}
      <Link
        to="/"
        className={`flex flex-col items-center relative ${
          activePage === "home" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("home")}
          className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2 md:static md:translate-x-0 md:transform-none"
        >
          {activePage === "home" ? (
            <img src="/icons/home-active.svg" className="h-7 w-7" />
          ) : (
            <img src="/icons/home-4.svg" className="h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6 md:mt-2">Home</span>
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
          className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2 md:static md:translate-x-0 md:transform-none"
        >
          {activePage === "create" ? (
            <img
              src="/icons/create-circle.svg"
              className=" text-lily h-7 w-7"
            />
          ) : (
            <img src="/icons/create-circle.svg" className=" h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6 md:mt-2">Create</span>
      </Link>
      {/* Food */}
      <Link
        to="/food"
        className={`flex flex-col items-center relative ${
          activePage === "food" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("food")}
          className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2 md:static md:translate-x-0 md:transform-none"
        >
          {activePage === "food" ? (
            <UtensilsCrossed className="text-lily h-7 w-7" />
          ) : (
            <UtensilsCrossed className="text-gray-600 h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6 md:mt-2">Food</span>
      </Link>
      {/* Chatroom */}
      <Link
        to="/inbox"
        className={`flex flex-col items-center relative ${
          activePage === "inbox" ? "text-lily" : "text-ash"
        }`}
      >
        <button
          onClick={() => setActivePage("inbox")}
          className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2 md:static md:translate-x-0 md:transform-none"
        >
          {activePage === "inbox" ? (
            <div className="relative">
              <img
                src="/icons/message-3-active.svg"
                className=" text-lily h-7 w-7"
              />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          ) : (
            <div className="relative">
              <img src="/icons/message-3.svg" className=" h-7 w-7" />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          )}
        </button>
        <span className="text-xs font-poppins mt-6 md:mt-2">inbox</span>
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
          className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2 md:static md:translate-x-0 md:transform-none"
        >
          {activePage === "profile" ? (
            <img src="/icons/user-active.svg" className="text-lily h-7 w-7" />
          ) : (
            <img src="/icons/user.svg" className="h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6 md:mt-2">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;
