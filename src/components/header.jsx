import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { fetchShops } from "../redux/shopSlice";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { shops, status } = useSelector((state) => state.shops);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

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

    const filteredResults = shops
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

  return (
    <header className="flex items-center justify-between h-16 px-3 md:px-6 shadow-ash shadow relative z-40">
      <Link to="/">
        <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
      </Link>

      <div className="flex items-center gap-2.5">
        <button
          className="cursor-pointer"
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) setSearchTerm("");
          }}
          ref={searchButtonRef}
        >
          <img src="/search.svg" alt="search-button" />
        </button>

        <button
          className="cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          ref={menuButtonRef}
        >
          <img src="/icon.svg" alt="menu icon" />
        </button>

        {isAuthenticated && (
          <Link to="/messages" className="cursor-pointer w-8 hidden">
            <img src="/message-icon.svg" alt="message icon" />
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div
        ref={searchRef}
        className={`absolute hidden sm:flex top-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md md:max-w-6/12 sm:max-w-sm transition-all duration-500 ease-in-out ${
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
            className="bg-white py-2 px-3 sm:py-1 sm:px-2 w-full rounded-lg border border-gray-300"
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
          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg max-h-72 overflow-y-auto z-10">
            <ul>
              {searchResults.map((shop) => (
                <li
                  key={shop.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                  onClick={() => navigate(`/product/${shop.id}`)}
                >
                  <div className="flex items-center">
                    {shop.image && (
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
                        <span className="text-lily">
                          • {shop.products.length} products
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              <li
                className="p-2 text-center text-blue-600 hover:bg-gray-100 cursor-pointer"
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
        className={`absolute top-14 right-2 w-40 rounded-xl bg-white p-2.5 shadow-lg transition-transform duration-500 ease-in-out transform ${
          menuOpen
            ? "opacity-100 scale-y-100 origin-top"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        {isAuthenticated && (
          <li className="py-2 hover:text-lily">
            <Link to="/myShop">My Shop</Link>
          </li>
        )}
        <li className="py-2 hover:text-lily">
          <Link to="/purchaseAds">Purchase Ads</Link>
        </li>
        {isAuthenticated ? (
          <li className="py-2 hover:text-lily">
            <button
              className="cursor-pointer"
              onClick={() => dispatch(logout())}
            >
              Logout
            </button>
          </li>
        ) : (
          <li className="py-2 hover:text-lily">
            <Link to="/login">Sign In</Link>
          </li>
        )}
      </ul>
    </header>
  );
};

export default Header;
