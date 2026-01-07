import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProducts } from "../../redux/searchSlice";
import SkeletonLoader from "../loaders/skeletonLoader";
import { Heart } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Select results from the new search slice
  const { results, status } = useSelector((state) => state.search);
  const [imageLoading, setImageLoading] = useState({});

  const searchQuery = searchParams.get("q") || "";

  // Dispatch the product search when the query changes
  useEffect(() => {
    if (searchQuery) {
      dispatch(searchProducts(searchQuery));
    }
  }, [searchQuery, dispatch]);

  const handleImageLoad = (id) => {
    setImageLoading((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  if (status === "loading") {
    return (
      <section className="mt-28 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-6xl mx-auto overflow-hidden">
        <div className="flex flex-col items-start gap-1">
          <div className="text-sm">
            <Link to="/" className="pr-0.5 hover:underline text-gray-500">
              HOME
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-lily pl-0.5 font-medium">SEARCH</span>
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Searching for "{searchQuery}"...
          </h1>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-6xl mx-auto overflow-hidden">
      {/* Navigation & Header */}
      <div className="flex flex-col items-start gap-1">
        <div className="text-sm">
          <Link to="/" className="pr-0.5 hover:underline text-gray-500">
            HOME
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-lily pl-0.5 font-medium">RESULTS</span>
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            {results.length} results for "{searchQuery}"
          </h1>
        </div>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <img
              src="/icons/search.svg"
              alt="Search"
              className="w-12 h-12 opacity-40"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No products found
          </h3>
          <p className="text-gray-500 max-w-md mt-2">
            We couldn't find any products matching "{searchQuery}". Try
            searching for different keywords.
          </p>
          <Link
            to="/"
            className="mt-6 px-6 py-2.5 bg-lily text-white rounded-full font-medium hover:bg-lily/90 transition-all"
          >
            Back to Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
          {results.map((product) => (
            <Link
              to={`/product-details/${product.id}`}
              key={product.id}
              className="group block relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {imageLoading[product.id] !== false && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <img
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    imageLoading[product.id] !== false
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                  src={
                    Array.isArray(product.media)
                      ? product.media[0]?.src
                      : product.image_url || product.media || "/shop.png"
                  }
                  alt={product.name}
                  onLoad={() => handleImageLoad(product.id)}
                  onError={(e) => {
                    e.target.src = "/shop.png";
                  }}
                />

                {/* Like Count Overlay */}
                {product.likes_count > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Heart size={10} className="fill-white text-white" />
                    {product.likes_count}
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-medium text-gray-900 truncate text-sm">
                  {product.name || "Untitled Product"}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {product.description || "No description available"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-lily text-sm">
                    {product.price
                      ? `₦${Number(product.price).toLocaleString()}`
                      : "Price N/A"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchResults;
