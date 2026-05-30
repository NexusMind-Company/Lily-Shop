import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchShopDetails } from "../../services/api";
import { useSelector } from "react-redux";
import { selectCartItems } from "../../redux/cartSlice";
import { ChevronLeft, MapPin, Loader2, Store, AlertCircle } from "lucide-react";

const PickupAddress = () => {
  const navigate = useNavigate();

  // Get cart items from Redux to find out which shop we are buying from
  const cartItems = useSelector(selectCartItems);

  // We assume all items in the cart are from the same shop.
  // We grab the shop ID from the first item.
  const shopId = cartItems.length > 0 ? cartItems[0].shop : null;

  const {
    data: shop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopDetails", shopId],
    queryFn: () => fetchShopDetails(shopId),
    enabled: !!shopId, // Only run query if we have a shop ID
  });

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center shrink-0">
        <button
          onClick={() => navigate("/checkout")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Pickup Location</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <Loader2 size={32} className="text-lily animate-spin" />
          <p className="text-gray-500 mt-3">Loading shop location...</p>
        </div>
      )}

      {/* Error / No Shop State */}
      {(!shopId || error) && !isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <AlertCircle size={48} className="text-gray-300 mb-4 mx-auto" />
          <p className="text-gray-500">
            {error
              ? "Unable to load shop details."
              : "Your cart is empty or missing shop information."}
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="mt-4 text-lily font-semibold"
          >
            Go to Feed
          </button>
        </div>
      )}

      {/* Shop Details State */}
      {shop && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Pickup from this store:
            </h3>

            <div className="flex items-start space-x-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gray-100 p-2 rounded-full">
                <Store size={24} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{shop.name}</h4>
                <div className="flex items-start mt-2 text-gray-600">
                  <MapPin size={16} className="mt-1 mr-1 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">
                    {shop.address || "No address provided by shop owner."}
                  </p>
                </div>
                {shop.owner_phone && (
                  <p className="text-sm text-gray-500 mt-2">
                    Contact: {shop.owner_phone}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-blue-600 mt-3">
              * Please arrive during business hours. Contact the shop owner if
              you have trouble locating the store.
            </p>
          </div>
        </div>
      )}

      {/* Footer Button */}
      {shop && (
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={() => {
              // Since the location is fixed to the shop, we just confirm and go back
              // You might want to save the 'pickup' choice in global state here if needed
              navigate("/checkout");
            }}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
          >
            Confirm Pickup Location
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupAddress;
