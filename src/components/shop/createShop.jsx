import { Link } from "react-router";
import { useState, useEffect } from "react";

const CreateShop = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-black h-[70px] w-full flex items-center justify-center">
        <h1 className="text-xl font-normal font-poppins">
          Create <span className="text-lily">Shop</span>
        </h1>
      </div>

      {/* Shop Title */}
      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs md:text-sm lg:text-lg uppercase">
          <span className="border-b-2 border-sun">My sh</span>op
          <br />
        </h2>
      </div>

      {/* Description */}
      <div>
        <p className="font-inter text-base md:text-lg font-normal text-gray-700">
          Empty space, endless possibilities—create your shop now
        </p>
      </div>

      {/* Show if user is authenticated */}
      {isAuthenticated ? (
        <div className="flex items-center justify-start">
          <Link
            to="/createForm"
            className="font-inter font-semibold text-xs md:text-sm flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Create New
            <img
              src="/addition.svg"
              alt="addition-icon"
              className="w-4 md:w-5"
            />
          </Link>
        </div>
      ) : (
        <Link
          to="/login"
          className="font-inter text-sm md:text-base text-gray-500"
        >
          Login to create a shop
        </Link>
      )}
    </section>
  );
};

export default CreateShop;
