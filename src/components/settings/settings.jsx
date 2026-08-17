import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Info,
  LogOut,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogout } from "../../redux/authSlice"; // ✅ import logout handler

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogoutClick = () => {
    dispatch(handleLogout()); // clear tokens, user data, profile, etc.
    navigate("/login", { replace: true }); // redirect to login page
  };

  const items = [
    {
      icon: <User size={30} />,
      text: "Account",
      sub: "See information about your account",
      to: "/account",
    },
    {
      icon: <Wallet size={30} />,
      text: "Wallet",
      sub: "Manage your wallet and payments",
      to: "/wallet",
    },
    {
      icon: <Sparkles size={30} className="text-black" />,
      text: "Content Interests",
      sub: "Personalize your For You TikTok-style feed topics",
      to: "/settings/interests",
    },
    {
      icon: <Bell size={30} />,
      text: "Notifications",
      sub: "Manage notifications",
      to: "/notifications",
    },
    {
      icon: <Utensils size={30} />,
      text: "Food vendor",
      sub: "Become a food vendor and start selling your meals",
      to: "/create-vendor",
    },
    {
      icon: <Info size={30} />,
      text: "About us",
      sub: "Learn more about us",
      to: "/about",
    },
    {
      icon: <LogOut size={30} className="text-red-600" />,
      text: "Logout",
      sub: "Logout of your account",
      action: handleLogoutClick,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={30} className="mr-3" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center">Settings</h2>
      </div>

      <div className="mt-4">
        {items.map((item, i) => {
          const isLogout = item.text === "Logout";
          const Wrapper = isLogout ? "button" : Link;

          return (
            <Wrapper
              key={i}
              type={isLogout ? "button" : undefined}
              to={!isLogout ? item.to : undefined}
              onClick={isLogout ? item.action : undefined}
              className="flex w-full text-left px-4 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="mr-3">{item.icon}</div>
              <div className="flex-1">
                <p className={`pb-1 font-medium ${isLogout ? "text-red-600" : ""}`}>
                  {item.text}
                </p>
                <p className="text-sm text-gray-500">{item.sub}</p>
              </div>
              <ChevronRight size={30} className={isLogout ? "text-red-600" : ""} />
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
