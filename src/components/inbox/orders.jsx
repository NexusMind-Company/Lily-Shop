import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, selectOrders, selectOrderLoading, selectOrderError } from "../../redux/orderSlice";
import { Link } from "react-router-dom";
import { ChevronLeft, Package, Send } from "lucide-react";
import BottomNav from "./bottomNav";
import ReviewModal from "../common/ReviewModal";
import { shopaMyDeliveries } from "../../services/api";

const Orders = ({ hideHeader, hideBottomNav }) => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [activePage, setActivePage] = useState("inbox");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const openReviewModal = (vendorId, vendorName) => {
    setReviewTarget({ vendorId, vendorName });
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
  };

  useEffect(() => {
    dispatch(fetchOrders());
    const fetchDeliveries = async () => {
      setLoadingDeliveries(true);
      try {
        const data = await shopaMyDeliveries();
        setDeliveries(data.results || data);
      } catch (err) {
        console.error("Failed to load deliveries:", err);
      } finally {
        setLoadingDeliveries(false);
      }
    };
    fetchDeliveries();
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Refunded":
        return "bg-blue-100 text-blue-700";
      case "Canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getOrderImage = (order) => {
    return (
      order.image ||
      order.product?.image ||
      order.product_image ||
      order.product?.thumbnail ||
      order.items?.[0]?.product?.image_url ||
      order.items?.[0]?.product?.media ||
      order.items?.[0]?.product?.all_media_urls?.[0] ||
      order.items?.[0]?.menu_item?.image_url ||
      order.items?.[0]?.menu_item?.media ||
      order.items?.[0]?.menu_item?.all_media_urls?.[0] ||
      null
    );
  };

  return (
    <div className={`bg-white relative w-full overflow-y-auto md:w-4xl md:mx-auto pb-24 ${hideHeader ? 'h-auto' : 'h-[100dvh]'}`}>
      {/* Header */}
      {!hideHeader && (
        <header className="relative p-4">
          <Link to="/inbox">
            <ChevronLeft className="absolute w-8 h-8" />
          </Link>
          <h1 className="text-[20px] font-semibold text-center">Orders</h1>
        </header>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "orders" ? "border-lily text-lily" : "border-transparent text-gray-500"
          }`}
        >
          Store Orders
        </button>
        <button
          onClick={() => setActiveTab("parcels")}
          className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "parcels" ? "border-lily text-lily" : "border-transparent text-gray-500"
          }`}
        >
          Sent Parcels
        </button>
      </div>

      <section className="p-4">
        {activeTab === "orders" ? (
          <>
            {/* Loading and error states */}
            {loading && <p className="text-gray-500 text-center">Loading orders...</p>}
            {error && (
              <p className="text-red-700 py-3 border border-red-300 bg-red-100 text-center my-2 rounded-lg">
                {error}
              </p>
            )}
            {!loading && orders.length === 0 && !error && (
              <p className="text-gray-500 text-center text-lg">No store orders found.</p>
            )}

            {/* Orders list */}
            <div className="space-y-4">
          {orders.map((order, i) => {
            const imageUrl = getOrderImage(order);
            const orderId = order.id || order.orderNo || order.reference;
            
            return (
              <div key={orderId || i} className="relative group">
                <Link
                  to={`/order/${orderId}`}
                  className="block flex justify-between items-start bg-white p-4 rounded-2xl shadow-sm border border-gray-50/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={order.name || order.product?.name || "Order image"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">
                        {order.meal_plan || order.name || order.product_name || order.product?.name || order.items?.[0]?.product?.name || order.items?.[0]?.menu_item?.name || "Unnamed Product"}
                      </h3>
                      <p className="text-[12px] text-gray-400 font-medium tracking-wide uppercase">
                        Order #{order.reference || order.orderNo || order.order_number || order.id?.substring(0,8)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[13px] text-gray-500 font-medium">
                          Qty: {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.quantity || 1}
                        </span>
                        <span className="text-[13px] text-gray-400 font-medium">•</span>
                        <span className="text-[14px] text-lily font-black">
                          ₦{parseFloat(order.total_amount_naira || (order.total_amount_kobo ? order.total_amount_kobo / 100 : 0) || order.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-[12px] text-gray-400 font-medium">
                          {new Date(order.date || order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {order.status === "Delivered" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openReviewModal(
                        order.product?.vendor_id || order.vendor_id,
                        order.product?.vendor_name || order.vendor_name || order.name || order.product_name || order.items?.[0]?.menu_item?.vendor_name,
                      );
                    }}
                    className="absolute right-4 bottom-4 text-pink-600 text-xs font-bold hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full transition-colors z-10"
                  >
                    Rate
                  </button>
                )}
              </div>
            );
          })}
        </div>
        </>
        ) : (
          <>
            {loadingDeliveries && <p className="text-gray-500 text-center">Loading parcels...</p>}
            {!loadingDeliveries && deliveries.length === 0 && (
              <p className="text-gray-500 text-center text-lg">No parcels found.</p>
            )}
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="relative group bg-white p-4 rounded-2xl shadow-sm border border-gray-50/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-lily/5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Send className="w-6 h-6 text-lily" />
                    </div>
                    <div className="flex flex-col justify-center w-full">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight">
                          To: {delivery.recipient_name}
                        </h3>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            delivery.status === 'pending_payment' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                          {delivery.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400 font-medium tracking-wide uppercase">
                        Delivery #{delivery.id.substring(0,8)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[13px] text-gray-500 font-medium truncate max-w-[200px]">
                          From: {delivery.pickup_address_text}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 border-t border-gray-50 pt-2.5">
                        <span className="text-[14px] text-lily font-black">
                          ₦{(delivery.fee_kobo / 100).toLocaleString()}
                        </span>
                        <p className="text-[12px] text-gray-400 font-medium">
                          {new Date(delivery.created_at || new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {!hideBottomNav && (
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      )}

      <ReviewModal
        isOpen={!!reviewTarget}
        onClose={closeReviewModal}
        vendorId={reviewTarget?.vendorId}
        vendorName={reviewTarget?.vendorName}
      />
    </div>
  );
};

export default Orders;
