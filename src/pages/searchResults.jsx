/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";

const SearchResults = ({ productData = [] }) => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const searchQuery = searchParams.get("q") || "";
  const categoryQuery = searchParams.get("category") || "";

  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    } else {
      setSelectedCategory("");
    }
  }, [productData, categoryQuery]);

  useEffect(() => {
    if (!productData || productData.length === 0) {
      setResults([]);
      return;
    }

    let filteredResults = [...productData];

    if (searchQuery) {
      filteredResults = filteredResults.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.tags &&
            Array.isArray(product.tags) &&
            product.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    const categoryFilter = categoryQuery || selectedCategory;
    if (categoryFilter) {
      filteredResults = filteredResults.filter(
        (product) =>
          product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setResults(filteredResults);
  }, [searchQuery, categoryQuery, selectedCategory, productData]);


  // For debugging
  console.log("SearchResults rendered with:", {
    productDataLength: productData?.length,
    searchQuery,
    categoryQuery,
    selectedCategory,
    resultsLength: results.length,
  });

  return (
    <div className="container mx-auto px-4 py-8 z-50">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : categoryQuery
            ? `Products in "${categoryQuery}"`
            : "All Products"}
        </h1>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
                  {product.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mb-2">
                      {product.category}
                    </span>
                  )}
                  <p className="text-gray-700 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-lily">{product.price}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
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
