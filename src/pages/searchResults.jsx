import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchShops } from "../store/shopSlice";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { shops, status } = useSelector((state) => state.shops);
  const dispatch = useDispatch();

  const searchQuery = searchParams.get("q") || "";
  const categoryQuery = searchParams.get("category") || "";

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  // Update selected category when categoryQuery changes
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    } else {
      setSelectedCategory("");
    }
  }, [categoryQuery]);

  // Filter results based on search query and category
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

  /*console.log("SearchResults rendered with:", {
    shopsLength: shops?.length,
    searchQuery,
    categoryQuery,
    selectedCategory,
    resultsLength: results.length,
  });*/

  return (
    <div className="mt-10 min-h-screen flex flex-col px-4 md:px-7 items-center max-w-4xl mx-auto overflow-hidden z-50">
      <div className="flex flex-col md:flex-row justify-between items-start mb-5">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : categoryQuery
            ? `Products in "${categoryQuery}"`
            : "All Products"}
        </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {results.map((shop) => (
            <Link to={`/product/${shop.id}`} key={shop.id}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {shop.image && (
                  <img
                    src={shop.image_url}
                    alt={shop.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-2">{shop.name}</h2>
                  {shop.category && (
                    <span className="inline-block px-1 py-1 text-xs bg-gray-100 text-gray-700 rounded mb-2">
                      {shop.category}
                    </span>
                  )}
                  <p className="text-gray-700 mb-2 line-clamp-2 text-sm">
                    {shop.description}
                  </p>
                  <p className="font-bold text-lily">{shop.price}</p>
                  {shop.tags && shop.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {shop.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
