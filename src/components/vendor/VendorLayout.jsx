import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Wallet,
  MessageCircle,
  Star,
  BarChart2,
  ChevronLeft,
  X,
  Home,
  User,
  PhoneCall,
  Menu,
} from "lucide-react";
import PropTypes from "prop-types";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/vendor/dashboard" },
  { icon: Wallet, label: "Earnings", path: "/vendor/dashboard/earnings" },
  {
    icon: MessageCircle,
    label: "Messages",
    path: "/vendor/dashboard/messages",
  },
  { icon: Star, label: "Ratings", path: "/vendor/dashboard/ratings" },
  { icon: BarChart2, label: "Analytics", path: "/vendor/dashboard/analytics" },
];

const appItems = [
  { icon: Home, label: "Home / Feed", path: "/" },
  { icon: User, label: "My Profile", path: "/profile" },
  { icon: PhoneCall, label: "Support", path: "/support" },
  { icon: ChevronLeft, label: "Go Back", path: "/vendor/dashboard" },
];

const VendorLayout = ({ children, title, showBack = false, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f6f8f6] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full w-72
          bg-white border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-8 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="font-bold text-3xl text-lily uppercase">
              Lily Shops
            </h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
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
                    ? "bg-lily text-white"
                    : "text-black hover:bg-gray-100"
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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-black hover:bg-gray-100 transition"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom: Go Back */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => {
              navigate(-1);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-black hover:bg-gray-100 transition"
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-16 w-full flex items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-8 z-30">
          <div className="flex items-center gap-2">
            {showBack ? (
              <button
                onClick={onBack || (() => navigate(-1))}
                className="p-2 rounded-full hover:bg-gray-100 text-black transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-black transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            <h1 className="text-lg font-bold text-black truncate ml-1">
              {title}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

VendorLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  showBack: PropTypes.bool,
  onBack: PropTypes.func,
};

export default VendorLayout;
