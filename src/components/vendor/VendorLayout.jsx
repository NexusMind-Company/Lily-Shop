import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, ShoppingBag, Users, UtensilsCrossed,
  Calendar, Clock, PauseCircle, Wallet, PlusCircle,
  MessageCircle, Megaphone, Star, TrendingDown, BarChart2,
  ChevronLeft, Menu, X, Bell, Package, UserCircle,
  ListPlus, Home, User, PhoneCall,
} from "lucide-react";
import PropTypes from "prop-types";
import { fetchNotifications } from "../../redux/notificationSlice";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",      path: "/vendor/dashboard" },
  { icon: Wallet,          label: "Earnings",      path: "/vendor/dashboard/earnings" },
  { icon: Star,            label: "Ratings",       path: "/vendor/dashboard/ratings" },
  { icon: BarChart2,       label: "Analytics",     path: "/vendor/dashboard/analytics" },
];

const planItems = [
  { icon: ListPlus,   label: "Manage Plans", path: "/vendor/plans" },
];

const appItems = [
  { icon: Home,        label: "Home / Feed",       path: "/" },
  { icon: User,        label: "My Profile",        path: "/profile" },
  { icon: PhoneCall,   label: "Support",           path: "/support" },
  { icon: UserCircle,  label: "Edit Vendor Profile", path: "/vendor/dashboard/edit-profile" },
  { icon: ChevronLeft, label: "Go Back",           path: "/vendor/dashboard" },
];

const VendorLayout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (path) => { navigate(path); setSidebarOpen(false); };
//   useEffect(() => {
//     dispatch(fetchNotifications({ page: 1 }));
//   }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-[#f6f8f6] dark:bg-background-dark">

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full w-72
          bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4eb75e] flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm text-[#111813] dark:text-white">
              Vendor
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-[#4eb75e] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}

          {/* Plans section */}
          <div className="pt-4 pb-1 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Subscription Plans
            </p>
          </div>
          {planItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-[#4eb75e] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}

          {/* Main app links */}
          <div className="pt-4 pb-1 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Main App
            </p>
          </div>
          {appItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => go(path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom: Edit Profile + Back */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={() => go("/vendor/dashboard/profile")}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4eb75e] hover:bg-[#4eb75e]/10 transition"
          >
            <UserCircle size={16} />
            Edit Vendor Profile
          </button>
          <button
            onClick={() => { navigate(-1); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronLeft size={16} />
            Go Back
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-[#111813] dark:text-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick link back to app — visible on all screens */}
            <button
              onClick={() => navigate("/")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Home size={14} />
              Home
            </button>
            <button
              onClick={() => navigate("/support")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <PhoneCall size={14} />
              Support
            </button>
            <button
              onClick={() => navigate("/vendor/dashboard/messages")}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#4eb75e] rounded-full" />
            </button>
          </div>
          {/* Right */}
          {/* <button 
            onClick={() => navigate("/vendor/dashboard/messages")}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button> */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

VendorLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default VendorLayout;
