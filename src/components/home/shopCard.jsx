import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops } from "../../redux/shopSlice";
import SkeletonLoader from "../loaders/skeletonLoader";

const ShopCard = () => {
  const dispatch = useDispatch();
  const { shops, status, error } = useSelector((state) => state.shops);
  const [debugInfo, setDebugInfo] = useState({
    hasData: false,
    sponsoredCount: 0,
    forYouCount: 0,
    combinedCount: 0
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Enhanced debug logging
    if (status === "succeeded") {
      console.log("Shop Status:", status);
      console.log("Full shops object:", shops);
      console.log("shops.sponsored_shops:", shops?.sponsored_shops);
      console.log("shops.for_you:", shops?.for_you);
      
      const sponsoredShops = Array.isArray(shops?.sponsored_shops) ? shops.sponsored_shops : [];
      const forYouShops = Array.isArray(shops?.for_you) ? shops.for_you : [];
      
      setDebugInfo({
        hasData: shops !== null && shops !== undefined,
        sponsoredCount: sponsoredShops.length,
        forYouCount: forYouShops.length,
        combinedCount: sponsoredShops.length + forYouShops.length
      });
      
      console.log("Debug info:", {
        hasData: shops !== null && shops !== undefined,
        sponsoredCount: sponsoredShops.length,
        forYouCount: forYouShops.length,
        combinedCount: sponsoredShops.length + forYouShops.length
      });
    }
  }, [shops, status]);

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  // Ensure shops is treated as an object even if it's an array
  const shopsObject = shops && typeof shops === 'object' ? shops : {};
  
  // Check if each property exists and is an array, otherwise use empty array
  const sponsoredShops = Array.isArray(shopsObject.sponsored_shops) 
    ? shopsObject.sponsored_shops 
    : [];
    
  const forYouShops = Array.isArray(shopsObject.for_you) 
    ? shopsObject.for_you 
    : [];
  
  // Create the combined shops array
  const combinedShops = status === "succeeded" 
    ? [
        ...sponsoredShops.map(shop => ({ ...shop, isSponsored: true })),
        ...forYouShops.map(shop => ({ ...shop, isSponsored: false }))
      ]
    : [];

  // Check if we have any shops to display
  const hasShops = combinedShops.length > 0;

  return (
    <section className="mt-10 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      {/* Title */}
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Welcome to <span className="text-lily">Lily Shops</span>
        </h1>
      </div>

      {/* Debug Panel (Remove in production) */}
      {status === "succeeded" && (
        <div className="w-full p-3 bg-gray-100 rounded border text-xs">
          <p>Status: {status}</p>
          <p>Has Data: {debugInfo.hasData ? 'Yes' : 'No'}</p>
          <p>Sponsored Shops: {debugInfo.sponsoredCount}</p>
          <p>For You Shops: {debugInfo.forYouCount}</p>
          <p>Combined Shops: {debugInfo.combinedCount}</p>
        </div>
      )}

      {/* For You Section */}
      <div className="flex flex-col items-start gap-3 w-full">
        <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-[2px] border-solid border-sun">
          For You
        </h2>

        {status === "loading" ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : !hasShops ? (
          <div className="w-full text-center py-10">
            <p className="text-gray-500">No shops found. Please check the API response format.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {combinedShops.map((shop) => (
              <Link
                to={`/shop/${shop.id}`}
                key={shop.id}
                className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative w-full h-40 md:h-48">
                  <img
                    className="rounded-lg h-full w-full object-cover"
                    src={shop.image_url}
                    alt={shop.name}
                  />
                  {shop.isSponsored && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                      Ad
                    </span>
                  )}
                </div>
                <ul className="border-l-2 border-sun pl-2 font-inter">
                  <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                    {shop.name}
                  </li>
                  <li className="text-xs text-gray-600 line-clamp-2">
                    {shop.description}
                  </li>
                  <li className="text-xs font-normal truncate">
                    {shop.address}
                  </li>
                  <button className="text-xs underline text-lily hover:text-black">
                    View Details
                  </button>
                </ul>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopCard;