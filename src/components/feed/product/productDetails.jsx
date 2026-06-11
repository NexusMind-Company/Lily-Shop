import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useFeed } from "../../../hooks/useFeed";
import ProductItem from "./productItem";
import { fetchProductDetails, fetchContentById } from "../../../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const { posts } = useFeed();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to find the product in the loaded feed data.
  // It could be a direct product post, OR a content post that links to a product.
  const productFromContext = posts.find(
    (p) => String(p.id) === id || String(p.product?.id) === id,
  );

  const actualProduct =
    productFromContext?.type?.toLowerCase() === "product" ||
    productFromContext?.price_in_naira
      ? productFromContext
      : productFromContext?.product;

  // Fetch from real API if not found in context (e.g., direct navigation / page reload)
  const {
    data: productFromApi,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      // If we have an itemType hint, try that first
      const preferredType = location.state?.itemType;

      if (preferredType === "content") {
        try {
          return await fetchContentById(id);
        } catch (e) {
          return await fetchProductDetails(id);
        }
      }

      try {
        // Default: try product detail first
        return await fetchProductDetails(id);
      } catch (e) {
        // Fallback: try content detail
        try {
          return await fetchContentById(id);
        } catch (e2) {
          throw e; // throw original error if both fail
        }
      }
    },
    enabled: !actualProduct,
  });

  // If the product comes from content, it might be nested
  const resolvedProduct = productFromApi?.product || productFromApi;
  const product = actualProduct || resolvedProduct;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen bg-white">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-lily text-white rounded-lg font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    // Added overflow-y-auto to fix the desktop scrolling issue
    <div className="flex bg-gray-50 flex-col items-center w-full h-full min-h-screen overflow-y-auto">
      <ProductItem product={product} />
    </div>
  );
};

export default ProductDetails;
