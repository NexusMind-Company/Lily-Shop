import { UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const BottomNav = ({ activePage }) => {
  return (
    <div className="flex md:hidden justify-around items-center bg-white h-15 pt-2 shadow-inner fixed bottom-0 left-0 w-full z-50">
      {/* Home  */}
      <Link
        to="/"
        className={`flex flex-col items-center relative ${activePage === "home" ? "text-lily" : "text-ash"}`}
      >
        <button className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2">
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
        className={`flex flex-col items-center relative ${activePage === "create" ? "text-lily" : "text-ash"}`}
      >
        <button className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2">
          {activePage === "create" ? (
            <img src="/icons/create-circle.svg" className="text-lily h-7 w-7" />
          ) : (
            <img src="/icons/create-circle.svg" className="h-7 w-7" />
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

      {/* Food */}
      <Link
        to="/food"
        className={`flex flex-col items-center relative ${activePage === "food" ? "text-lily" : "text-ash"}`}
      >
        <button className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2">
          {activePage === "food" ? (
            <UtensilsCrossed className="text-lily h-7 w-7" />
          ) : (
            <UtensilsCrossed className="text-gray-600 h-7 w-7" />
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Food</span>
      </Link>

      {/* Chatroom */}
      <Link
        to="/inbox"
        className={`flex flex-col items-center relative ${activePage === "inbox" ? "text-lily" : "text-ash"}`}
      >
        <button className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2">
          {activePage === "inbox" ? (
            <div className="relative">
              <img
                src="/icons/message-3-active.svg"
                className="text-lily h-7 w-7"
              />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          ) : (
            <div className="relative">
              <img src="/icons/message-3.svg" className="h-7 w-7" />
              <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 right-0"></div>
            </div>
          )}
        </button>
        <span className="text-xs font-poppins mt-6">Inbox</span>
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className={`flex flex-col items-center relative ${activePage === "profile" ? "text-lily" : "text-ash"}`}
      >
        <button className="grid place-items-center size-10 absolute -top-3 transform -translate-x-1/2 left-1/2">
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
