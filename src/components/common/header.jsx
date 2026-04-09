import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { fetchShops } from "../../redux/shopSlice";
import { fetchNotifications } from "../../redux/notificationSlice";
import { Search, Bell } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { shops, status } = useSelector((state) => state.shops);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1 }));
      const interval = setInterval(() => {
        dispatch(fetchNotifications({ page: 1 }));
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [status, dispatch, isAuthenticated]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }

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
  }, [menuOpen, searchOpen]);

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

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="flex items-center justify-between w-full fixed top-0 h-16 px-3 md:px-6 shadow-md bg-white dark:bg-surface-dark z-banner transition-colors duration-300">
      <Link to="/" onClick={handleLogoClick}>
        <h1 className="font-bold text-2xl text-lily uppercase tracking-wide">Lily Shops</h1>
      </Link>

      <div className="flex items-center gap-2.5 ">
        <button
          className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) setSearchTerm("");
          }}
          ref={searchButtonRef}
          aria-label="Search"
        >
          <Search className="w-6 h-6 text-gray-700 dark:text-text-main-dark" />
        </button>

        <button
          className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          ref={menuButtonRef}
          aria-label="Menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
            <span className={`block h-0.5 bg-gray-700 dark:bg-text-main-dark transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}></span>
            <span className={`block h-0.5 bg-gray-700 dark:bg-text-main-dark transition-all duration-300 ${menuOpen ? "w-6 opacity-0" : "w-4"}`}></span>
            <span className={`block h-0.5 bg-gray-700 dark:bg-text-main-dark transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-5"}`}></span>
          </div>
        </button>

        {isAuthenticated && (
          <Link to="/notifications" className="cursor-pointer relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors">
            <Bell className="w-6 h-6 text-gray-700 dark:text-text-main-dark" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-lily text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {isAuthenticated && (
          <Link to="/messages" className="cursor-pointer w-8 hidden">
            <img src="/message-icon.svg" alt="message icon" />
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div
        ref={searchRef}
        className={`absolute flex top-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md md:max-w-8/12 lg:max-w-6/12 sm:max-w-sm transition-all duration-500 ease-in-out z-dropdown ${searchOpen
          ? "opacity-100 scale-y-100 origin-top"
          : "opacity-0 scale-y-0 pointer-events-none"
          }`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full flex items-center"
        >
          <input
            className="bg-white dark:bg-surface-dark py-2.5 px-4 w-full rounded-xl border border-gray-200 dark:border-gray-600 focus:border-lily focus:ring-2 focus:ring-lily/20 outline-none transition-all text-gray-900 dark:text-text-main-dark placeholder:text-gray-400 dark:placeholder:text-gray-500"
            type="text"
            placeholder="Search shops, products..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus={searchOpen}
          />
          <button type="submit" className="absolute right-3 ">
            <img src="/search-icon.svg" alt="search-icon" />
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute mt-12 w-full bg-white dark:bg-surface-dark rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 max-h-72 overflow-y-auto overflow-x-clip z-popover border border-gray-100 dark:border-gray-700">
            <ul className="py-2">
              {searchResults.map((shop) => (
                <li
                  key={shop.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-dark/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/shop/${shop.id}`)}
                >
                  <div className="flex items-center gap-3">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-lily-100 dark:bg-lily-900/30 flex items-center justify-center">
                        <span className="text-lily font-bold text-lg">{shop.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-text-main-dark truncate">{shop.name}</p>
                      <p className="text-xs text-gray-500 dark:text-text-secondary-dark truncate">
                        {shop.category && (
                          <span className="inline-flex items-center gap-1 mr-2">
                            <span className="w-1 h-1 rounded-full bg-lily"></span>
                            {shop.category}
                          </span>
                        )}
                        {shop.address && (
                          <span className="truncate">{shop.address}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              <li
                className="px-4 py-3 text-center text-lily hover:bg-lily-50 dark:hover:bg-lily-900/20 cursor-pointer transition-colors border-t border-gray-100 dark:border-gray-700 font-medium text-sm"
                onClick={() =>
                  navigate(`/searchResults?q=${encodeURIComponent(searchTerm)}`)
                }
              >
                View all results
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      <ul
        ref={menuRef}
        className={`absolute top-16 right-3 w-48 rounded-xl bg-white dark:bg-surface-dark p-2 shadow-xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 ease-out transform ${menuOpen
          ? "opacity-100 scale-100 origin-top translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          } z-dropdown border border-gray-100 dark:border-gray-700`}
      >
        {isAuthenticated && (
          <>
            <li className="rounded-lg hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors">
              <Link to="/myShop" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-text-secondary-dark hover:text-lily">
                <span className="w-5 h-5 flex items-center justify-center">🏪</span>
                My Shop
              </Link>
            </li>
          </>
        )}
        {isAuthenticated ? (
          <li className="rounded-lg hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-text-secondary-dark hover:text-lily cursor-pointer"
              onClick={() => dispatch(logout())}
            >
              <span className="w-5 h-5 flex items-center justify-center">🚪</span>
              Logout
            </button>
          </li>
        ) : (
          <>
            <li className="rounded-lg hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors">
              <Link to="/signUp" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-text-secondary-dark hover:text-lily">
                <span className="w-5 h-5 flex items-center justify-center">✨</span>
                Sign Up
              </Link>
            </li>
            <li className="rounded-lg hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors">
              <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-text-secondary-dark hover:text-lily">
                <span className="w-5 h-5 flex items-center justify-center">🔐</span>
                Sign In
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;
