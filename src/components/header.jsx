import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  
  // References to the menu and search elements
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Close menus when location changes (page navigation)
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Handle clicks outside the menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close menu if click is outside menu and not on menu button
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) && 
        menuButtonRef.current && 
        !menuButtonRef.current.contains(event.target) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }

      // Close search if click is outside search and not on search button
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

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, searchOpen]);

  return (
    <header className="flex place-items-center justify-between h-16 px-7 shadow shadow-[#00000040] relative">
      <Link to="/">
        <h1 className="font-bold text-2xl/relaxed text-lily font-inter uppercase">
          Lily Shops
        </h1>
      </Link>

      <div className="flex items-center space-x-4">
        {/* Search Button */}
        <button 
          className="cursor-pointer" 
          onClick={() => setSearchOpen(!searchOpen)}
          ref={searchButtonRef}
        >
          <img src="/search.svg" alt="search-button" />
        </button>

        {/* Menu Button */}
        <button 
          className="cursor-pointer" 
          onClick={() => setMenuOpen(!menuOpen)}
          ref={menuButtonRef}
        >
          <img src="/icon.svg" alt="menu icon" />
        </button>
      </div>

      {/* Search Bar with Slide-Down Effect */}
      <form
        ref={searchRef}
        className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-11/12 md:w-8/12 rounded-full shadow-lg transition-transform duration-500 ease-in-out ${
          searchOpen ? "opacity-100 scale-y-100 origin-top" : "opacity-0 scale-y-0 hidden"
        }`}
      >
        <div className="relative w-full flex items-center">
          <input
            className="bg-white py-2 px-4 w-full rounded-2xl border border-gray-300"
            type="text"
            placeholder="Search..."
          />
          <button className="cursor-pointer absolute right-3">
            <img src="/search-icon.svg" alt="search-icon" />
          </button>
        </div>
      </form>

      {/* Dropdown Menu with Slide-Down Effect */}
      <ul
        ref={menuRef}
        className={`absolute top-14 right-2 w-40 rounded-xl bg-white p-2.5 shadow-lg transition-transform duration-500 ease-in-out transform ${
          menuOpen ? "opacity-100 scale-y-100 origin-top" : "opacity-0 scale-y-0 hidden"
        }`}
      >
        <li className="border-b py-2">
          <Link to="/purchaseAds">Purchase Ads</Link>
        </li>
        <li className="py-2">
          <Link to="/login">Sign In</Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;