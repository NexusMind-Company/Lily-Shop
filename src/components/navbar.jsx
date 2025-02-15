import { Link } from "react-router";

const navbar = () => {
  return (
    <nav className="flex items-center justify-between px-7 w-full relative bottom-0 mt-10">
      <Link to="/" className="flex flex-col items-center">
        <img src="home.svg" alt="home-icon" />
        <p>Home</p>
      </Link>
      <Link to="/createShop" className="flex flex-col items-center">
        <img src="shop-active.svg" alt="shop-icon" />
        <p>My Shop</p>
      </Link>
      <Link className="flex flex-col items-center">
        <img src="settings.svg" alt="settings-icon" />
        <p>Settings</p>
      </Link>
    </nav>
  );
};

export default navbar;
