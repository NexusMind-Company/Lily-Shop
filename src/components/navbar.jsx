import { Link, useLocation } from "react-router";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between px-7 pt-3 w-full relative bottom-10 mt-20">
      <Link to="/" className="flex flex-col items-center">
        <img
          src={location.pathname === "/" ? "home-active.svg" : "home.svg"}
          alt="home-icon"
        />
        <p>Home</p>
      </Link>
      <Link to="/createShop" className="flex flex-col items-center">
        <img
          src={
            location.pathname === "/createShop"
              ? "shop-active.svg"
              : "shop.svg"
          }
          alt="shop-icon"
        />
        <p>My Shop</p>
      </Link>
      <Link to="/settings" className="flex flex-col items-center">
        <img
          src={
            location.pathname === "/settings"
              ? "settings-active.svg"
              : "settings.svg"
          }
          alt="settings-icon"
        />
        <p>Settings</p>
      </Link>
    </nav>
  );
};

export default Navbar;