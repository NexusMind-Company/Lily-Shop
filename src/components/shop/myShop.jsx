import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopById } from "../../redux/shopSlice";
import Loader from "../loader";

const MyShop = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { selectedShop, status } = useSelector((state) => state.shops);

  // Fetch the user's shop when authenticated and shop ID exists
  useEffect(() => {
    if (isAuthenticated && user?.shopId) {
      dispatch(fetchShopById(user.shopId));
    }
  }, [dispatch, isAuthenticated, user?.shopId]);

  if (status === "loading") return <Loader />;

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
      {/* Header */}
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Welcome to <span className="text-lily">My Shop</span>
        </h1>
      </div>

      {/* Shop Display */}
      <div className="flex flex-col items-start gap-3 w-full">
        <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-2 border-sun">
          My Shop
        </h2>

        {/* Shop Card */}
        {selectedShop ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
            <div className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200">
              <div className="w-full h-40 md:h-48">
                <img
                  className="rounded-lg h-full w-full object-cover"
                  src={selectedShop.image_url}
                  alt={selectedShop.name}
                />
              </div>
              <ul className="border-l-2 border-sun pl-2 font-inter">
                <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                  {selectedShop.name}
                </li>
                <li className="text-xs text-gray-600 line-clamp-2">
                  {selectedShop.description}
                </li>
                <li className="text-xs font-normal truncate">
                  {selectedShop.address}
                </li>
              </ul>
              <Link
                to=""
                className="bg-sun p-1 text-xs font-bold text-center hover:bg-lily hover:text-white transition-colors duration-200"
              >
                Products
              </Link>
              <div className="flex justify-between gap-1">
                <Link
                  to="/editShop"
                  className="bg-sun p-1 flex-1 text-xs font-bold text-center hover:bg-lily hover:text-white transition-colors duration-200"
                >
                  Edit Shop
                </Link>
                <button
                  to=""
                  className="bg-ash text-white p-1 flex-1 text-xs font-bold text-center hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-inter text-base md:text-lg font-normal text-gray-700">
              Empty space, endless possibilities—create your shop now
            </p>
          </div>
        )}
      </div>

      {/* Show if user is authenticated */}
      <div className="flex flex-col items-start justify-start w-full text-left py-5">
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="font-inter font-semibold text-sm md:text-base text-gray-500 flex items-center gap-1 hover:text-sun"
          >
            <p>Login to create a shop</p>
            <img src="/arrow-right.svg" alt="arrow-right" className="w-4" />
          </Link>
        ) : (
          <div className="flex items-center">
            <Link
              to="/createShop"
              className="font-inter font-semibold text-xs px-3 md:text-sm flex items-center gap-2 py-2"
            >
              Create New
              <img
                src="/addition.svg"
                alt="addition-icon"
                className="w-4 md:w-5"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyShop;
