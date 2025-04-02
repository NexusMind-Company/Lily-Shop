import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchShops } from "../../redux/shopSlice";
import SkeletonLoader from "../loaders/skeletonLoader";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageLoading, setImageLoading] = useState({});

  const { shops, status } = useSelector((state) => state.shops);
  const dispatch = useDispatch();

  const searchQuery = searchParams.get("q") || "";
  const categoryQuery = searchParams.get("category") || "";

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    } else {
      setSelectedCategory("");
    }
  }, [categoryQuery]);

  useEffect(() => {
    if (!shops || shops.length === 0) {
      setResults([]);
      return;
    }

    let filteredResults = [...shops];

    if (searchQuery) {
      filteredResults = filteredResults.filter(
        (shop) =>
          shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (shop.products &&
            Array.isArray(shop.products) &&
            shop.products.some((product) =>
              product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )) ||
          (shop.tags &&
            Array.isArray(shop.tags) &&
            shop.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    const categoryFilter = categoryQuery || selectedCategory;
    if (categoryFilter) {
      filteredResults = filteredResults.filter(
        (shop) => shop.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setResults(filteredResults);
  }, [searchQuery, categoryQuery, selectedCategory, shops]);

  const handleImageLoad = (shopId) => {
    setImageLoading((prev) => ({
      ...prev,
      [shopId]: false,
    }));
  };

  if (status === "loading") {
    return (
      <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
        <div className="flex flex-col items-start gap-1">
          <div className="text-sm">
            <Link to="/" className="pr-0.5 hover:underline">
              HOME
            </Link>
            <span>/</span>
            <Link
              to="/searchResults"
              className="text-lily pl-0.5 hover:underline"
            >
              RESULTS
            </Link>
          </div>
          <div>
            <h1 className="text-xs md:text-base font-medium font-inter text-left text-ash">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : categoryQuery
                ? `Products in "${categoryQuery}"`
                : "All Products"}
            </h1>
          </div>
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
    <section className="mt-10 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      {/* Navigation */}
      <div className="flex flex-col items-start gap-1">
        <div className="text-sm">
          <Link to="/" className="pr-0.5 hover:underline">
            HOME
          </Link>
          <span>/</span>
          <Link
            to="/searchResults"
            className="text-lily pl-0.5 hover:underline"
          >
            RESULTS
          </Link>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xs md:text-base font-medium font-inter text-left text-ash">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : categoryQuery
              ? `Products in "${categoryQuery}"`
              : "All Products"}
          </h1>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center pb-10">
          <p className="text-lg mb-4">
            {searchQuery
              ? `No products found matching "${searchQuery}"`
              : categoryQuery
              ? `No products found in category "${categoryQuery}"`
              : "No products available"}
          </p>
          <Link to="/" className="text-lily hover:underline">
            Return to homepage
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
          {results.map((shop) => (
            <Link
              to={`/product/${shop.id}`}
              key={shop.id}
              className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg hover:rounded-2xl hover:pb-3 transition-shadow duration-200"
            >
              <div className="w-full h-40 md:h-48 relative">
                {imageLoading[shop.id] !== false && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
                <img
                  className={`rounded-lg h-full w-full object-cover transition-opacity duration-300 ${
                    imageLoading[shop.id] !== false
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                  src={shop.image_url}
                  alt={shop.name}
                  onLoad={() => handleImageLoad(shop.id)}
                />
              </div>
              <ul className="border-l-[2px] border-solid border-sun pl-2 font-inter">
                <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                  {shop.name}
                </li>
                <li className="text-xs text-gray-600 line-clamp-2">
                  {shop.description}
                </li>
                <li className="text-xs font-normal truncate">{shop.address}</li>
                <button className="text-xs underline text-lily hover:text-black">
                  View Prices
                </button>
              </ul>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchResults;
