import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Search, ShoppingCart, Home, PlusCircle, MessageSquare, User } from "lucide-react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import CartModal from "./cart/cartModal";
import SearchModal from "./searchModal";
import DarkModeToggle from "../common/DarkModeToggle";

// NavLink helper component
const NavLink = ({ to, active, icon, badge, children }) => {
  const icons = {
    home: Home,
    create: PlusCircle,
    food: UtensilsCrossed,
    inbox: MessageSquare,
    profile: User,
  };

  const IconComponent = icons[icon] || Home;

  return (
    <Link to={to}>
      <motion.div
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
          active
            ? "bg-lily/10 dark:bg-lily/20 text-lily font-semibold"
            : "text-gray-600 dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-surface-dark/50 font-medium"
        }`}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`p-2 rounded-lg transition-colors ${active ? "bg-lily/20" : "bg-gray-100 dark:bg-surface-dark"}`}>
          <div className="relative">
            <IconComponent className={`h-5 w-5 transition-colors ${active ? "text-lily" : ""}`} />
            {badge && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-lily rounded-full" />
            )}
          </div>
        </div>
        <span className="text-base">{children}</span>
        {active && (
          <motion.div
            layoutId="sideNavIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-lily"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

const SideNav = ({ activePage }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const EMPTY_ARRAY = [];
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_ARRAY);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark pt-8 px-4 z-sticky transition-colors duration-300">
      {/* Logo / Brand */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-10 px-4"
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-lily flex items-center justify-center shadow-lg shadow-lily/30 group-hover:shadow-lily/50 transition-shadow">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="font-bold text-2xl text-lily uppercase tracking-wide">Lily Shops</h1>
        </Link>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1">
        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Menu
        </p>
        {/* Home */}
        <NavLink to="/" active={activePage === "home"} icon="home">
          Home
        </NavLink>

        {/* Create */}
        <NavLink to="/createContent" active={activePage === "create"} icon="create">
          Create
        </NavLink>

        {/* Food */}
        <NavLink to="/food" active={activePage === "food"} icon="food">
          Food
        </NavLink>

        {/* Inbox */}
        <NavLink to="/inbox" active={activePage === "inbox"} icon="inbox" badge>
          Inbox
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile" active={activePage === "profile"} icon="profile">
          Profile
        </NavLink>

        <div className="my-3 border-t border-gray-100 dark:border-gray-700" />

        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">
          Tools
        </p>

        {/* Search Modal Trigger */}
        <motion.button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors text-gray-600 dark:text-text-secondary-dark font-medium w-full text-left group"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-surface-dark group-hover:bg-lily/10 transition-colors">
            <Search className="h-5 w-5 text-gray-600 dark:text-text-secondary-dark group-hover:text-lily transition-colors" />
          </div>
          <span className="text-base">Search</span>
        </motion.button>

        {/* Cart Modal Trigger */}
        <motion.button
          onClick={() => setShowCartModal(true)}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors text-gray-600 dark:text-text-secondary-dark font-medium w-full text-left relative group"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative p-2 rounded-lg bg-gray-100 dark:bg-surface-dark group-hover:bg-lily/10 transition-colors">
            <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-text-secondary-dark group-hover:text-lily transition-colors" />
            {cartItemCount > 0 && (
              <div className="bg-lily grid place-items-center rounded-full min-w-[18px] h-[18px] absolute -top-1 -right-1 border-2 border-white dark:border-surface-dark">
                <p className="font-bold text-white text-[10px] px-1">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </p>
              </div>
            )}
          </div>
          <span className="text-base">Cart</span>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {cartItemCount > 0 && `${cartItemCount} items`}
          </span>
        </motion.button>
      </nav>

      {/* Dark Mode Toggle */}
      <motion.div
        className="mt-auto mb-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-surface-dark">
          <span className="text-sm font-medium text-gray-700 dark:text-text-secondary-dark">Theme</span>
          <DarkModeToggle size="sm" />
        </div>
      </motion.div>

      {/* RENDER THE MODALS FOR DESKTOP */}
      <AnimatePresence>
        {showCartModal && (
          <CartModal
            isOpen={showCartModal}
            onClose={() => setShowCartModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchModalOpen && (
          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideNav;
