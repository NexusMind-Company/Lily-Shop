import { useState } from "react";
import { Link } from "react-router";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex place-items-center justify-between h-16 px-7 shadow shadow-[#00000040] relative">
      <Link to="/">
        <h1 className="font-bold text-2xl/relaxed text-lily font-inter uppercase">
          Lily Shop
        </h1>
      </Link>

      <div className="flex items-center space-x-4">
        {/* Search Button */}
        <button className="cursor-pointer" onClick={() => setSearchOpen(!searchOpen)}>
          <img src="/search.svg" alt="search-button" />
        </button>

        {/* Menu Button */}
        <button className="cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          <img src="/icon.svg" alt="menu icon" />
        </button>
      </div>

      {/* Search Bar with Slide-Down Effect */}
      <form
        className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md bg-white p-2 rounded-xl shadow-lg transition-transform duration-500 ease-in-out ${
          searchOpen ? "opacity-100 scale-y-100 origin-top" : "opacity-0 scale-y-0 hidden"
        }`}
      >
        <div className="relative w-full flex items-center">
          <input
            className="bg-white py-2 px-4 w-full rounded-[14px] border border-gray-300"
            type="text"
            placeholder="Search..."
          />
          <button className="cursor-pointer absolute right-3">
            <img src="/search.svg" alt="search-button" />
          </button>
        </div>
      </form>

      {/* Dropdown Menu with Slide-Down Effect */}
      <ul
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
