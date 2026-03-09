import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Calendar,
  Clock,
  PauseCircle,
  Wallet,
  PlusCircle,
  MessageCircle,
  Megaphone,
  Star,
  TrendingDown,
  BarChart2,
  ChevronLeft,
  Menu,
  X,
  Bell,
} from "lucide-react";
import PropTypes from "prop-types";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/vendor/dashboard" },
  { icon: ShoppingBag, label: "Orders", path: "/vendor/dashboard/orders" },
  { icon: Users, label: "Subscriptions", path: "/vendor/dashboard/subscriptions" },
  { icon: UtensilsCrossed, label: "Menu", path: "/vendor/dashboard/menu" },
  { icon: Calendar, label: "Availability", path: "/vendor/dashboard/availability" },
  { icon: Clock, label: "Cut-off Times", path: "/vendor/dashboard/cutoff" },
  { icon: PauseCircle, label: "Pause Shop", path: "/vendor/dashboard/pause" },
  { icon: Wallet, label: "Earnings", path: "/vendor/dashboard/earnings" },
  { icon: PlusCircle, label: "Add-ons", path: "/vendor/dashboard/addons" },
  { icon: MessageCircle, label: "Messages", path: "/vendor/dashboard/messages" },
  { icon: Megaphone, label: "Broadcast", path: "/vendor/dashboard/broadcast" },
  { icon: Star, label: "Ratings", path: "/vendor/dashboard/ratings" },
  { icon: TrendingDown, label: "Churn", path: "/vendor/dashboard/churn" },
  { icon: BarChart2, label: "Analytics", path: "/vendor/dashboard/analytics" },
];

const VendorLayout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative w-full max-w-md bg-[#f6f8f6] dark:bg-background-dark min-h-screen flex flex-col shadow-2xl overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-white dark:bg-surface-dark sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#111813] dark:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-[#111813] dark:text-white font-bold text-base">{title}</h1>
        <button
          onClick={() => navigate("/vendor/dashboard/messages")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#111813] dark:text-white transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4eb75e] rounded-full" />
        </button>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-surface-dark shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4eb75e] flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#111813] dark:text-white text-sm">Vendor Dashboard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#111813] dark:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#4eb75e] text-white shadow-sm"
                    : "text-[#444] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back to Main App */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              navigate(-1);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#61896b] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-8 px-4 pt-4 space-y-4">
        {children}
      </main>
    </div>
  );
};

VendorLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default VendorLayout;