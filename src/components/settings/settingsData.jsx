import { User, Bell, MessageCircle, Wallet } from "lucide-react";

export const settingsData = [
  {
    id: 1,
    title: "Account",
    description: "See information about account",
    icon: <User className="text-blue-500" size={32} />,
  },
  {
    id: 2,
    title: "Notifications",
    description: "View all notifications",
    icon: <Bell className="text-yellow-500" size={32} />,
    badgeCount: 3,
  },
  {
    id: 3,
    title: "Messages",
    description: "Check out your messages",
    icon: <MessageCircle className="text-green-500" size={32} />,
    badgeCount: 1,
  },
  {
    id: 4,
    title: "Wallet",
    description: "Manage your wallet and payments",
    icon: <Wallet className="text-purple-500" size={32} />,
  },
];