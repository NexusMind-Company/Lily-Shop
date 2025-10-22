import { useNavigate } from "react-router-dom";
import {  User, Bell, Info, LogOut, Wallet, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {

   const navigate = useNavigate();

  const items = [
    { icon: <User size={30} />, text: "Account", sub: "See information about your account", to: "/account" },
    { icon: <Wallet size={30} />, text: "Wallet", sub: "Manage your wallet and payments", to: "/wallet" },
    { icon: <Bell size={30} />, text: "Notifications", sub: "Manage notifications", to: "/notifications" },
    { icon: <Info size={30} />, text: "About us", sub: "Learn more about us", to: "/about" },
    { icon: <LogOut size={30} />, text: "Logout", sub: "Logout of your account" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => {navigate(-1)}}><ChevronLeft size={30} className="mr-3" /></button>
        <h2 className="font-semibold text-lg flex-1 text-center">Settings</h2>
      </div>

      <div className="mt-4">
        {items.map((item, i) => (
          <Link
            to={item.to || "#"}
            key={i}
            className="flex px-4 py-4 items-center"
          >
            <div className=" mr-3">{item.icon}</div>
            <div className="flex-1">
              <p className="pb-1">{item.text}</p>
              <p className="">{item.sub}</p>
            </div>

            <ChevronRight size={30} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Settings;
