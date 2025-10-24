import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops } from "../../redux/shopSlice";
import SkeletonLoader from "../loaders/skeletonLoader";
import ErrorDisplay from "../common/ErrorDisplay";

const ShopCard = () => {
  const dispatch = useDispatch();
  const { shops, status, error } = useSelector((state) => state.shops);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  // For future debugging if needed
  /*
  useEffect(() => {
    if (status === "succeeded" && shops) {
      console.log("Shop data loaded:", shops);
      
      // Determine the data format
      const isArrayFormat = Array.isArray(shops);
      const isObjectFormat = !isArrayFormat && typeof shops === 'object' && 
                            (Array.isArray(shops.for_you) || Array.isArray(shops.sponsored_shops));
      
      const shopCount = isArrayFormat ? shops.length : 
                     (isObjectFormat ? 
                      (Array.isArray(shops.for_you) ? shops.for_you.length : 0) + 
                      (Array.isArray(shops.sponsored_shops) ? shops.sponsored_shops.length : 0) : 0);
      
      console.log({
        hasData: Boolean(shops),
        shopCount,
        dataFormat: isArrayFormat ? "array" : (isObjectFormat ? "object" : "unknown")
      });
    }
  }, [shops, status]);
  */

  if (error) {
    return <ErrorDisplay message={error} center={true} />;
  }

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
       <div className="mt-28 mb-20 flex flex-col px-4 md:px-7 gap-5 md:gap-7 lg:px-20">
        {/* Title */}
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center lg:w-[70%] mx-auto">
          <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
            Welcome to <span className="text-lily">Lily Shops</span>
          </h1>
        </div>

        {/* Debug Panel */}
        {/*
      {status === "succeeded" && (
        <div className="w-full p-3 bg-gray-100 rounded border text-xs">
          <p>Status: {status}</p>
          <p>Data Format: {Array.isArray(shops) ? "array" : "object"}</p>
          <p>Shop Count: {processedShops.length}</p>
        </div>
      )}
      */}

        {/* For You Section */}
        <div className="flex flex-col items-start gap-3 w-full">
          <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-[2px] border-solid border-sun">
            For You
          </h2>

          {status === "loading" ? (
            <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 w-full">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonLoader key={index} />
              ))}
            </div>
          ) : !hasShops ? (
            <div className="w-full text-center py-10">
              <p className="text-ash">No shops available right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 w-full">
              {processedShops.map((shop) => (
                <Link
                  to={`/shop/${shop.id}`}
                  key={shop.id}
                  className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200">
                  <div className="relative w-full h-40 md:h-48">
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
                    <button className="text-xs underline text-lily hover:text-black">
                      View Details
                    </button>
                  </ul>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopCard;
