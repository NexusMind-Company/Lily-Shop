import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { resetDeleteShopState } from "../../redux/deleteShopSlice";
import Delete from "./delete";
import MyShopSkeleton from "../loaders/myShopSkeleton";
import ErrorDisplay from "../common/ErrorDisplay";

const MyShop = () => {
  const [delIsOpen, setDelIsOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    shops,
    status: fetchShopsStatus,
    error: fetchShopsError,
  } = useSelector((state) => state.profile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { deleteStatus: currentDeleteShopStatus } = useSelector(
    (state) => state.deleteShop
  );
  const shopDeleteActuallySucceeded = currentDeleteShopStatus === "succeeded";
  const [shopDeleteSuccessMsg, setShopDeleteSuccessMsg] = useState("");

  const toggleDel = (shop_id = null) => {
    setSelectedShopId(shop_id);
    setDelIsOpen((prev) => !prev);
    if (delIsOpen) {
      setShopDeleteSuccessMsg("");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (fetchShopsStatus === "idle" || fetchShopsStatus === "failed") {
      dispatch(fetchProfile());
    }
  }, [dispatch, fetchShopsStatus, isAuthenticated, navigate]);

  useEffect(() => {
    if (shopDeleteActuallySucceeded) {
      setShopDeleteSuccessMsg("Shop deleted successfully!");
      setDelIsOpen(false);
      setSelectedShopId(null);
      dispatch(resetDeleteShopState());

      const timer = setTimeout(() => {
        setShopDeleteSuccessMsg("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shopDeleteActuallySucceeded, dispatch]);

  useEffect(() => {
    if (
      !delIsOpen &&
      (currentDeleteShopStatus === "succeeded" ||
        currentDeleteShopStatus === "failed")
    ) {
      dispatch(fetchProfile());
    }
  }, [delIsOpen, currentDeleteShopStatus, dispatch]);

  return (
    <section className="mt-28 mb-24 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
      {/* Header */}
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Welcome to <span className="text-lily">My Shop</span>
        </h1>
      </div>

      {/* Shop Deletion Success Message */}
      {shopDeleteSuccessMsg && (
        <div className="w-full my-3 p-3 text-green-700 bg-green-100 rounded-md border border-green-300 text-center">
          {shopDeleteSuccessMsg}
        </div>
      )}

      {fetchShopsStatus === "failed" && fetchShopsError && (
        <div className="w-full my-3">
          <ErrorDisplay
            message={
              typeof fetchShopsError === "string"
                ? fetchShopsError
                : fetchShopsError.message || "Could not fetch your shops."
            }
            center={true}
          />
        </div>
      )}

      {/* Shop Display */}
      <div className="flex flex-col items-start gap-3 w-full">
        <div className="flex items-center justify-between w-full mb-3">
          <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-[2px] border-solid border-sun">
            My Shops
          </h2>
          {isAuthenticated && (
            <Link
              to="/createShop"
              className="bg-lily text-white font-semibold text-xs px-3 py-2 rounded-md hover:bg-lily-dark transition-colors flex items-center gap-1.5"
            >
              <img
                src="/addition.svg"
                alt="add shop"
                className="w-3.5 h-3.5 filter brightness-0 invert"
              />
              Create Shop
            </Link>
          )}
        </div>

        {fetchShopsStatus === "loading" && (!shops || shops.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <MyShopSkeleton key={index} />
            ))}
          </div>
        ) : fetchShopsStatus === "succeeded" && shops && shops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200 bg-white rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="w-full h-40 md:h-48">
                  {shop.image_url ? (
                    <img
                      className="h-full w-full object-cover"
                      src={shop.image_url}
                      alt={shop.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <ul className="border-l-[2px] border-solid border-sun pl-2 font-inter mb-2">
                    <li
                      className="text-sm text-green-600 font-bold font-poppins uppercase truncate"
                      title={shop.name}
                    >
                      {shop.name}
                    </li>
                    <li
                      className="text-xs text-gray-600 line-clamp-2"
                      title={shop.description}
                    >
                      {shop.description || "No description"}
                    </li>
                    <li
                      className="text-xs font-normal text-gray-500 truncate"
                      title={shop.address}
                    >
                      {shop.address || "No address"}
                    </li>
                  </ul>

                  <div className="flex gap-1 mb-1">
                    <Link
                      to={`/shop/${shop.id}/products`}
                      className="flex-1 bg-sun p-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white  transition-colors duration-200 rounded-sm"
                    >
                      Products
                    </Link>
                    <Link
                      to={`/shop/${shop.id}/step1`}
                      className="flex-1 bg-blue-500 text-white p-1 text-xs font-bold text-center hover:bg-blue-600 active:bg-blue-700  transition-colors duration-200 rounded-sm"
                    >
                      Ads
                    </Link>
                  </div>
                  <div className="flex justify-between gap-1">
                    <Link
                      to={`/editShop/${shop.id}/edit-shop`}
                      className="bg-gray-200 p-1 flex-1 text-xs font-bold text-center hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200 rounded-sm"
                    >
                      Edit Shop
                    </Link>
                    <button
                      onClick={() => toggleDel(shop.id)}
                      className="bg-red-500 text-white p-1 flex-1 text-xs font-bold text-center hover:bg-red-600 active:bg-red-700 transition-colors duration-200 rounded-sm disabled:opacity-50"
                      disabled={
                        currentDeleteShopStatus === "loading" &&
                        selectedShopId === shop.id
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchShopsStatus === "succeeded" &&
          (!shops || shops.length === 0) ? (
          <div className="text-center py-10 w-full">
            <p className="font-inter text-base md:text-lg font-normal text-gray-600 mb-2">
              You haven&apos;t created any shops yet.
            </p>
            <p className="text-sm text-gray-400">
              Click the &quot;Create Shop&quot; button to get started.
            </p>
          </div>
        ) : null}
      </div>

      {/* Fallback for non-authenticated users, though useEffect handles redirect */}
      {!isAuthenticated && fetchShopsStatus !== "loading" && (
        <div className="flex flex-col items-center justify-center w-full text-center py-10">
          <p className="text-gray-500 mb-4">
            Please log in to view and manage your shops.
          </p>
          <Link
            to="/login"
            className="bg-lily text-white font-semibold px-6 py-2 rounded hover:bg-lily-dark transition-colors"
          >
            Go to Login
          </Link>
        </div>
      )}

      {delIsOpen && selectedShopId && (
        <Delete
          delIsOpen={delIsOpen}
          toggleDel={toggleDel}
          shop_id={selectedShopId}
          entityName="shop"
        />
      )}
    </section>
  );
};

export default MyShop;
