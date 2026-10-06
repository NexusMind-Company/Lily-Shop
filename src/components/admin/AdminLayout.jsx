import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Settings, 
  Activity, 
  Menu, 
  X,
  LogOut,
  ChevronLeft,
  ShieldAlert
} from "lucide-react";

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Operations", path: "/admin/operations", icon: Wallet },
    { name: "Vendors & Users", path: "/admin/directory", icon: Users },
    { name: "Resolution Center", path: "/admin/resolution", icon: ShieldAlert },
    { name: "System Health", path: "/admin/health", icon: Activity },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#f6f8f6] font-display overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-100 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lily rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">L</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Admin Portal</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all
                  ${isActive 
                    ? "bg-lily/10 text-lily" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Shop
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-900 ml-2">LilyShop Admin</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
