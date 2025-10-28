// TopNav.js
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { BsBroadcast } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import CartModal from "./cart/cartModal";
import SearchModal from "./SearchModal"; // <-- 1. Import the new modal

const TopNav = ({ activeTab, setActiveTab }) => {
  // --- 2. Remove all search-related states ---
  // const [searchOpen, setSearchOpen] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [searchResults, setSearchResults] = useState([]);
  // const searchRef = useRef(null);
  // const searchButtonRef = useRef(null);
  
  // --- 3. Add state for the new search modal ---
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const EMPTY_ARRAY = [];
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_ARRAY);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // --- 4. Close the modal on navigation ---
    setIsSearchModalOpen(false);
  }, [location.pathname]);

  // --- 5. Remove the old useEffect for handleClickOutside ---
  // (No longer needed as the modal is full-screen)

  // --- 6. Remove all search handler functions ---
  // const handleSearchChange = (e) => { ... };
  // const handleSearchSubmit = (e) => { ... };

  const handleOpenCart = () => {
    setShowCartModal(true);
  };
  
  return (
    <div className="flex items-center w-full h-16 px-4 bg-transparent fixed top-0 left-0 z-50">
      <div className="flex items-center justify-between w-lg mx-auto md:w-4xl">
        <div className="pl-2">
          <BsBroadcast className="size-5 md:size-7 text-white hidden" />
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("nearby")}
            className={`font-normal font-poppins ${
              activeTab === "nearby" ? "text-white" : "text-ash"
            }`}
          >
            <span
              className={`text-sm ${
                activeTab === "nearby"
                  ? "pb-1 border-b-2 border-b-lily"
                  : ""
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
                activeTab === "forYou"
                  ? "pb-1 border-b-2 border-b-lily"
                  : ""
              }`}
            >
              For you
            </span>
          </button>
        </div>

        {/* Search and Cart buttons */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Search Icon / Button */}
          <div className="pr-2">
            {/* --- 7. Update onClick to open the modal --- */}
            <button
              className="cursor-pointer"
              onClick={() => setIsSearchModalOpen(true)}
              // ref={searchButtonRef} // (No longer needed)
            >
              <img src="/icons/search-icon.svg" alt="" />
            </button>
          </div>

          {/* Cart Icon / Button */}
          <div className="pr-2">
            <button
              className="cursor-pointer relative"
              onClick={handleOpenCart}
            >
              <img
                src="./icons/cart.svg"
                alt=""
                className="text-white fill-white size-6"
              />
              {cartItemCount > 0 && (
                <div className="bg-lily grid place-items-center rounded-full size-5 absolute bottom-1/2 left-1/2">
                  <p className="font-semibold text-center text-xs">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* --- 8. Remove the old in-place Search Bar and Dropdown --- */}
        {/* <div ref={searchRef} ... > ... </div> */}
        
      </div>

      {/* RENDER THE MODALS */}
      <AnimatePresence>
        {showCartModal && (
          <CartModal
            isOpen={showCartModal}
            onClose={() => setShowCartModal(false)}
          />
        )}
      </AnimatePresence>

      {/* --- 9. Add the new SearchModal to be rendered --- */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <SearchModal onClose={() => setIsSearchModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopNav;