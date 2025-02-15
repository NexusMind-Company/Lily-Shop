import { Link } from "react-router";

const header = () => {
  return (
    <header className="flex place-items-center justify-between h-16 px-7 shadow shadow-[#00000040]">
      <Link to="/">
        <h1 className="font-bold text-2xl/relaxed text-[#4EB75E] font-inter uppercase">
          Lily Shop
        </h1>
      </Link>
      <button>
        <img src="/search.svg" alt="search-button" />
      </button>
    </header>
  );
};

export default header;
