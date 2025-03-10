/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const Header = ({ productData = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Search through product data by name, description, and category
    const filteredResults = productData
      .filter(
        (product) =>
          product.name?.toLowerCase().includes(value.toLowerCase()) ||
          product.description?.toLowerCase().includes(value.toLowerCase()) ||
          product.category?.toLowerCase().includes(value.toLowerCase()) ||
          (product.tags &&
            Array.isArray(product.tags) &&
            product.tags.some((tag) =>
              tag.toLowerCase().includes(value.toLowerCase())
            ))
      )
      .slice(0, 5); // Limit to 5 results for dropdown

    setSearchResults(filteredResults);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      // Update to use /searchResults route instead of /search
      navigate(`/searchResults?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchResults([]);
      setSearchTerm(""); // Clear search input after searching
    }
  };

  // Handle click on a search result item
  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchOpen(false);
    setSearchResults([]);
    setSearchTerm(""); // Clear search input after selecting a result
  };

  // Handle view all results click
  const handleViewAllResults = () => {
    // Update to use /searchResults route instead of /search
    navigate(`/searchResults?q=${encodeURIComponent(searchTerm)}`);
    setSearchOpen(false);
    setSearchResults([]);
    setSearchTerm(""); // Clear search input after viewing all results
  };


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
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) setSearchTerm(""); // Clear search when opening
          }}
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
      <div
        ref={searchRef}
        className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-11/12 md:w-8/12 transition-all duration-500 ease-in-out ${
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
            className="bg-white py-2 px-4 w-full rounded-2xl border border-gray-300"
            type="text"
            placeholder="Search by name, category, or tags..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus={searchOpen}
          />
          <button type="submit" className="cursor-pointer absolute right-3">
            <img src="/search-icon.svg" alt="search-icon" />
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
            <ul>
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                  onClick={() => handleResultClick(product.id)}
                >
                  <div className="flex items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {product.price}{" "}
                        {product.category && (
                          <span className="text-lily">
                            • {product.category}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {/* Use a button instead of a Link for better control */}
              <li
                className="p-2 text-center text-blue-600 hover:bg-gray-100 cursor-pointer"
                onClick={handleViewAllResults}
              >
                View all results
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Dropdown Menu with Slide-Down Effect */}
      <ul
        ref={menuRef}
        className={`absolute top-14 right-2 w-40 rounded-xl bg-white p-2.5 shadow-lg transition-transform duration-500 ease-in-out transform ${
          menuOpen
            ? "opacity-100 scale-y-100 origin-top"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <li className="py-2">
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
