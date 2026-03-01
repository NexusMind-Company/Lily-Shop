import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
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
  const navigate = useNavigate();

  useEffect(() => {
    setIsSearchModalOpen(false);
  }, [location.pathname]);

  const handleOpenCart = () => {
    setShowCartModal(true);
  };

  return (
    <div className="flex items-center h-16 px-4 md:px-8 bg-transparent fixed top-0 left-0 right-0 md:left-64 z-50 pointer-events-none">
      <div className="relative flex items-center justify-center w-full max-w-4xl mx-auto h-full pointer-events-auto">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("nearby")}
            className={`font-normal font-poppins ${
              activeTab === "nearby" ? "text-white" : "text-ash"
            }`}
          >
            <span
              className={`text-sm ${
                activeTab === "nearby" ? "pb-1 border-b-2 border-b-lily" : ""
              }`}
            >
              Nearby
            </span>
          </button>
          <button
            onClick={() => setActiveTab("forYou")}
            className={`font-semibold font-poppins ${
              activeTab === "forYou" ? "text-white" : "text-ash"
            }`}
          >
            <span
              className={`text-sm ${
                activeTab === "forYou" ? "pb-1 border-b-2 border-b-lily" : ""
              }`}
            >
              For you
            </span>
          </button>
        </div>

        <div className="absolute right-0 flex md:hidden items-center gap-4">
          <button
            className="cursor-pointer"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <img src="/icons/search-icon.svg" alt="Search" />
          </button>

          <button className="cursor-pointer relative" onClick={handleOpenCart}>
            <img
              src="./icons/cart.svg"
              alt="Cart"
              className="text-white fill-white size-6"
            />
            {cartItemCount > 0 && (
              <div className="bg-lily grid place-items-center rounded-full size-5 absolute bottom-1/2 left-1/2">
                <p className="font-semibold text-center text-[10px]">
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
