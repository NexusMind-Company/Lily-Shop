import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import Delete from "./delete";

const MyShop = () => {
  const [delIsOpen, setDelIsOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shops, status } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const toggleDel = (shop_id = null) => {
    setSelectedShopId(shop_id);
    setDelIsOpen((prev) => !prev);
  };

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fetch profile if needed
    if (status === "idle" || status === "failed") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status, isAuthenticated, navigate]);

  // Show loading state while checking authentication or fetching profile
  if (status === "loading" || !isAuthenticated) {
    return (
      <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
            Welcome to <span className="text-lily">My Shop</span>
          </h1>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-8 h-8 border-[4px] border-solid border-lily border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
      {/* Header */}
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Welcome to <span className="text-lily">My Shop</span>
        </h1>
      </div>

      {/* Shop Display */}
      <div className="flex flex-col items-start gap-3 w-full">
        <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-[2px] border-solid border-sun">
          My Shops
        </h2>

        {status === "loading" ? (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 border-[4px] border-solid border-lily border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-full h-40 md:h-48">
                  <img
                    className="rounded-lg h-full w-full object-cover"
                    src={shop.image_url}
                    alt={shop.name}
                  />
                </div>
                <ul className="border-l-[2px] border-solid border-sun pl-2 font-inter">
                  <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                    {shop.name}
                  </li>
                  <li className="text-xs text-gray-600 line-clamp-2">
                    {shop.description}
                  </li>
                  <li className="text-xs font-normal truncate">
                    {shop.address}
                  </li>
                </ul>

                <div className="flex gap-1">
                  <Link
                    to={`/shop/${shop.id}/products`}
                    className="flex-1 bg-sun p-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white  transition-colors duration-200"
                  >
                    Products
                  </Link>
                  <Link
                    to={`/shop/${shop.id}/step1`}
                    className="flex-1 bg-sun p-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white  transition-colors duration-200"
                  >
                    Purchase Ad
                  </Link>
                </div>

                <div className="flex justify-between gap-1">
                  <Link
                    to={`/editShop/${shop.id}/edit-shop`}
                    className="bg-sun p-1 flex-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white transition-colors duration-200"
                  >
                    Edit Shop
                  </Link>
                  <button
                    onClick={() => toggleDel(shop.id)}
                    className="bg-ash text-white p-1 flex-1 text-xs font-bold text-center hover:bg-red-600 active:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="font-inter text-base md:text-lg font-normal text-gray-700">
              Empty space, endless possibilities—create your shop now
            </p>
          </div>
        )}
      </div>

      {/* Authentication Status */}
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
              className="font-inter font-semibold text-xs md:text-sm flex items-center gap-2"
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

      {/* Delete Component */}
      <Delete
        delIsOpen={delIsOpen}
        toggleDel={toggleDel}
        shop_id={selectedShopId}
        entityName="shop"
      />
    </section>
  );
};

export default MyShop;
