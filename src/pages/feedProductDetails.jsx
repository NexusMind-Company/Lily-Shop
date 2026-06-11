// src/pages/feedProductDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ProductDetails from "../components/feed/product/productDetails";
import { useFeed } from "../hooks/useFeed";
import { addToCart } from "../redux/cartSlice";
import { api } from "../services/api";
import { toast } from "react-hot-toast";

const FeedProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts } = useFeed();

  // Find product in feed context or fetch from API
  const product = posts.find((p) => String(p.id) === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
        <p className="text-gray-500 mb-6 text-lg">Product not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-lily text-white rounded-xl font-bold shadow-lg shadow-lily/20 active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAddToCart = async (product, quantity) => {
    try {
      const response = await api.post("/orders/cart/add/", {
        product_id: product.id,
        quantity: quantity,
      });

      // Update Redux cart
      dispatch(addToCart(response.data));
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleBuyNow = (product, quantity) => {
    navigate("/checkout", {
      state: {
        directBuy: true,
        product: product,
        quantity: quantity,
      },
    });
  };

  const handleMessageSeller = () => {
    navigate(
      `/messages/new?seller=${product.user?.id || product.seller?.id}&product=${product.id}`,
    );
  };

  const handleNavigateToShop = () => {
    if (product.shop?.id) {
      navigate(`/shop/${product.shop.id}`);
    }
  };

  return (
    <ProductDetails
      product={product}
      onBack={() => navigate(-1)}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      onMessageSeller={handleMessageSeller}
      onNavigateToShop={handleNavigateToShop}
    />
  );
};

export default FeedProductDetails;
