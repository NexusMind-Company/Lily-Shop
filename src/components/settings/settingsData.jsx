import { User, Bell, MessageCircle, Wallet, LogOut, Users } from "lucide-react";
import About from "../about/About";

export const settingsData = [
  {
    id: 1,
    title: "Account",
    description: "See information about account",
    icon: <User className="text-black" size={32} />,
  },
  {
    id: 2,
    title: "Notifications",
    description: "View all notifications",
    icon: <Bell className="text-black" size={32} />,
    badgeCount: 3,
  },
  {
    id: 3,
    title: "Messages",
    description: "Check out your messages",
    icon: <MessageCircle className="text-black" size={32} />,
    badgeCount: 1,
  },
  {
    id: 4,
    title: "Wallet",
    description: "Manage your wallet and payments",
    icon: <Wallet className="text-black" size={32} />,
  },
  {
    id: 5,
    title: "About",
    description: "Learn more about us",
    icon: <Users className="text-black" size={32} />,
    component: About 
  },
  {
    id: 6,
    title: "Logout",
    description: "Log out of your account",
    icon: <LogOut className="text-black" size={32} />,
  },
];