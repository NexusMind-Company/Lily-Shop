import { Link } from "react-router";

const header = () => {
  return (
    <header className="flex place-items-center justify-between h-16 px-7 shadow shadow-[#00000040]">
      <Link to="/">
        <h1 className="font-bold text-2xl/relaxed text-lily font-inter uppercase">
          Lily Shop
        </h1>
      </Link>

      <div className="flex items-center space-x-4">
        <button className="cursor-pointer">
          <img src="/search.svg" alt="search-button" />
        </button>
        <button to="/login" className="cursor-pointer">
          <img src="/icon.svg" alt="icon" />
        </button>
      </div>

      {/* Search Bar */}
      <form className="absolute w-full hidden">
        <div className="relative w-full flex items-center justify-center left-0 right-0">
          <input
            className="bg-white py-1.5 px-2.5 w-full rounded-[14px]"
            type="text"
            placeholder="Search..."
          />
          <button className="cursor-pointer absolute right-0">
            <img src="/search.svg" alt="search-button" />
          </button>
        </div>
      </form>

      {/*Dropdown Menu*/}
      <ul className="absolute top-14 w-40 right-2 rounded-xl bg-white p-2.5">
        <li className="border-b">
          <Link to="/purchaseAds">Purchase Ads</Link>
        </li>
        <li>
          <Link to="/login">Sign In</Link>
        </li>
      </ul>
    </header>
  );
};

export default header;
