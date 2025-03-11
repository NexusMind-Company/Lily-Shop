import { Link, useLocation } from "react-router-dom"; // Correct import

const Navbar = () => {
  const location = useLocation();

  // More reliable path checking
  const isActive = (path) => {
    if (path === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/product")
      );
    }
    return location.pathname === path;
  };

  return (
    <nav className="flex items-center justify-between px-7 w-full relative bottom-2 mt-20">
      <Link to="/" className="flex flex-col items-center">
        <img
          src={isActive("/") ? "/home-active.svg" : "/home.svg"}
          alt="home-icon"
        />
        <p>Home</p>
      </Link>
      <Link to="/createShop" className="flex flex-col items-center">
        <img
          src={isActive("/createShop") ? "/shop-active.png" : "/shop.png"}
          alt="shop-icon"
        />
        <p>My Shop</p>
      </Link>
      <Link to="/settings" className="flex flex-col items-center">
        <img
          src={isActive("/settings") ? "/settings-active.svg" : "/settings.svg"}
          alt="settings-icon"
        />
        <p>Settings</p>
      </Link>
    </nav>
  );
};

export default Navbar;
