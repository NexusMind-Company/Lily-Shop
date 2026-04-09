import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Heart, Package, ImageIcon } from "lucide-react";
import { searchProducts } from "../../redux/searchSlice";
import SkeletonLoader from "../loaders/skeletonLoader";

const isProductResult = (item) =>
  item?.price_in_naira !== undefined ||
  item?.price_kobo !== undefined ||
  item?.name !== undefined;

const getPrimaryMedia = (item) =>
  item?.all_media_urls?.[0] ||
  item?.image_url ||
  item?.media_url ||
  (Array.isArray(item?.media) ? item.media[0]?.src || item.media[0] : item?.media) ||
  "/shop.png";

const formatPrice = (item) => {
  if (item?.price_in_naira !== undefined && item?.price_in_naira !== null) {
    return Number(item.price_in_naira).toLocaleString();
  }

  if (item?.price_kobo !== undefined && item?.price_kobo !== null) {
    return (Number(item.price_kobo) / 100).toLocaleString();
  }

  if (item?.price !== undefined && item?.price !== null) {
    return Number(item.price).toLocaleString();
  }

  return null;
};

const formatNaira = (item) => {
  const amount = formatPrice(item);
  return amount ? `${"\u20A6"}${amount}` : null;
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { results, status } = useSelector((state) => state.search);
  const [imageLoading, setImageLoading] = useState({});
  const [statusNotice, setStatusNotice] = useState(null);

  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchProducts(searchQuery));
    }
  }, [searchQuery, dispatch]);

  const { products, contents } = useMemo(() => {
    const safeResults = Array.isArray(results) ? results : [];
    return {
      products: safeResults.filter(isProductResult),
      contents: safeResults.filter((item) => !isProductResult(item)),
    };
  }, [results]);

  const handleImageLoad = (id) => {
    setImageLoading((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const flashNotice = (message) => {
    setStatusNotice(message);
    window.setTimeout(() => setStatusNotice(null), 2500);
  };

  const handleContentClick = (content) => {
    if (content.post_type === "SELLING") {
      if (content.product_status === "not_found" || !content.product?.id) {
        flashNotice(content.product_message || "Product not found");
        return;
      }

      navigate(`/product-details/${content.product.id}`);
      return;
    }

    navigate(`/?postId=${content.id}`);
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

  const totalResults = products.length + contents.length;

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-6xl mx-auto overflow-hidden">
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
            {totalResults} results for "{searchQuery}"
          </h1>
        </div>
      </div>

      {statusNotice && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {statusNotice}
        </div>
      )}

      {totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <img
              src="/icons/search.svg"
              alt="Search"
              className="w-12 h-12 opacity-40"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="text-gray-500 max-w-md mt-2">
            We couldn't find any products or posts matching "{searchQuery}".
          </p>
          <Link
            to="/"
            className="mt-6 px-6 py-2.5 bg-lily text-white rounded-full font-medium hover:bg-lily/90 transition-all"
          >
            Back to Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {products.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Package size={18} className="text-lily" />
                <h2 className="text-base font-semibold text-gray-900">
                  Products
                </h2>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
                {products.map((product) => (
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
                        src={getPrimaryMedia(product)}
                        alt={product.name || "Product"}
                        onLoad={() => handleImageLoad(product.id)}
                        onError={(e) => {
                          e.target.src = "/shop.png";
                        }}
                      />

                      {(product.like_count || product.likes_count || 0) > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Heart size={10} className="fill-white text-white" />
                          {product.like_count || product.likes_count}
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {product.name || "Untitled Product"}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {product.shop_name || product.delivery_info || "Product"}
                      </p>
                      <div className="mt-2">
                        <span className="hidden font-bold text-lily text-sm">
                          {formatPrice(product)
                            ? `₦${formatPrice(product)}`
                            : "Price N/A"}
                        </span>
                        <span className="font-bold text-lily text-sm">
                          {formatNaira(product) || "Price N/A"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {contents.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-lily" />
                <h2 className="text-base font-semibold text-gray-900">
                  Posts
                </h2>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
                {contents.map((content) => (
                  <button
                    type="button"
                    key={content.id}
                    onClick={() => handleContentClick(content)}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={getPrimaryMedia(content)}
                        alt={content.caption || "Post"}
                        onError={(e) => {
                          e.target.src = "/shop.png";
                        }}
                      />

                      {content.post_type === "SELLING" &&
                        content.product_status === "not_found" && (
                          <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-center text-[11px] font-semibold text-white">
                            {content.product_message || "Product not found"}
                          </div>
                        )}
                    </div>

                    <div className="p-3">
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        {content.caption || content.product?.name || "Post"}
                      </h3>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {content.post_type === "SELLING"
                          ? content.product_status === "not_found"
                            ? content.product_message || "Product not found"
                            : content.product?.name || "Selling post"
                          : "Content post"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchResults;
