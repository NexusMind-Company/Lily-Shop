import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { BsBroadcast } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import CartModal from "./cart/cartModal";

const TopNav = ({ activeTab, setActiveTab }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  const [showCartModal, setShowCartModal] = useState(false);

  const EMPTY_ARRAY = [];

  const shops = useSelector((state) => state.shops.shops);

  // Add to cart Logic
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_ARRAY);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target) &&
        searchOpen
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    let combinedShops = [];

    if (shops) {
      if (Array.isArray(shops)) {
        combinedShops = shops;
      } else if (typeof shops === "object") {
        combinedShops = [
          ...(Array.isArray(shops.sponsored_shops)
            ? shops.sponsored_shops
            : []),
          ...(Array.isArray(shops.for_you) ? shops.for_you : []),
        ];
      }
    }

    const filteredResults = combinedShops
      .filter(
        (shop) =>
          shop.name?.toLowerCase().includes(value.toLowerCase()) ||
          shop.description?.toLowerCase().includes(value.toLowerCase()) ||
          shop.category?.toLowerCase().includes(value.toLowerCase()) ||
          shop.address?.toLowerCase().includes(value.toLowerCase()) ||
          (shop.products &&
            Array.isArray(shop.products) &&
            shop.products.some((product) =>
              product.name?.toLowerCase().includes(value.toLowerCase())
            )) ||
          (shop.tags &&
            Array.isArray(shop.tags) &&
            shop.tags.some((tag) =>
              tag.toLowerCase().includes(value.toLowerCase())
            ))
      )
      .slice(0, 5);

    setSearchResults(filteredResults);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/searchResults?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  const handleOpenCart = () => {
    setShowCartModal(true);
  };
  return (
    <div className="flex items-center w-full h-16 px-4 bg-transparent fixed top-0 left-0 z-50">
      <div className="flex items-center justify-between w-lg mx-auto md:w-4xl">
        <div className="pl-2">
          <BsBroadcast className="size-5 md:size-7 text-white" />
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

        {/* Search and Cart buttons */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Search Icon / Button */}
          <div className="pr-2">
            <button
              className="cursor-pointer"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) setSearchTerm("");
              }}
              ref={searchButtonRef}
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

        {/* Search Bar */}
        <div
          ref={searchRef}
          className={`absolute flex top-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md md:max-w-8/12 lg:max-w-6/12 sm:max-w-sm transition-all duration-500 ease-in-out ${
            searchOpen
              ? "opacity-100 scale-y-100 origin-top"
              : "opacity-0 scale-y-0 pointer-events-none"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full flex items-center"
          >
            <input
              className="bg-white py-2 text-black px-3 sm:py-1 sm:px-2 w-full rounded-lg border border-gray-300"
              type="text"
              placeholder="Search by keyword"
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus={searchOpen}
            />
            <button type="submit" className="absolute right-3">
              <img src="/search-icon.svg" alt="search-icon" />
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute mt-10 w-full bg-white rounded-lg shadow-lg max-h-72 overflow-y-auto overflow-x-clip z-10">
              <ul>
                {searchResults.map((shop) => (
                  <li
                    key={shop.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                    onClick={() => navigate(`/shop/${shop.id}`)}
                  >
                    <div className="flex items-center">
                      {shop.image_url && (
                        <img
                          src={shop.image_url}
                          alt={shop.name}
                          className="w-8 h-8 object-cover mr-2"
                        />
                      )}
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {shop.category && (
                            <span className="text-lily">• {shop.category}</span>
                          )}
                          {shop.address && (
                            <span className="text-lily">• {shop.address}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                <li
                  className="p-2 text-center text-blue-600 hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/searchResults?q=${encodeURIComponent(searchTerm)}`
                    )
                  }
                >
                  View all results
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* RENDER THE CART MODAL */}
      <AnimatePresence>
        {showCartModal && (
          <CartModal
            isOpen={showCartModal}
            onClose={() => setShowCartModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopNav;
