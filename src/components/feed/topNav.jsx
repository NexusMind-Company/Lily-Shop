import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import CartModal from "./cart/cartModal";
import SearchModal from "./searchModal";

const TopNav = ({ activeTab, setActiveTab }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const EMPTY_ARRAY = [];
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_ARRAY);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const location = useLocation();

  useEffect(() => {
    setIsSearchModalOpen(false);
  }, [location.pathname]);

  const handleOpenCart = () => {
    setShowCartModal(true);
  };

  return (
    <div className="flex items-center h-16 px-4 md:px-8 bg-transparent fixed top-0 left-0 right-0 md:left-64 z-50 pointer-events-none">
      <div className="relative flex items-center justify-center w-full max-w-4xl mx-auto h-full pointer-events-auto">
        <div className="relative flex gap-8">
          <button
            onClick={() => setActiveTab("nearby")}
            className="relative group"
          >
            <span
              className={`text-sm font-medium font-display transition-all duration-200 ${
                activeTab === "nearby"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Nearby
            </span>
            {activeTab === "nearby" && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-lily rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("forYou")}
            className="relative group"
          >
            <span
              className={`text-sm font-medium font-display transition-all duration-200 ${
                activeTab === "forYou"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              For you
            </span>
            {activeTab === "forYou" && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-lily rounded-full" />
            )}
          </button>
        </div>

        <div className="absolute right-0 flex md:hidden items-center gap-5">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <img src="/icons/search-icon.svg" alt="Search" className="w-6 h-6" />
          </button>

          <button className="relative p-1 hover:bg-white/10 rounded-full transition-colors" onClick={handleOpenCart}>
            <img
              src="./icons/cart.svg"
              alt="Cart"
              className="w-6 h-6"
            />
            {cartItemCount > 0 && (
              <div className="bg-lily grid place-items-center rounded-full min-w-[18px] h-[18px] px-1 absolute -top-1 -right-1">
                <p className="font-semibold text-center text-[10px] text-white leading-none">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </p>
              </div>
            )}
          </button>
        </div>
      </div>

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
      />

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

export default TopNav;
