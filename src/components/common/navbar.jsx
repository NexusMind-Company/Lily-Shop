import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/product")
      );
    }
    return location.pathname === path;
  };

  return (
    <nav className="flex items-center justify-between px-7 w-full fixed bottom-5 md:bottom-2 mt-20 overflow-hidden">
      <Link to="/" className="flex flex-col items-center">
        <img
          src={isActive("/") ? "/home-active.svg" : "/home.svg"}
          alt="home-icon"
        />
        <p>Home</p>
      </Link>
      <Link to="/myShop" className="flex flex-col items-center">
        <img
          src={isActive("/myShop") ? "/shop-active.png" : "/shop.png"}
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
