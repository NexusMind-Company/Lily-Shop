import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops } from "../../redux/shopSlice";
import SkeletonLoader from "../loaders/skeletonLoader";

const ShopCard = () => {
  const dispatch = useDispatch();
  const { shops, status } = useSelector((state) => state.shops);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  let processedShops = [];

  if (status === "succeeded" && shops) {
    if (Array.isArray(shops)) {
      processedShops = shops.map((shop) => ({
        ...shop,
        isSponsored: false,
      }));
    } else if (typeof shops === "object") {
      const sponsoredShops = Array.isArray(shops.sponsored_shops)
        ? shops.sponsored_shops.map((shop) => ({ ...shop, isSponsored: true }))
        : [];

      const forYouShops = Array.isArray(shops.for_you)
        ? shops.for_you.map((shop) => ({ ...shop, isSponsored: false }))
        : [];

      processedShops = [...sponsoredShops, ...forYouShops];
    }
  }

  const hasShops = processedShops.length > 0;

  return (
    <section className="bg-white min-h-screen relative w-full overflow-hidden md:w-4xl md:mx-auto">
      <div className="mt-24 mb-20 flex flex-col px-4 md:px-7 gap-5 md:gap-7 lg:px-20">

               {/* Title Section */}
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center lg:w-[70%] mx-auto">
          <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
            Welcome to <span className="text-lily">Lily Shops</span>
          </h1>
        </div>

        {/* My Shop Section */}
        <div className="flex flex-col items-start gap-3 w-full mt-6">
          <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-[2px] border-solid border-sun">
            My Shop
          </h2>

          {status === "loading" ? (
            <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 w-full">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonLoader key={index} />
              ))}
            </div>
          ) : !hasShops ? (
            <div className="w-full text-center py-10">
              <p className="text-ash">No shops available right now. Create yours today!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
              {processedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex flex-col gap-2 md:gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative w-full h-40 md:h-44">
                    <img
                      className="rounded-lg h-full w-full object-cover"
                      src={shop.image_url}
                      alt={shop.name}
                    />
                    {shop.isSponsored && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                        Sponsored
                      </span>
                    )}
                  </div>

                  <ul className="border-l-2 border-sun pl-2 font-inter">
                    <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                      {shop.name}
                    </li>
                    <li className="text-xs text-gray-600 line-clamp-2">{shop.description}</li>
                    <li className="text-xs font-normal truncate">{shop.address}</li>
                    <Link
                      to={`/shop/${shop.id}`}
                      className="text-xs underline text-lily hover:text-black"
                    >
                      View Prices
                    </Link>
                  </ul>

                  <div className="flex gap-2 mt-2">
                    <Link
                      to={`/edit-shop/${shop.id}`}
                      className="bg-[#FFA94D] text-white text-xs px-3 py-1 rounded hover:bg-[#ff922b] transition-colors"
                    >
                      Edit Shop
                    </Link>
                    <button className="bg-gray-600 text-white text-xs px-3 py-1 rounded hover:bg-gray-800 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Shortcut */}
        <div className="flex justify-center mt-6">
          <Link
            to="/createShop"
            className="flex items-center gap-1 text-black hover:text-lily font-poppins font-medium text-sm rounded-xl bg-gray-200 px-4 py-2"
          >
            Create New <span className="text-lily text-lg font-bold">+</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopCard;
