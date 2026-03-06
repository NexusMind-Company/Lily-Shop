import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Search, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import CartModal from "./cart/cartModal";
import SearchModal from "./searchModal";

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
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white pt-8 px-4 z-50">
      {/* Logo / Brand */}
      <div className="mb-10 px-4">
        <Link to="/">
          <h1 className="font-bold text-3xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${activePage === "home" ? "text-lily font-bold bg-gray-50" : "text-ash font-medium"}`}
        >
          <img
            src={
              activePage === "home"
                ? "/icons/home-active.svg"
                : "/icons/home-4.svg"
            }
            className="h-6 w-6"
          />
          <span className="text-lg">Home</span>
        </Link>

        {/* Create */}
        <Link
          to="/createContent"
          className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${activePage === "create" ? "text-lily font-bold bg-gray-50" : "text-ash font-medium"}`}
        >
          <img
            src="/icons/create-circle.svg"
            className={`h-6 w-6 ${activePage === "create" ? "text-lily" : ""}`}
          />
          <span className="text-lg">Create</span>
        </Link>

        {/* Food */}
        <Link
          to="/food"
          className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${activePage === "food" ? "text-lily font-bold bg-gray-50" : "text-ash font-medium"}`}
        >
          <UtensilsCrossed
            className={`h-6 w-6 ${activePage === "food" ? "text-lily" : "text-gray-600"}`}
          />
          <span className="text-lg">Food</span>
        </Link>

        {/* Inbox */}
        <Link
          to="/inbox"
          className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${activePage === "inbox" ? "text-lily font-bold bg-gray-50" : "text-ash font-medium"}`}
        >
          <div className="relative">
            <img
              src={
                activePage === "inbox"
                  ? "/icons/message-3-active.svg"
                  : "/icons/message-3.svg"
              }
              className="h-6 w-6"
            />
            <div className="absolute bg-red-500 rounded-full h-2 w-2 top-0 -right-1"></div>
          </div>
          <span className="text-lg">Inbox</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${activePage === "profile" ? "text-lily font-bold bg-gray-50" : "text-ash font-medium"}`}
        >
          <img
            src={
              activePage === "profile"
                ? "/icons/user-active.svg"
                : "/icons/user.svg"
            }
            className="h-6 w-6"
          />
          <span className="text-lg">Profile</span>
        </Link>

        {/* Search Modal Trigger */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-ash font-medium w-full text-left"
        >
          <Search className="h-6 w-6 text-gray-600" />
          <span className="text-lg text-lily">Search</span>
        </button>

        {/* Cart Modal Trigger */}
        <button
          onClick={() => setShowCartModal(true)}
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-ash font-medium w-full text-left relative"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {cartItemCount > 0 && (
              <div className="bg-lily grid place-items-center rounded-full size-5 absolute -top-2 -right-3 border-2 border-white">
                <p className="font-bold text-white text-[10px]">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </p>
              </div>
            )}
          </div>
          <span className="text-lg ml-1 text-lily">Cart</span>
        </button>
      </nav>

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
